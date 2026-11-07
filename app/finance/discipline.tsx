"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Loader2, Plus, RefreshCw, Settings2, ShieldCheck, Trash2, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Discipline, DisciplineRule } from "./types";

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
function cloneDiscipline(value: Discipline): Discipline {
  return { ...value, rules: value.rules.map(rule => ({ ...rule })) };
}
function readDiscipline(value: unknown): Discipline {
  if (!value || typeof value !== "object") throw new Error("暂时无法读取铁律，请稍后重试。");
  const body = value as { enabled?: unknown; revision?: unknown; rules?: unknown };
  if (typeof body.enabled !== "boolean" || !Number.isInteger(body.revision) || Number(body.revision) < 0 || !Array.isArray(body.rules) || body.rules.length > 20) throw new Error("暂时无法读取铁律，请稍后重试。");
  const seen = new Set<string>();
  const rules = body.rules.map(rule => {
    if (!rule || typeof rule !== "object") throw new Error("暂时无法读取铁律，请稍后重试。");
    const item = rule as { id?: unknown; text?: unknown; enabled?: unknown };
    if (typeof item.id !== "string" || !item.id || seen.has(item.id) || typeof item.text !== "string" || !item.text.trim() || item.text.length > 80 || typeof item.enabled !== "boolean") throw new Error("暂时无法读取铁律，请稍后重试。");
    seen.add(item.id);
    return { id: item.id, text: item.text, enabled: item.enabled };
  });
  return { enabled: body.enabled, revision: Number(body.revision), rules };
}

function Barrage({ rules, paused }: { rules: DisciplineRule[]; paused: boolean }) {
  const [flights, setFlights] = useState(() => [{ id: 0, lane: 0, text: rules[0]?.text || "" }]);
  const next = useRef(1);
  const identity = useRef(0);
  useEffect(() => {
    if (paused || !rules.length) return;
    const timer = window.setInterval(() => {
      const index = next.current++;
      const flight = { id: ++identity.current, lane: index % 3, text: rules[index % rules.length].text };
      setFlights(current => [...current, flight].slice(-3));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, rules]);
  return <div className="discipline-barrage" aria-hidden="true" data-paused={paused}>{flights.map(flight => <span key={flight.id} className="discipline-flight" style={{ top: `${flight.lane * 38}px` }} onAnimationEnd={event => { if (event.target === event.currentTarget) setFlights(current => current.filter(item => item.id !== flight.id)); }}><ShieldCheck size={14}/>{flight.text}</span>)}</div>;
}

export default function DisciplinePanel({ csrf, onUnauthorized, layout }: { csrf: string; onUnauthorized: () => void; layout: "card" | "inline" }) {
  const formId = useId();
  const [saved, setSaved] = useState<Discipline | null>(null);
  const [draft, setDraft] = useState<Discipline | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [notice, setNotice] = useState("");
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const unauthorized = useRef(onUnauthorized);
  const alive = useRef(false);
  const requestId = useRef(0);
  const savingLock = useRef(false);
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const visibleRules = useMemo(() => saved?.enabled ? saved.rules.filter(rule => rule.enabled) : [], [saved]);

  useEffect(() => { unauthorized.current = onUnauthorized; }, [onUnauthorized]);
  const load = useCallback(async (signal?: AbortSignal) => {
    const id = ++requestId.current;
    const current = () => alive.current && id === requestId.current && !signal?.aborted;
    try {
      const response = await fetch("/api/finance/discipline", { cache: "no-store", signal });
      const body = await response.json().catch(() => ({})) as { error?: string; discipline?: unknown };
      if (!current()) return;
      if (response.status === 401) { setSaved(null); setDraft(null); unauthorized.current(); return; }
      if (!response.ok) throw new Error(body.error || "铁律暂时没有读到，请重试。");
      const discipline = readDiscipline(body.discipline);
      setSaved(discipline); setDraft(cloneDiscipline(discipline)); setConflict(false);
    } catch (reason) {
      if (current()) setError(reason instanceof Error ? reason.message : "铁律暂时没有读到，请重试。");
    } finally {
      if (current()) setLoading(false);
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) void load(controller.signal); });
    return () => { alive.current = false; controller.abort(); };
  }, [load]);

  function onOpenChange(next: boolean) {
    if (next && savingLock.current) return;
    if (next && saved) { setDraft(cloneDiscipline(saved)); if (!conflict) setError(""); }
    setOpen(next);
  }
  function updateRule(id: string, patch: Partial<DisciplineRule>) {
    setDraft(current => current && { ...current, rules: current.rules.map(rule => rule.id === id ? { ...rule, ...patch } : rule) });
    setNotice("");
  }
  function addRule() {
    if (!draft || draft.rules.length >= 20) return;
    const rule = { id: crypto.randomUUID(), text: "", enabled: true };
    setDraft({ ...draft, rules: [...draft.rules, rule] });
    requestAnimationFrame(() => fields.current.get(rule.id)?.focus());
  }
  function removeRule(id: string) {
    if (!draft) return;
    const index = draft.rules.findIndex(rule => rule.id === id);
    const rules = draft.rules.filter(rule => rule.id !== id);
    setDraft({ ...draft, rules });
    const next = rules[Math.min(index, rules.length - 1)];
    if (next) requestAnimationFrame(() => fields.current.get(next.id)?.focus());
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || savingLock.current || conflict) return;
    const invalid = draft.rules.find(rule => !rule.text.trim() || rule.text.trim().length > 80);
    if (invalid) { setError("每条铁律请写 1–80 个字符。"); fields.current.get(invalid.id)?.focus(); return; }
    savingLock.current = true; setSaving(true); setError("");
    try {
      const response = await fetch("/api/finance/discipline", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ ...draft, rules: draft.rules.map(rule => ({ ...rule, text: rule.text.trim() })) }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; discipline?: unknown };
      if (!alive.current) return;
      if (response.status === 401) { setSaved(null); setDraft(null); setOpen(false); unauthorized.current(); return; }
      if (response.status === 409) { setConflict(true); throw new Error("铁律已在别处更新。请重新载入后再修改；重新载入会替换当前未保存的内容。"); }
      if (!response.ok) throw new Error(body.error || "铁律没有保存成功，请重试。");
      const discipline = readDiscipline(body.discipline);
      setSaved(discipline); setDraft(cloneDiscipline(discipline)); setNotice("铁律已保存，提醒已按最新设置更新。"); setOpen(false);
    } catch (reason) {
      if (alive.current) setError(reason instanceof Error ? reason.message : "铁律没有保存成功，请重试。");
    } finally {
      savingLock.current = false;
      if (alive.current) setSaving(false);
    }
  }

  const summary = loading ? "正在读取提醒…" : saved ? saved.enabled ? visibleRules.length ? `提醒已开启 · ${visibleRules.length} 条铁律` : "提醒已开启，尚无启用的铁律" : "浮动提醒已关闭" : "提醒暂时未能读取";
  return <div className={`discipline-panel${layout === "card" ? " is-card" : ""}`}>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="discipline-entry">
        <DialogTrigger asChild><button type="button" className="discipline-trigger" disabled={saving}><ShieldCheck size={19} strokeWidth={1.5}/><span>铁律交易</span><Settings2 size={15}/></button></DialogTrigger>
        <span className="discipline-summary">{summary}</span>
      </div>
      {layout === "card" && <div className="discipline-card-body">
        {loading ? <p>正在读取提醒…</p> : visibleRules.length ? <ul>{visibleRules.slice(0, 3).map(rule => <li key={rule.id}>{rule.text}</li>)}{visibleRules.length > 3 && <li>另有 {visibleRules.length - 3} 条，打开后可以一起看。</li>}</ul> : <p>{saved ? "还没有可显示的铁律。先留下一条想坚持的原则。" : "提醒暂时没有读到。"}</p>}
      </div>}
      {notice && <p className="discipline-notice" role="status"><Check size={14}/>{notice}</p>}
      <DialogContent className="discipline-dialog sm:max-w-[620px]" showCloseButton={false}>
        <DialogClose asChild><button type="button" className="discipline-close" aria-label="关闭铁律管理"><X size={20}/></button></DialogClose>
        <DialogHeader>
          <p className="discipline-eyebrow">A NOTE TO MYSELF</p>
          <DialogTitle>铁律交易</DialogTitle>
          <DialogDescription>把想遵守的原则留在眼前。文字与开关统一在保存成功后生效。</DialogDescription>
        </DialogHeader>
        {loading ? <p className="discipline-loading" role="status"><Loader2 size={18} className="spin"/>正在读取铁律…</p> : draft && <form className="discipline-form" onSubmit={event => void save(event)}>
          <fieldset disabled={saving}>
            <div className="discipline-master">
              <label htmlFor={`${formId}-enabled`}><strong>开启浮动提醒</strong><span>最多同时显示三条，编辑时自动暂停。</span></label>
              <Switch id={`${formId}-enabled`} checked={draft.enabled} onCheckedChange={enabled => setDraft(current => current && { ...current, enabled })}/>
            </div>
            <div className="discipline-list-heading"><span>我的铁律</span><span>{draft.rules.length} / 20</span></div>
            <ol className="discipline-rule-list">{draft.rules.map((rule, index) => <li key={rule.id} className="discipline-rule">
              <label className="discipline-rule-label" htmlFor={`${formId}-rule-${rule.id}`}><span>铁律 {String(index + 1).padStart(2, "0")}</span><span>{rule.text.length} / 80</span></label>
              <textarea id={`${formId}-rule-${rule.id}`} ref={node => { if (node) fields.current.set(rule.id, node); else fields.current.delete(rule.id); }} value={rule.text} onChange={event => updateRule(rule.id, { text: event.target.value })} required minLength={1} maxLength={80} rows={2} placeholder="写下一条想坚持的原则"/>
              <div className="discipline-rule-tools">
                <label htmlFor={`${formId}-show-${rule.id}`}><Switch id={`${formId}-show-${rule.id}`} checked={rule.enabled} onCheckedChange={enabled => updateRule(rule.id, { enabled })}/><span>显示这条提醒</span></label>
                <button type="button" className="discipline-remove" onClick={() => removeRule(rule.id)} aria-label={`删除第 ${index + 1} 条铁律`}><Trash2 size={16}/><span>删除</span></button>
              </div>
            </li>)}</ol>
            {!draft.rules.length && <p className="discipline-empty">还没有铁律。先留下一条想坚持的原则。</p>}
            <button type="button" className="discipline-add" disabled={draft.rules.length >= 20} onClick={addRule}><Plus size={17}/>{draft.rules.length >= 20 ? "已达到 20 条上限" : "添加铁律"}</button>
          </fieldset>
          <div className="discipline-actions"><span>每条 1–80 个字符</span><div>
            <DialogClose asChild><button type="button" className="discipline-cancel">取消</button></DialogClose>
            <button className="discipline-save" type="submit" disabled={saving || conflict}>{saving ? <Loader2 size={16} className="spin"/> : <Check size={16}/>} {saving ? "正在保存…" : "保存铁律"}</button>
          </div></div>
        </form>}
        {error && <p className="discipline-error" role="alert">{error}</p>}
        {!loading && (conflict || !draft) && <button type="button" className="discipline-reload" disabled={saving} onClick={() => { setLoading(true); setError(""); void load(); }}><RefreshCw size={15}/>{conflict ? "重新载入最新铁律" : "重新读取铁律"}</button>}
      </DialogContent>
    </Dialog>
    {layout === "inline" && reduced && visibleRules.length > 0 && <aside className="discipline-static" aria-label="交易铁律提醒"><ShieldCheck size={17}/><div>{visibleRules.slice(0, 3).map(rule => <p key={rule.id}>{rule.text}</p>)}{visibleRules.length > 3 && <span>另有 {visibleRules.length - 3} 条铁律，可在“铁律交易”中查看。</span>}</div></aside>}
    {!reduced && visibleRules.length > 0 && <Barrage key={saved?.revision} rules={visibleRules} paused={open || hidden}/>}
  </div>;
}
