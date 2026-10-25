"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeScene from "./home-scene";
import { personalSections, sectionHref } from "./section-navigation";
import useSectionTools from "@/components/useSectionTools";

export default function Desktop() {
  const router = useRouter();
  useSectionTools();
  useEffect(() => {
    const host = document.querySelector<HTMLElement>(".home-scene");
    if (!host) return;
    const scenes = Array.from(host.querySelectorAll<HTMLElement>(":scope > section"));
    const screen = matchMedia("(min-height: 600px) and (prefers-reduced-motion: no-preference)");
    let frame = 0, disposed = false;
    const check = () => {
      frame = 0;
      const fits = scenes.every(scene => scene.offsetHeight <= innerHeight + 2 && scene.scrollHeight <= scene.clientHeight + 2);
      document.documentElement.dataset.homeSnap = screen.matches && fits ? "true" : "relaxed";
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(check); };
    const observer = new ResizeObserver(schedule);
    scenes.forEach(scene => observer.observe(scene));
    window.addEventListener("resize", schedule);
    screen.addEventListener("change", schedule);
    host.addEventListener("load", schedule, true);
    host.addEventListener("animationend", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    void document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      screen.removeEventListener("change", schedule);
      host.removeEventListener("load", schedule, true);
      host.removeEventListener("animationend", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
      delete document.documentElement.dataset.homeSnap;
    };
  }, []);
  useEffect(() => {
    const id = location.hash.slice(1);
    // Preserve links from the earlier desktop-window edition.
    if (personalSections.some(s => s.id === id)) router.replace(sectionHref(id));
  }, [router]);
  return <main className="desktop">
    <HomeScene open={(id, project) => router.push(sectionHref(id, project))}/>
  </main>;
}
