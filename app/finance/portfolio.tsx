"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Cable, ChartNoAxesCombined, Check, CircleQuestionMark, Loader2, RefreshCw, Settings2, Unplug } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  categoryLabels,
  financeCategories,
  providerLabels,
  type FinanceCategory,
  type FinanceOverview,
  type FinanceProvider,
} from "./types";

const categoryOrder = financeCategories;
const categoryColors = ["#507f7c", "#7d95b0", "#c4aa79", "#a49f99"];
const money = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("zh-CN", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
const when = (value: string | null) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "尚未同步";

export function usePortfolio(csrf: string, onUnauthorized: () => void) {
  const [data, setData] = useState<FinanceOverview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<FinanceProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState("");
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [weights, setWeights] = useState(["", "", ""]);
  const [mode, setMode] = useState<"actual" | "target">("actual");
  const [savingId, setSavingId] = useState<string | null>(null);

  const request = useCallback(async (url: string, method = "GET", body?: unknown) => {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      headers: method === "GET" ? undefined : { "Content-Type": "application/json", "x-csrf-token": csrf },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (response.status === 401) { onUnauthorized(); throw new Error("登录已失效，请重新登录。"); }
    const payload = await response.json() as { error?: string; results?: { provider: FinanceProvider; ok: boolean; error?: string }[] };
    if (!response.ok) throw new Error(payload.error || "操作未完成，请稍后重试。");
    return payload;
  }, [csrf, onUnauthorized]);

  const reload = useCallback(async () => {
    try { setData(await request("/api/finance/overview") as unknown as FinanceOverview); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "暂时无法读取资产。"); }
  }, [request]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/finance/overview", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (response.status === 401) { onUnauthorized(); return; }
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "暂时无法读取资产。");
      setData(payload as FinanceOverview);
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "暂时无法读取资产。");
    });
    return () => controller.abort();
  }, [onUnauthorized]);

  function openConnect(next: FinanceProvider) {
    setFormError(""); setApiKey(""); setApiSecret(""); setConfirmed(false); setProvider(next);
  }
  async function submitConnect(event: React.FormEvent) {
    event.preventDefault();
    if (!provider || busy) return;
    setBusy(true); setFormError("");
    try {
      await request("/api/finance/connections", "POST", { provider, apiKey: apiKey.trim(), apiSecret: apiSecret.trim(), label: providerLabels[provider], readOnlyConfirmed: confirmed });
      setApiKey(""); setApiSecret(""); setProvider(null); await reload();
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : "连接没有完成。"); }
    finally { setBusy(false); }
  }
  async function sync(next?: FinanceProvider) {
    setBusy(true); setError("");
    try {
      const payload = await request("/api/finance/sync", "POST", next ? { provider: next } : {});
      await reload();
      const failed = (payload.results || []).filter(item => !item.ok);
      if (failed.length) setError(failed.map(item => `${providerLabels[item.provider]}：${item.error || "同步失败，保留上次数据。"}`).join("；"));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "同步没有完成。"); }
    finally { setBusy(false); }
  }
  async function disable(next: FinanceProvider) {
    setBusy(true);
    try { await request("/api/finance/connections", "POST", { provider: next, action: "disable" }); await reload(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "操作未完成。"); }
    finally { setBusy(false); }
  }
  function openTargets() {
    setWeights(data?.targets.weights ? [data.targets.weights.us_stocks, data.targets.weights.nasdaq, data.targets.weights.cash].map(String) : ["", "", ""]);
    setFormError(""); setTargetsOpen(true);
  }
  async function submitTargets(event: React.FormEvent) {
    event.preventDefault();
    if (!data || busy) return;
    const values = weights.map(Number);
    if (weights.some(item => item.trim() === "") || values.some(item => !Number.isFinite(item) || item < 0 || item > 100) || Math.abs(values.reduce((sum, item) => sum + item, 0) - 100) > 0.01) {
      setFormError("请填写三类资产的目标比例，合计为100%。"); return;
    }
    setBusy(true); setFormError("");
    try {
      await request("/api/finance/targets", "PUT", { weights: { us_stocks: values[0], nasdaq: values[1], cash: values[2] }, revision: data.targets.revision });
      await reload(); setTargetsOpen(false); setMode("target");
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : "保存没有完成。"); }
    finally { setBusy(false); }
  }
  async function setCategory(holdingId: string, category: FinanceCategory) {
    setSavingId(holdingId);
    try { await request("/api/finance/categories", "PUT", { holdingId, category }); await reload(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "分类没有保存。"); }
    finally { setSavingId(null); }
  }

  return {
    data, error, busy, provider, apiKey, setApiKey, apiSecret, setApiSecret, confirmed, setConfirmed, formError,
    targetsOpen, weights, setWeights, mode, setMode, savingId, reload, openConnect, setProvider, submitConnect,
    sync, disable, openTargets, setTargetsOpen, submitTargets, setCategory,
  };
}

export type PortfolioState = ReturnType<typeof usePortfolio>;

function EmptyChart({ children }: { children: string }) {
  return <div className="portfolio-chart-empty"><ChartNoAxesCombined size={34} strokeWidth={1.2}/><p>{children}</p></div>;
}

function Allocation({ values, empty }: { values: number[]; empty: string }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total || values.some(value => value < 0)) return <EmptyChart>{values.some(value => value < 0) ? "当前含负值资产，暂不计算配置占比。" : empty}</EmptyChart>;
  const circumference = 2 * Math.PI * 65;
  const segments = values.map((value, index) => ({
    value,
    index,
    start: values.slice(0, index).reduce((sum, item) => sum + Math.max(item, 0), 0) / total * circumference,
  }));
  return <div className="portfolio-allocation">
    <svg viewBox="0 0 200 200" role="img" aria-label="资产配置占比">
      <circle cx="100" cy="100" r="65" fill="none" stroke="#e6ece7" strokeWidth="24"/>
      {segments.map(segment => segment.value > 0 ? <circle key={categoryOrder[segment.index]} cx="100" cy="100" r="65" fill="none" stroke={categoryColors[segment.index]} strokeWidth="24" strokeDasharray={`${(segment.value / total) * circumference} ${circumference}`} strokeDashoffset={-segment.start} transform="rotate(-90 100 100)"><title>{categoryLabels[categoryOrder[segment.index]]}：{((segment.value / total) * 100).toFixed(1)}%</title></circle> : null)}
      <text x="100" y="97" textAnchor="middle" className="portfolio-ring-label">资产配置</text>
      <text x="100" y="119" textAnchor="middle" className="portfolio-ring-count">{values.filter(value => value > 0).length} 类资产</text>
    </svg>
    <div className="portfolio-legend">{values.map((value, index) => <div key={categoryOrder[index]}><span style={{ background: categoryColors[index] }}/><span>{categoryLabels[categoryOrder[index]]}</span><strong>{((value / total) * 100).toFixed(1)}%</strong></div>)}</div>
  </div>;
}

function Trend({ snapshots }: { snapshots: FinanceOverview["snapshots"] }) {
  const [range, setRange] = useState("30");
  // The window is anchored to the current Shanghai date, so it cannot be derived from props.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = range === "all" ? "" : new Date(Date.now() - Number(range) * 864e5).toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
  const points = snapshots.filter(item => item.day >= cutoff).slice(-366);
  const totals = points.map(item => item.totalUsd);
  const low = Math.min(...totals);
  const high = Math.max(...totals);
  const pad = Math.max((high - low) * 0.18, Math.abs(high) * 0.01, 1);
  const floor = low - pad;
  const ceiling = high + pad;
  const plotted = points.map((item, index) => ({
    ...item,
    x: points.length === 1 ? 342 : 68 + (index / (points.length - 1)) * 542,
    y: 28 + ((ceiling - item.totalUsd) / (ceiling - floor)) * 150,
  }));
  const compact = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return <>
    <div className="portfolio-range" aria-label="资产走势时间范围">{[["30", "近30天"], ["90", "近90天"], ["all", "全部"]].map(([value, label]) => <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)}>{label}</button>)}</div>
    {points.length ? <svg className="portfolio-balance-chart" viewBox="0 0 640 225" role="img" aria-label={`美元资产总值走势，${points.length}个每日快照`}>
      {[0, 1, 2].map(index => <g key={index}><line x1="68" x2="610" y1={28 + index * 75} y2={28 + index * 75} stroke="#294f691a" strokeDasharray="3 5"/><text x="57" y={32 + index * 75} textAnchor="end">${compact(ceiling - (index / 2) * (ceiling - floor))}</text></g>)}
      {plotted.length > 1 && <polyline points={plotted.map(item => `${item.x},${item.y}`).join(" ")} fill="none" stroke="#507f7c" strokeWidth="2.5" strokeLinejoin="round"/>}
      {plotted.map(item => <circle key={item.day} cx={item.x} cy={item.y} r={plotted.length > 60 ? 2 : 3.7} fill="#507f7c"><title>{item.day}：{money(item.totalUsd)}；{item.providers.map(item => providerLabels[item]).join("、")}</title></circle>)}
      <text x="68" y="211">{points[0].day}</text>
      {points.length > 1 && <text x="610" y="211" textAnchor="end">{points[points.length - 1].day}</text>}
    </svg> : <EmptyChart>首次成功同步后，在这里开始记录资产走势。</EmptyChart>}
    <p className="portfolio-chart-note">记录同步时的美元资产估值；出入金和账户覆盖变化也会影响曲线，不代表投资收益率。{points.length === 1 && "目前已有1个快照，后续同步将逐步形成走势。"}</p>
  </>;
}

function Dialogs(state: PortfolioState) {
  const { provider, busy, apiKey, setApiKey, apiSecret, setApiSecret, confirmed, setConfirmed, formError, submitConnect, setProvider, targetsOpen, setTargetsOpen, weights, setWeights, submitTargets } = state;
  return <>
    <Dialog open={!!provider} onOpenChange={open => { if (!open && !busy) { setProvider(null); setApiKey(""); setApiSecret(""); } }}>
      <DialogContent className="portfolio-dialog sm:max-w-[480px]" onInteractOutside={event => { if (busy) event.preventDefault(); }} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>连接{provider ? providerLabels[provider] : "账户"}</DialogTitle>
          <DialogDescription>填写平台的只读 API 密钥。密钥加密保存在服务器，页面不回显原文。读取接口接通后，同步才会写入持仓和快照。</DialogDescription>
        </DialogHeader>
        <form onSubmit={event => void submitConnect(event)} className="portfolio-form">
          <label>API Key<input type="password" autoComplete="off" required maxLength={256} value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="填写只读API Key"/></label>
          <label>API Secret<input type="password" autoComplete="off" required maxLength={4096} value={apiSecret} onChange={event => setApiSecret(event.target.value)} placeholder="填写对应的API Secret"/></label>
          <label className="portfolio-confirm"><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)}/><span>我已在平台仅开启读取权限，未开启交易、转账或提现。</span></label>
          {provider === "bit" && <p className="portfolio-chart-note">BIT.com 未提供已核实的密钥权限自查接口，请在平台密钥设置中确认权限。</p>}
          {provider === "binance" && <p className="portfolio-chart-note">使用HMAC类型密钥；本次可读取近期股票成交，完整股票持仓尚不在已核实的接口范围内。</p>}
          {formError && <p role="alert" className="portfolio-error">{formError}</p>}
          <button className="portfolio-submit" disabled={busy}>{busy ? <Loader2 size={17} className="spin"/> : <ArrowUpRight size={17}/>} {busy ? "正在验证并读取…" : "连接并读取账户"}</button>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={targetsOpen} onOpenChange={open => { if (!busy) setTargetsOpen(open); }}>
      <DialogContent className="portfolio-dialog sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>设置目标配置</DialogTitle>
          <DialogDescription>按你的计划填写比例，三类资产合计100%。</DialogDescription>
        </DialogHeader>
        <form onSubmit={event => void submitTargets(event)} className="portfolio-form">
          {["美股个股", "纳斯达克", "现金"].map((label, index) => <label key={label}>{label}<span className="portfolio-percent-input"><input type="number" min="0" max="100" step="0.01" required inputMode="decimal" value={weights[index]} onChange={event => setWeights(current => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}/><span>%</span></span></label>)}
          <p className="portfolio-chart-note">当前合计：{weights.reduce((sum, item) => sum + (Number(item) || 0), 0).toFixed(2)}%</p>
          {formError && targetsOpen && <p role="alert" className="portfolio-error">{formError}</p>}
          <button className="portfolio-submit" disabled={busy}>{busy ? <Loader2 size={17} className="spin"/> : <Check size={17}/>}保存目标比例</button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}

export function AssetSummary({ state, onManage }: { state: PortfolioState; onManage: () => void }) {
  const { data, error, busy, reload, sync } = state;
  if (!data) return <section className="dash-card portfolio-loading">{error ? <><p role="alert">{error}</p><button type="button" className="portfolio-button" onClick={() => void reload()}>重新加载</button></> : <p role="status">正在读取你的资产工作台…</p>}</section>;
  const connected = data.accounts.filter(account => account.connected);
  const unvalued = connected.filter(account => account.totalUsd === null).length;
  return <section className="dash-card dash-hero">
    <div>
      <span className="portfolio-overline">美元资产估值</span>
      <strong>{money(data.totalUsd)}</strong>
      <span>{connected.length ? `${connected.length}个账户连接 · ${data.holdings.length}项资产记录` : "连接账户后，开始记录你的资产"}</span>
      <ul className="dash-account-line">{data.accounts.map(account => <li key={account.provider}><i className={account.connected ? "is-on" : ""}/>{providerLabels[account.provider]}<span>{account.connected ? "已连接" : "尚未连接"}</span></li>)}</ul>
    </div>
    <div className="dash-hero-actions">
      <button type="button" className="portfolio-button" disabled={busy || !connected.length} onClick={() => void sync()}><RefreshCw size={16} className={busy ? "spin" : undefined}/>同步账户</button>
      <button type="button" className="portfolio-quiet" onClick={onManage}>管理账户<ArrowUpRight size={15}/></button>
    </div>
    {error && <p className="portfolio-error" role="alert">{error}</p>}
    {unvalued > 0 && <p className="portfolio-notice"><CircleQuestionMark size={15}/>{unvalued}个账户暂无完整美元估值，合计与走势仅含已估值账户。</p>}
  </section>;
}

export function AssetCharts({ state }: { state: PortfolioState }) {
  const { data, mode, setMode, openTargets } = state;
  if (!data) return null;
  const actual = categoryOrder.map(category => data.holdings.filter(holding => holding.category === category).reduce((sum, holding) => sum + (holding.valueUsd ?? 0), 0));
  const target = data.targets.weights ? [data.targets.weights.us_stocks, data.targets.weights.nasdaq, data.targets.weights.cash, 0] : [0, 0, 0, 0];
  const missing = data.holdings.filter(holding => holding.valueUsd === null).length;
  return <div className="dash-charts">
    <section className="portfolio-card">
      <header><div><span className="portfolio-overline">ALLOCATION</span><h2>资产配置</h2></div><button type="button" className="portfolio-quiet" onClick={openTargets}><Settings2 size={15}/>设置目标</button></header>
      <div className="portfolio-switch"><button type="button" aria-pressed={mode === "actual"} onClick={() => setMode("actual")}>实际配置</button><button type="button" aria-pressed={mode === "target"} onClick={() => setMode("target")}>目标配置</button></div>
      <Allocation values={mode === "actual" ? actual : target} empty={mode === "actual" ? "连接账户后，显示你的实际资产配置。" : "先设置美股、纳斯达克和现金的目标比例。"}/>
    </section>
    <section className="portfolio-card portfolio-trend">
      <header><div><span className="portfolio-overline">ACCOUNT VALUE</span><h2>资产总值走势</h2></div><span className="portfolio-currency">USD</span></header>
      <Trend snapshots={data.snapshots}/>
    </section>
    {missing > 0 && <p className="portfolio-notice dash-span"><CircleQuestionMark size={15}/>{missing}项资产暂无美元估值，配置图仅显示可估值部分。</p>}
  </div>;
}

export function AssetRecords({ state, detailed = false }: { state: PortfolioState; detailed?: boolean }) {
  const { data, error, busy, reload, sync, openConnect, disable, savingId, setCategory } = state;
  if (!data) return <section className="portfolio-loading">{error ? <><p role="alert">{error}</p><button type="button" className="portfolio-button" onClick={() => void reload()}>重新加载</button></> : <p role="status">正在读取你的资产工作台…</p>}</section>;
  const connected = data.accounts.filter(account => account.connected);
  return <div className="portfolio portfolio-records">
    <div className="finance-panel-heading"><h2>资产记录</h2><span>{connected.length ? `${connected.length} 个账户已连接` : "尚未连接账户"}</span></div>
    <p className="dash-lead">连接只读账户后，持仓、估值和成交会记在这里。没有读到数据时，这里保持空白，不填入示例金额。</p>
    <div className="portfolio-summary">
      <div><span className="portfolio-overline">美元资产估值</span><strong>{money(data.totalUsd)}</strong><span>{connected.length ? `${connected.length}个账户连接 · ${data.holdings.length}项资产记录` : "连接账户后，开始记录你的资产"}</span></div>
      <button type="button" className="portfolio-button" disabled={busy || !connected.length} onClick={() => void sync()}><RefreshCw size={16} className={busy ? "spin" : undefined}/>同步账户</button>
    </div>
    {error && <p className="portfolio-error" role="alert">{error}</p>}
    <section className="portfolio-accounts">
      <div className="portfolio-section-heading"><h2>账户连接</h2><span>读取与记录</span></div>
      <div className="portfolio-account-grid">{data.accounts.map(account => <article key={account.provider} className="portfolio-account-card">
        <div className="portfolio-account-top"><span className={`portfolio-provider provider-${account.provider}`}>{account.provider === "binance" ? "B" : "BIT"}</span><div><h3>{providerLabels[account.provider]}</h3><span>{account.connected ? `已连接 · ${account.maskedKey || "只读账户"}` : "尚未连接"}</span></div><span className={`portfolio-status${account.connected ? " connected" : ""}`}>{account.connected ? <Check size={13}/> : <Cable size={14}/>}</span></div>
        <p>{account.scope || (account.provider === "bit" ? "证券现金、股票与ETF持仓、近期订单。" : "近期股票成交；完整股票持仓暂待接口支持。")}</p>
        <div className="portfolio-account-meta"><span>最近同步</span><time>{when(account.lastSyncedAt)}</time></div>
        {account.warnings.map((warning, index) => <p key={index} className="portfolio-account-warning">{warning}</p>)}
        {account.lastError && <p className="portfolio-error">{account.lastError}</p>}
        <div className="portfolio-account-actions">
          <button type="button" className="portfolio-button" disabled={busy} onClick={() => openConnect(account.provider)}><Cable size={15}/>{account.connected ? "更新连接" : "连接账户"}</button>
          {account.connected && <><button type="button" className="portfolio-quiet" disabled={busy} onClick={() => void sync(account.provider)}><RefreshCw size={14}/>同步</button><button type="button" className="portfolio-quiet" disabled={busy} onClick={() => void disable(account.provider)} title="停用后保留历史快照"><Unplug size={14}/>停用</button></>}
        </div>
      </article>)}</div>
      <p className="portfolio-chart-note">密钥加密保存在服务器，页面不回显原文。首次连接前请在平台创建只读密钥；本工作台仅准备账户读取，不会发起交易。</p>
    </section>
    <section className="portfolio-holdings">
      <div className="portfolio-section-heading"><h2>当前资产与持仓</h2><span>{data.holdings.length}项</span></div>
      {data.holdings.length ? <div className="portfolio-table-scroll"><table><thead><tr><th>标的</th><th>账户</th><th>数量</th><th>美元估值</th><th>配置分类</th></tr></thead><tbody>{data.holdings.map(holding => <tr key={holding.id}><td><strong>{holding.symbol}</strong><small>{holding.name}</small></td><td>{providerLabels[holding.provider]}</td><td>{holding.quantity}</td><td>{money(holding.valueUsd)}{detailed && holding.averageCostUsd !== null && <small>单位成本 {money(holding.averageCostUsd)}</small>}</td><td><label className="portfolio-category"><select aria-label={`${holding.symbol}配置分类`} value={holding.category} disabled={savingId === holding.id} onChange={event => void setCategory(holding.id, event.target.value as FinanceCategory)}>{categoryOrder.map(category => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select><Settings2 size={12}/></label></td></tr>)}</tbody></table></div> : <div className="portfolio-table-empty"><p>还没有可展示的资产和持仓。</p><span>成功读取账户后，标的、数量、估值和配置分类会出现在这里。</span></div>}
    </section>
    <section className="portfolio-transactions">
      <div className="portfolio-section-heading"><h2>近期成交与订单</h2><span>最近30天</span></div>
      {data.transactions.length ? <div className="portfolio-table-scroll"><table><thead><tr><th>标的 / 状态</th><th>账户</th><th>方向</th><th>数量</th><th>价格 / 金额</th><th>时间</th></tr></thead><tbody>{data.transactions.slice(0, detailed ? 200 : 20).map(item => <tr key={`${item.provider}:${item.id}`}><td><strong>{item.symbol}</strong><small>{item.status}</small></td><td>{providerLabels[item.provider]}</td><td>{item.side}</td><td>{item.quantity}</td><td>{money(item.priceUsd)}<small>{money(item.amountUsd)}</small></td><td>{when(item.occurredAt)}</td></tr>)}</tbody></table></div> : <div className="portfolio-table-empty"><p>暂时没有同步到成交或订单记录。</p><span>成交与订单分别标注，尚未成交的订单不会计为持仓。</span></div>}
    </section>
  </div>;
}

export function PortfolioDialogs(state: PortfolioState) {
  return <Dialogs {...state}/>;
}
