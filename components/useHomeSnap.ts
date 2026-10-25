"use client";

import {useEffect} from "react";

/** Keep native page snapping without turning a long scene into a scroll trap. */
export default function useHomeSnap() {
  useEffect(()=>{
    const host=document.querySelector<HTMLElement>(".home-scene");
    if(!host) return;
    const scenes=Array.from(host.querySelectorAll<HTMLElement>(":scope > section"));
    const root=document.documentElement;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    const viewport=window.visualViewport;
    let disposed=false, touching=false, frame=0, timer:ReturnType<typeof setTimeout>;
    let lastScroll=0, appliedHeight=0;
    const mode=(value:string)=>{if(root.dataset.homeSnap!==value)root.dataset.homeSnap=value;};
    const later=(delay=180)=>{clearTimeout(timer);timer=setTimeout(schedule,delay);};
    const check=()=>{
      frame=0;
      if(disposed)return;
      // Never reflow or enable snapping under an active pan/pinch gesture.
      if((viewport?.scale??1)>1.02){mode("off");return;}
      if(touching||performance.now()-lastScroll<180){later();return;}
      const height=Math.round(viewport?.height??innerHeight);
      const width=Math.round(viewport?.width??innerWidth);
      if(height!==appliedHeight){
        appliedHeight=height;
        host.style.setProperty("--home-vh",`${height}px`);
      }
      // offsetHeight describes the layout; entrance transforms must not change mode.
      const sizes=scenes.map(scene=>scene.offsetHeight);
      scenes.forEach((scene,index)=>{
        const fit=sizes[index]<=height+2?"page":"flow";
        if(scene.dataset.snapFit!==fit)scene.dataset.snapFit=fit;
      });
      mode(reduce.matches||(width>height&&height<500)?"off":"true");
    };
    function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(check);}
    const resize=()=>{
      if((viewport?.scale??1)>1.02)mode("off");
      later(160);
    };
    const scroll=()=>{lastScroll=performance.now();later();};
    const touchStart=()=>{touching=true;};
    const touchEnd=(event:TouchEvent)=>{touching=event.touches.length>0;if(!touching)later();};
    const observer=new ResizeObserver(schedule);
    scenes.forEach(scene=>observer.observe(scene));
    window.addEventListener("resize",resize);
    window.addEventListener("scroll",scroll,{passive:true});
    window.addEventListener("touchstart",touchStart,{passive:true});
    window.addEventListener("touchend",touchEnd,{passive:true});
    window.addEventListener("touchcancel",touchEnd,{passive:true});
    viewport?.addEventListener("resize",resize);
    reduce.addEventListener("change",schedule);
    document.fonts.addEventListener("loadingdone",schedule);
    host.addEventListener("load",schedule,true);
    void document.fonts.ready.then(schedule);
    schedule();
    return()=>{
      disposed=true;observer.disconnect();cancelAnimationFrame(frame);clearTimeout(timer);
      window.removeEventListener("resize",resize);
      window.removeEventListener("scroll",scroll);
      window.removeEventListener("touchstart",touchStart);
      window.removeEventListener("touchend",touchEnd);
      window.removeEventListener("touchcancel",touchEnd);
      viewport?.removeEventListener("resize",resize);
      reduce.removeEventListener("change",schedule);
      document.fonts.removeEventListener("loadingdone",schedule);
      host.removeEventListener("load",schedule,true);
      host.style.removeProperty("--home-vh");
      scenes.forEach(scene=>delete scene.dataset.snapFit);
      delete root.dataset.homeSnap;
    };
  },[]);
}
