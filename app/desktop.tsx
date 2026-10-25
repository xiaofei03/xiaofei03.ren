"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeScene from "./home-scene";
import { personalSections, sectionHref } from "./section-navigation";
import useSectionTools from "@/components/useSectionTools";
import useHomeSnap from "@/components/useHomeSnap";

export default function Desktop() {
  const router = useRouter();
  useSectionTools();
  useHomeSnap();
  useEffect(() => {
    const id = location.hash.slice(1);
    // Preserve links from the earlier desktop-window edition.
    if (personalSections.some(s => s.id === id)) router.replace(sectionHref(id));
  }, [router]);
  return <main className="desktop">
    <HomeScene open={(id, project) => router.push(sectionHref(id, project))}/>
  </main>;
}
