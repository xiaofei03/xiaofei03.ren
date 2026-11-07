import { createCipheriv, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  financeCategories,
  financeProviders,
  type Discipline,
  type FinanceAccount,
  type FinanceCategory,
  type FinanceOverview,
  type FinanceProvider,
  type FinanceSnapshot,
  type FinanceTargets,
  type FinanceWeights,
} from "@/app/finance/types";
import { apiError } from "./security";
import { dataDirectory, database } from "./storage";

const noStore = { "Cache-Control": "no-store" };
export function financeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") return Response.json({ error: "请先登录站主账号。" }, { status: 401, headers: noStore });
  if (error instanceof Error && error.message === "REVISION") return Response.json({ error: "内容已在别处更新，请重新载入后再修改。" }, { status: 409, headers: noStore });
  return apiError(error);
}
export function financeJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

const providers = new Set<string>(financeProviders);
const categories = new Set<string>(financeCategories);

function ensureSchema() {
  database().exec(`
    CREATE TABLE IF NOT EXISTS finance_discipline(id INTEGER PRIMARY KEY CHECK(id=1), enabled INTEGER NOT NULL, revision INTEGER NOT NULL, rules_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS finance_targets(id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, weights_json TEXT);
    CREATE TABLE IF NOT EXISTS finance_connections(provider TEXT PRIMARY KEY, connected INTEGER NOT NULL, label TEXT NOT NULL, masked_key TEXT, secret_blob TEXT, scope TEXT, last_synced_at TEXT, last_error TEXT, warnings_json TEXT NOT NULL, total_usd REAL);
    CREATE TABLE IF NOT EXISTS finance_holdings(id TEXT PRIMARY KEY, provider TEXT NOT NULL, symbol TEXT NOT NULL, name TEXT NOT NULL, quantity TEXT NOT NULL, value_usd REAL, average_cost_usd REAL, category TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS finance_transactions(provider TEXT NOT NULL, id TEXT NOT NULL, symbol TEXT NOT NULL, status TEXT NOT NULL, side TEXT NOT NULL, quantity TEXT NOT NULL, price_usd REAL, amount_usd REAL, occurred_at TEXT NOT NULL, PRIMARY KEY(provider, id));
    CREATE TABLE IF NOT EXISTS finance_snapshots(day TEXT NOT NULL, provider TEXT NOT NULL, total_usd REAL NOT NULL, PRIMARY KEY(day, provider));
  `);
}

function keyPath() { return path.join(dataDirectory, "finance-secret.key"); }
function secretKey() {
  ensureSchema();
  if (!existsSync(keyPath())) writeFileSync(keyPath(), randomBytes(32), { mode: 0o600, flag: "wx" });
  const key = readFileSync(keyPath());
  if (key.length !== 32) throw new Error("投资账户密钥材料无效。");
  return key;
}
function seal(apiKey: string, apiSecret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ apiKey, apiSecret }), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}
function isProvider(value: string): value is FinanceProvider { return providers.has(value); }
function isCategory(value: string): value is FinanceCategory { return categories.has(value); }

function defaultDiscipline(): Discipline { return { enabled: true, revision: 0, rules: [] }; }
export function readDiscipline(): Discipline {
  ensureSchema();
  const row = database().prepare("SELECT enabled, revision, rules_json FROM finance_discipline WHERE id=1").get() as { enabled: number; revision: number; rules_json: string } | undefined;
  if (!row) return defaultDiscipline();
  const rules = JSON.parse(row.rules_json) as Discipline["rules"];
  return { enabled: row.enabled === 1, revision: row.revision, rules };
}

export function saveDiscipline(input: unknown): Discipline {
  if (!input || typeof input !== "object") throw new Error("铁律格式无效。");
  const body = input as { enabled?: unknown; revision?: unknown; rules?: unknown };
  if (typeof body.enabled !== "boolean" || !Number.isInteger(body.revision) || Number(body.revision) < 0 || !Array.isArray(body.rules) || body.rules.length > 20) throw new Error("铁律格式无效。");
  const seen = new Set<string>();
  const rules = body.rules.map(rule => {
    if (!rule || typeof rule !== "object") throw new Error("每条铁律请写 1–80 个字符。");
    const item = rule as { id?: unknown; text?: unknown; enabled?: unknown };
    const text = typeof item.text === "string" ? item.text.trim() : "";
    if (typeof item.id !== "string" || !item.id || item.id.length > 80 || seen.has(item.id) || !text || text.length > 80 || typeof item.enabled !== "boolean") throw new Error("每条铁律请写 1–80 个字符。");
    seen.add(item.id);
    return { id: item.id, text, enabled: item.enabled };
  });
  const db = database();
  ensureSchema();
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = readDiscipline();
    if (current.revision !== Number(body.revision)) throw new Error("REVISION");
    const next = { enabled: body.enabled, revision: current.revision + 1, rules };
    db.prepare("INSERT INTO finance_discipline(id, enabled, revision, rules_json) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled, revision=excluded.revision, rules_json=excluded.rules_json").run(next.enabled ? 1 : 0, next.revision, JSON.stringify(next.rules));
    db.exec("COMMIT");
    return next;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readTargets(): FinanceTargets {
  ensureSchema();
  const row = database().prepare("SELECT revision, weights_json FROM finance_targets WHERE id=1").get() as { revision: number; weights_json: string | null } | undefined;
  if (!row) return { revision: 0, weights: null };
  return { revision: row.revision, weights: row.weights_json ? JSON.parse(row.weights_json) as FinanceWeights : null };
}

export function saveTargets(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("请填写三类资产的目标比例，合计为100%。");
  const body = input as { revision?: unknown; weights?: unknown };
  const weights = body.weights as Partial<FinanceWeights> | undefined;
  const values = [weights?.us_stocks, weights?.nasdaq, weights?.cash].map(Number);
  if (!Number.isInteger(body.revision) || values.some(value => !Number.isFinite(value) || value < 0 || value > 100) || Math.abs(values.reduce((sum, value) => sum + value, 0) - 100) > 0.01) throw new Error("请填写三类资产的目标比例，合计为100%。");
  const db = database();
  ensureSchema();
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = readTargets();
    if (current.revision !== Number(body.revision)) throw new Error("REVISION");
    const next = { revision: current.revision + 1, weights: { us_stocks: values[0], nasdaq: values[1], cash: values[2] } };
    db.prepare("INSERT INTO finance_targets(id, revision, weights_json) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, weights_json=excluded.weights_json").run(next.revision, JSON.stringify(next.weights));
    db.exec("COMMIT");
    return next;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

type ConnectionRow = {
  provider: string; connected: number; masked_key: string | null; scope: string | null;
  last_synced_at: string | null; last_error: string | null; warnings_json: string; total_usd: number | null;
};

function accountFrom(provider: FinanceProvider, row?: ConnectionRow): FinanceAccount {
  return {
    provider,
    connected: row?.connected === 1,
    totalUsd: row?.total_usd ?? null,
    maskedKey: row?.connected === 1 ? row.masked_key : null,
    scope: row?.scope ?? null,
    lastSyncedAt: row?.last_synced_at ?? null,
    warnings: row ? JSON.parse(row.warnings_json) as string[] : [],
    lastError: row?.last_error ?? null,
  };
}

function maskKey(apiKey: string) {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) return "••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export function saveConnection(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("连接没有完成。");
  const body = input as { provider?: unknown; action?: unknown; apiKey?: unknown; apiSecret?: unknown; label?: unknown; readOnlyConfirmed?: unknown };
  if (typeof body.provider !== "string" || !isProvider(body.provider)) throw new Error("不支持的账户。");
  ensureSchema();
  const db = database();
  if (body.action === "disable") {
    db.prepare("UPDATE finance_connections SET connected=0, secret_blob=NULL, masked_key=NULL WHERE provider=?").run(body.provider);
    return;
  }
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const apiSecret = typeof body.apiSecret === "string" ? body.apiSecret.trim() : "";
  if (!apiKey || apiKey.length > 256 || !apiSecret || apiSecret.length > 4096 || body.readOnlyConfirmed !== true) throw new Error("请填写只读 API 密钥，并确认未开启交易、转账或提现。");
  const label = body.provider === "binance" ? "币安" : "BIT.com";
  db.prepare(`INSERT INTO finance_connections(provider, connected, label, masked_key, secret_blob, scope, last_synced_at, last_error, warnings_json, total_usd)
    VALUES(?,1,?,?,?,NULL,NULL,NULL,'[]',NULL)
    ON CONFLICT(provider) DO UPDATE SET connected=1, label=excluded.label, masked_key=excluded.masked_key, secret_blob=excluded.secret_blob, last_error=NULL`).run(body.provider, label, maskKey(apiKey), seal(apiKey, apiSecret));
}

export function setHoldingCategory(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("分类没有保存。");
  const body = input as { holdingId?: unknown; category?: unknown };
  if (typeof body.holdingId !== "string" || !body.holdingId || typeof body.category !== "string" || !isCategory(body.category)) throw new Error("分类没有保存。");
  ensureSchema();
  const result = database().prepare("UPDATE finance_holdings SET category=? WHERE id=?").run(body.category, body.holdingId);
  if (result.changes !== 1) throw new Error("找不到这项资产。");
}

export function syncAccounts(provider?: string) {
  ensureSchema();
  const requested = provider ? [provider] : [...financeProviders];
  if (requested.some(item => !isProvider(item))) throw new Error("不支持的账户。");
  const db = database();
  const rows = db.prepare("SELECT provider, connected, secret_blob FROM finance_connections").all() as { provider: string; connected: number; secret_blob: string | null }[];
  const byProvider = new Map(rows.map(row => [row.provider, row]));
  const targets = provider ? requested : requested.filter(item => byProvider.get(item)?.connected === 1 && byProvider.get(item)?.secret_blob);
  if (!targets.length) throw new Error("请先连接账户。");
  const unavailable = "读取接口在这个版本里还没有接通，已保留上次同步的数据。";
  return {
    results: targets.map(item => {
      const row = byProvider.get(item);
      if (!row || row.connected !== 1 || !row.secret_blob) return { provider: item, ok: false, error: "账户尚未连接。" };
      db.prepare("UPDATE finance_connections SET last_error=? WHERE provider=?").run(unavailable, item);
      return { provider: item, ok: false, error: unavailable };
    }),
  };
}

export function readOverview(): FinanceOverview {
  ensureSchema();
  const db = database();
  const connections = db.prepare("SELECT provider, connected, masked_key, scope, last_synced_at, last_error, warnings_json, total_usd FROM finance_connections").all() as ConnectionRow[];
  const byProvider = new Map(connections.map(row => [row.provider, row]));
  const accounts = financeProviders.map(provider => accountFrom(provider, byProvider.get(provider)));
  const valued = accounts.filter(account => account.connected && account.totalUsd !== null);
  const holdings = (db.prepare("SELECT id, provider, symbol, name, quantity, value_usd, average_cost_usd, category FROM finance_holdings ORDER BY symbol").all() as {
    id: string; provider: string; symbol: string; name: string; quantity: string; value_usd: number | null; average_cost_usd: number | null; category: string;
  }[]).flatMap(row => isProvider(row.provider) && isCategory(row.category) ? [{
    id: row.id, provider: row.provider, symbol: row.symbol, name: row.name, quantity: row.quantity,
    valueUsd: row.value_usd, averageCostUsd: row.average_cost_usd, category: row.category,
  }] : []);
  const transactions = (db.prepare("SELECT provider, id, symbol, status, side, quantity, price_usd, amount_usd, occurred_at FROM finance_transactions ORDER BY occurred_at DESC").all() as {
    provider: string; id: string; symbol: string; status: string; side: string; quantity: string; price_usd: number | null; amount_usd: number | null; occurred_at: string;
  }[]).flatMap(row => isProvider(row.provider) ? [{
    id: row.id, provider: row.provider, symbol: row.symbol, status: row.status, side: row.side, quantity: row.quantity,
    priceUsd: row.price_usd, amountUsd: row.amount_usd, occurredAt: row.occurred_at,
  }] : []);
  const snapshotRows = db.prepare("SELECT day, provider, total_usd FROM finance_snapshots ORDER BY day").all() as { day: string; provider: string; total_usd: number }[];
  const grouped = new Map<string, FinanceSnapshot>();
  for (const row of snapshotRows) {
    if (!isProvider(row.provider)) continue;
    const current = grouped.get(row.day) || { day: row.day, totalUsd: 0, providers: [] };
    current.totalUsd += row.total_usd;
    current.providers.push(row.provider);
    grouped.set(row.day, current);
  }
  return {
    totalUsd: valued.length ? valued.reduce((sum, account) => sum + (account.totalUsd || 0), 0) : null,
    accounts, holdings, transactions, snapshots: [...grouped.values()], targets: readTargets(),
  };
}
