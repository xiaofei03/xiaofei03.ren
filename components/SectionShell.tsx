"use client";
import { type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "./SectionLink";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { personalSections, sectionHref } from "@/app/section-navigation";
import useSectionTools from "./useSectionTools";
import "./SectionShell.css";
import {MotionToggle} from './MotionPreferences';

export default function SectionShell({ children, active }: { children: ReactNode; active?: string }) {
  const pathname = usePathname();
  const id = active || pathname?.split("/")[2] || "about";
  const index = Math.max(0, personalSections.findIndex(s => s.id === id));
  const section = personalSections[index];
  useSectionTools();

  return <div className="section-shell" style={{ "--section-accent": section.color } as CSSProperties}>
    <a className="section-skip" href="#section-content">跳到正文</a>
    <aside className="section-rail" aria-label="个人板块导航">
      <nav className="section-categories" aria-label="分类导航">
        {personalSections.map(s => <Link key={s.id} href={sectionHref(s.id)} className={`section-category${section.id === s.id ? " is-current" : ""}`} aria-label={s.label} aria-current={section.id === s.id ? "page" : undefined} style={{ "--orb-color": s.color } as CSSProperties}>
          <span className={`rail-object rail-object-${s.id}`}><img src={s.image} alt="" width={48} height={48}/></span>
          <span className="rail-label" aria-hidden="true">{s.label}<ChevronRight size={13}/></span>
        </Link>)}
      </nav>
    </aside>
    <div className="section-stage">
      <header className="section-toolbar"><div><Link href="/" className="section-exit" aria-label="退出板块，回到首页"><ArrowLeft size={19}/><span className="exit-label">回到首页</span></Link><span className="section-breadcrumb">日光之间</span><ChevronRight size={14}/><strong>{section.label}</strong></div><div><span className="section-location">合肥，中国</span><MotionToggle/></div></header>
      <div className={`section-content window-content section-content-${section.id}`} key={pathname} id="section-content" tabIndex={-1}>{children}</div>
    </div>
  </div>;
}
