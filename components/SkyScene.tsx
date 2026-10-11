"use client";

import { useEffect, useRef } from "react";
import "./SkyScene.css";

export default function SkyScene({ paused = false }: { paused?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = root.current;
    const hero = layer?.closest<HTMLElement>(".home-hero");
    if (!layer || !hero) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = true;
    let frame = 0;
    let bounds = hero.getBoundingClientRect();
    let x = 0, y = 0, targetX = 0, targetY = 0;
    const running = () => !paused && visible && !document.hidden && !reduce.matches;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      x = y = targetX = targetY = 0;
      layer.style.setProperty("--sky-shift-x", "0px");
      layer.style.setProperty("--sky-shift-y", "0px");
    };
    const tick = () => {
      frame = 0;
      if (!running() || !fine.matches) return;
      x += (targetX - x) * .06;
      y += (targetY - y) * .06;
      layer.style.setProperty("--sky-shift-x", `${x.toFixed(2)}px`);
      layer.style.setProperty("--sky-shift-y", `${y.toFixed(2)}px`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .05) frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!frame && running() && fine.matches) frame = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !running() || !fine.matches) return;
      targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
      targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 6;
      wake();
    };
    const leave = () => { targetX = targetY = 0; wake(); };
    const measure = () => { bounds = hero.getBoundingClientRect(); };
    const update = () => {
      layer.dataset.running = String(running());
      hero.dataset.motionActive = String(running());
      if (!running() || !fine.matches) reset();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    const resize = new ResizeObserver(measure);
    observer.observe(hero);
    resize.observe(hero);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", measure, { passive: true });
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener("change", update);
    fine.addEventListener("change", update);
    update();
    return () => {
      reset();
      layer.dataset.running = "false";
      observer.disconnect();
      resize.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", measure);
      document.removeEventListener("visibilitychange", update);
      reduce.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, [paused]);

  return <div ref={root} className="sky-scene" aria-hidden="true" data-running="false">
    <div className="sky-clouds">
      {["near", "far", "high", "wisp"].map((kind, i) => <div className={`sky-cloud sky-cloud-${kind}`} key={kind}>
        <div className="sky-cloud-parallax"><img src="/assets/home-v2/sky-cloud.webp" alt="" width={1200} height={428} decoding="async" className={i % 2 ? "sky-cloud-mirror" : undefined}/></div>
      </div>)}
    </div>
  </div>;
}
