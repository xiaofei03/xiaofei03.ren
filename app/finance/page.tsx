import AuthForm from "@/app/admin/auth-form";
import { getAdministrator } from "@/app/admin-auth";
import { adminConfigured } from "@/server/storage";
import FinanceWorkspace from "./workspace";
import "./finance.css";
import "./dashboard.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "投资理财 · 日光之间",
  description: "整理观察，记录判断，慢慢建立自己的投资笔记。",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function FinancePage() {
  const admin = await getAdministrator();
  if (!admin) return <FinanceGate configured={adminConfigured()} />;
  return <FinanceWorkspace username={admin.username} csrf={admin.csrf} />;
}

function FinanceGate({ configured }: { configured: boolean }) {
  return <main className="finance-page finance-gated" data-finance-state="guest">
    <div className="finance-preview" aria-hidden="true" inert>
      <div className="finance-preview-heading"><p className="eyebrow">PERSONAL FINANCE</p><h1>投资理财</h1><p>整理观察，记录判断。</p></div>
      <div className="finance-preview-tabs"><span>总览</span><span>自选观察</span><span>资产记录</span><span>投资笔记</span></div>
      <div className="finance-preview-grid">
        <div className="finance-preview-paper"><div className="finance-preview-line"/><div className="finance-preview-line short"/><div className="finance-preview-ring"/></div>
        <div className="finance-preview-paper"><div className="finance-preview-line"/><div className="finance-preview-line short"/><div className="finance-preview-bars">{[44, 62, 48, 78, 66, 88].map(height => <span key={height} style={{ height: `${height}%` }}/>)}</div></div>
        <div className="finance-preview-paper wide">{[0, 1, 2].map(row => <div key={row} className="finance-preview-row"><span/><div><div className="finance-preview-line"/><div className="finance-preview-line short"/></div><div className="finance-preview-line"/></div>)}</div>
      </div>
    </div>
    <section className="finance-login-layer" aria-labelledby="finance-login-title">
      <AuthForm context="finance" embedded next="/finance" configured={configured}/>
    </section>
  </main>;
}
