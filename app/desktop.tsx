"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/SectionLink";
import { Mail } from "lucide-react";
import HomeScene from "./home-scene";
import { personalSections, sectionHref } from "./section-navigation";
import useSectionTools from "@/components/useSectionTools";
import ManageNotesLink from '@/components/ManageNotesLink';

export default function Desktop() {
  const router = useRouter();
  useSectionTools();
  useEffect(() => {
    const id = location.hash.slice(1);
    // Preserve links from the earlier desktop-window edition.
    if (personalSections.some(s => s.id === id)) router.replace(sectionHref(id));
  }, [router]);
  return <main className="desktop">
    <header className="menubar">
      <Link className="brand" href="/"><span className="brand-mark">S.</span><b>日光之间</b></Link>
      <nav aria-label="主导航">{["about", "research", "projects", "notes"].map(id => <Link key={id} href={sectionHref(id)}>{personalSections.find(s => s.id === id)!.label}</Link>)}</nav>
      <div className="menu-right"><span>合肥，中国</span><ManageNotesLink compact/><a href="mailto:sunshuofei@mail.ustc.edu.cn" aria-label="给烁飞发邮件"><Mail size={17}/></a></div>
    </header>
    <HomeScene open={(id, project) => router.push(sectionHref(id, project))}/>
  </main>;
}
