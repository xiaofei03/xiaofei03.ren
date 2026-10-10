"use client";
import { useRouter } from "next/navigation";
import SectionView from "./views";
import { sectionHref } from "./section-navigation";

export default function SectionPage({ section, initialProject }: { section: string; initialProject?: string }) {
  const router = useRouter();
  return <main className="personal-section-page" key={`${section}:${initialProject || ""}`}><SectionView section={section} initialProject={initialProject} open={id => router.push(sectionHref(id))}/></main>;
}
