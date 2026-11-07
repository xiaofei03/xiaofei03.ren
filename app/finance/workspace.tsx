"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, ChartNoAxesCombined, ChevronRight, Layers, Loader2, LogOut, Telescope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisciplinePanel from "./discipline";
import { AssetCharts, AssetRecords, AssetSummary, PortfolioDialogs, usePortfolio } from "./portfolio";

const modules = [
  { id: "watchlist", label: "自选观察", icon: Telescope, number: "01", description: "留意值得关注的标的，积累自己的观察。", empty: "还没有观察中的标的", detail: "给关注的公司、基金和其他资产留一个位置，让零散的发现慢慢连成线。" },
  { id: "assets", label: "资产记录", icon: Layers, number: "02", description: "梳理资产的组成，留意每一步变化。", empty: "资产记录，从这里开始", detail: "为账户、持仓与资产变化留一份清晰的记录，按自己的节奏整理。" },
  { id: "notes", label: "投资笔记", icon: BookOpen, number: "03", description: "写下判断的依据，也留住复盘的线索。", empty: "第一篇投资笔记，尚待落笔", detail: "记录一个想法、一段阅读，或者一次判断背后的理由。以后回看时，仍能找到当时的自己。" },
] as const;
type TabId = "overview" | "watchlist" | "assets" | "notes" | "macro";

export default function FinanceWorkspace({ username, csrf }: { username: string; csrf: string }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [session, setSession] = useState<"active" | "expired" | "checking">("active");
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(csrf);
  const onUnauthorized = useCallback(() => { setSession("expired"); location.replace("/finance"); }, []);
  const portfolio = usePortfolio(token, onUnauthorized);

  useEffect(() => {
    let cancelled = false;
    let checking = false;
    const verify = async () => {
      if (checking || document.hidden) return;
      checking = true;
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        if (!response.ok) throw new Error("SESSION_CHECK");
        const body = await response.json() as { admin?: { csrf: string } | null };
        if (cancelled) return;
        if (!body.admin) { setSession("expired"); location.replace("/finance"); return; }
        setToken(body.admin.csrf); setSession("active"); setError("");
      } catch {
        if (!cancelled) { setSession("checking"); setError("暂时无法验证登录状态，请检查网络后重试。"); }
      } finally { checking = false; }
    };
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) void verify(); };
    const onVisible = () => { if (!document.hidden) void verify(); };
    const onHide = () => setSession("checking");
    window.addEventListener("focus", verify);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisible);
    void verify();
    return () => {
      cancelled = true;
      window.removeEventListener("focus", verify);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function logout() {
    setLeaving(true); setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST", headers: { "x-csrf-token": token } });
      if (response.status !== 401 && !response.ok) {
        const body = await response.json() as { error?: string };
        throw new Error(body.error || "退出没有完成，请稍后重试。");
      }
      setSession("expired"); location.replace("/finance");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "退出没有完成，请稍后重试。");
      setLeaving(false);
    }
  }

  if (session !== "active") return <main className="finance-page finance-session" data-finance-state={session}>
    <h1>投资理财</h1>
    {!error && <p role="status">{session === "expired" ? "正在返回登录页面…" : "正在确认登录状态…"}</p>}
    {error && <><p className="finance-error" role="alert">{error}</p><button type="button" className="finance-text-button" onClick={() => location.reload()}>重新验证 <ArrowUpRight size={16}/></button></>}
  </main>;

  return <main className="finance-page" data-finance-state="authenticated">
    <header className="finance-masthead">
      <div>
        <p className="eyebrow">PERSONAL FINANCE</p>
        <h1>投资理财</h1>
        <p className="section-intro">整理观察，记录判断，慢慢建立自己的投资笔记。</p>
      </div>
      <div className="finance-account">
        <span>站主空间<span>{username}</span></span>
        <button type="button" onClick={() => void logout()} disabled={leaving} title="退出后，本设备的站主页面均需重新登录">{leaving ? <Loader2 size={16} className="spin"/> : <LogOut size={16}/>}退出登录</button>
      </div>
    </header>
    {error && <p className="finance-error" role="alert">{error}</p>}
    {tab !== "overview" && <DisciplinePanel csrf={token} onUnauthorized={onUnauthorized} layout="inline"/>}
    <Tabs value={tab} onValueChange={value => setTab(value as TabId)} className="finance-tabs">
      <TabsList aria-label="投资理财模块" className="finance-tab-list">
        <TabsTrigger value="overview">总览</TabsTrigger>
        {modules.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}
        <TabsTrigger value="macro">宏观指标</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="finance-dashboard">
        <div className="dash-top">
          <AssetSummary state={portfolio} onManage={() => setTab("assets")}/>
          <DisciplinePanel csrf={token} onUnauthorized={onUnauthorized} layout="card"/>
        </div>
        <AssetCharts state={portfolio}/>
        <div className="dash-previews">
          {modules.filter(item => item.id !== "assets").map(item => {
            const Icon = item.icon;
            return <button key={item.id} type="button" className="dash-preview" onClick={() => setTab(item.id)}>
              <span className="dash-preview-kicker"><Icon size={18} strokeWidth={1.4}/><span>{item.number}</span></span>
              <h2>{item.label}</h2>
              <p>{item.description}</p>
              <span className="dash-preview-empty"><strong>{item.empty}</strong><span>{item.detail}</span></span>
              <span className="dash-preview-go">打开 <ArrowUpRight size={15}/></span>
            </button>;
          })}
          <button type="button" className="dash-preview dash-preview-macro" onClick={() => setTab("macro")}>
            <span className="dash-preview-kicker"><ChartNoAxesCombined size={18} strokeWidth={1.4}/><span>筹备中</span></span>
            <h2>宏观指标</h2>
            <p>给影响市场的长期线索留一个观察窗口。指标、数据来源和展示方式，将在这里逐步完善。</p>
            <span className="finance-macro-fields"><span><span>指标选择</span><strong>待确定</strong></span><span><span>数据来源</span><strong>待确定</strong></span><span><span>观察周期</span><strong>待确定</strong></span></span>
            <span className="dash-preview-go">查看预留区 <ArrowUpRight size={15}/></span>
          </button>
        </div>
      </TabsContent>
      <TabsContent value="assets"><AssetRecords state={portfolio} detailed/></TabsContent>
      <TabsContent value="macro"><MacroPanel/></TabsContent>
      {modules.filter(item => item.id !== "assets").map(item => <TabsContent key={item.id} value={item.id}>
        <div className="finance-panel-heading"><h2>{item.label}</h2><span>尚无记录</span></div>
        <section className="finance-empty">
          <span className="finance-empty-icon"><item.icon size={39} strokeWidth={1.2}/></span>
          <h3>{item.empty}</h3>
          <p>{item.detail}</p>
          <span className="finance-coming">记录功能准备中</span>
          <button type="button" className="finance-text-button" onClick={() => setTab("overview")}><ArrowLeft size={16}/>回到总览<ChevronRight size={15}/></button>
        </section>
      </TabsContent>)}
    </Tabs>
    <PortfolioDialogs {...portfolio}/>
  </main>;
}

function MacroPanel() {
  return <section className="finance-macro">
    <div className="finance-macro-heading"><div><span className="portfolio-overline">MACRO OBSERVATORY</span><h2>宏观指标</h2></div><span>筹备中</span></div>
    <p>给影响市场的长期线索留一个观察窗口。指标、数据来源和展示方式，将在这里逐步完善。</p>
    <div className="finance-macro-canvas"><ChartNoAxesCombined size={27} strokeWidth={1.2}/><span>宏观指标图表预留区</span></div>
    <div className="finance-macro-fields">{["指标选择", "数据来源", "观察周期"].map(label => <div key={label}><span>{label}</span><strong>待确定</strong></div>)}</div>
  </section>;
}
