"use client";
import {useEffect,useRef} from "react";
import {ArrowDown,ArrowUpRight,BookOpen,ChevronRight,FlaskConical,Sparkles,UserRound} from "lucide-react";
import {labProjects} from "./project-data";
import TechText from "@/components/TechText";
import SkyScene from "@/components/SkyScene";
import "./home-scene.css";


const cordY=(x:number)=>174-1300*(Math.cosh((x-630)/1300)-1);
const cordPath=Array.from({length:106},(_,i)=>{const x=i*12;return `${i?"L":"M"}${x} ${cordY(x).toFixed(3)}`;}).join(" ");

const paths=[
 {id:"education",title:"求学时光",description:"从东北大学，到中国科学技术大学",number:"01"},
 {id:"experience",title:"实习经历",description:"把课堂里的问题，带到真实工作中",number:"02"},
 {id:"research",title:"研究手记",description:"管理学、企业发展与人工智能",number:"03"},
 {id:"awards",title:"荣誉收藏",description:"一路积累的努力与回声",number:"04"},
 {id:"practice",title:"志愿实践",description:"走出自己的世界，认识更多的人",number:"05"}
];

export default function HomeScene({open,motionPaused=false}:{open:(id:string,project?:string)=>void;motionPaused?:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;let dispose=()=>{};
  async function setup(){
   const [{gsap},{ScrollTrigger}]=await Promise.all([import("gsap"),import("gsap/ScrollTrigger")]);
   if(cancelled||!root.current)return;
   gsap.registerPlugin(ScrollTrigger);
   const host=root.current,hero=host.querySelector<HTMLElement>(".home-hero")!;
   const mm=gsap.matchMedia();
   mm.add({desktop:"(min-width: 801px)",mobile:"(max-width: 800px)",reduce:"(prefers-reduced-motion: reduce)"},context=>{
    const {desktop,reduce}=context.conditions!;
    if(reduce)return;
    const intro=gsap.timeline({defaults:{duration:.65,ease:"power3.out"}});
    intro.fromTo(".hero-title-line",{y:40,opacity:0},{y:0,opacity:1,stagger:.07},0)
     .fromTo(".scene-object.scene-enter",{y:25,opacity:0},{y:0,opacity:1,stagger:.06},.18)
     .fromTo(".hero-footer",{opacity:0,y:12},{opacity:1,y:0},.3);
    gsap.fromTo(".hero-figure.scene-enter",{yPercent:110,opacity:1,rotation:0},{yPercent:0,opacity:1,duration:3,ease:"sine.inOut",scrollTrigger:{trigger:host.querySelector(".portrait-stage"),start:"top 98%",once:true}});
    const name=host.querySelector<HTMLElement>(".hero-title")!;
    const figure=host.querySelector<HTMLElement>(".hero-figure .scene-depth")!;
    const orbit=host.querySelector<HTMLElement>(".orbit-wire")!;
    const setNameY=gsap.quickSetter(name,"y","px"),setNameScale=gsap.quickSetter(name,"scale");
    const setFigureY=gsap.quickSetter(figure,"y","px"),setFigureScale=gsap.quickSetter(figure,"scale");
    const setOrbitY=gsap.quickSetter(orbit,"y","px");
    let scrollFrame=0;
    const renderScroll=()=>{scrollFrame=0;const r=hero.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/r.height));setNameY(-60*p);setNameScale(1-.14*p);setFigureY((desktop?190:38)*p);setFigureScale(1-.3*p);setOrbitY(-32*p);};
    const requestScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll);};
    window.addEventListener("scroll",requestScroll,{passive:true});window.addEventListener("resize",requestScroll);
    renderScroll();
    const swing=(e:PointerEvent)=>{const entry=(e.target as HTMLElement).closest<HTMLElement>(".orbit-entry");if(!entry||entry.contains(e.relatedTarget as Node))return;const hanger=entry.querySelector(".orbit-hanger");gsap.killTweensOf(hanger);gsap.timeline().to(hanger,{rotation:-11,duration:.18,ease:"power2.out"}).to(hanger,{rotation:8,duration:.24,ease:"sine.inOut"}).to(hanger,{rotation:-4,duration:.23,ease:"sine.inOut"}).to(hanger,{rotation:0,duration:.38,ease:"power2.out"});};
    const keyboardSwing=(e:FocusEvent)=>swing(e as unknown as PointerEvent);
    hero.addEventListener("pointerover",swing);hero.addEventListener("focusin",keyboardSwing);
    const cleanupScroll=()=>{window.removeEventListener("scroll",requestScroll);window.removeEventListener("resize",requestScroll);if(scrollFrame)cancelAnimationFrame(scrollFrame);hero.removeEventListener("pointerover",swing);hero.removeEventListener("focusin",keyboardSwing);gsap.killTweensOf(host.querySelectorAll(".orbit-hanger"));gsap.set([name,figure,orbit],{clearProps:"transform"});};
    const journey=host.querySelector(".home-journey")!;
    gsap.from(".journey-copy>*, .journey-links>button",{scrollTrigger:{trigger:journey,start:"top 82%",once:true},y:26,opacity:0,stagger:.07,duration:.7,ease:"power3.out"});
    const work=host.querySelector(".home-work")!;
    gsap.from(".home-project",{scrollTrigger:{trigger:work,start:"top 80%",once:true},y:28,opacity:0,stagger:.12,duration:.7,ease:"power3.out"});
    gsap.fromTo(".home-project-image",{clipPath:"inset(0% 0% 100% 0%)"},{scrollTrigger:{trigger:work,start:"top 80%",once:true},clipPath:"inset(0% 0% 0% 0%)",stagger:.12,duration:.9,ease:"power3.inOut"});
    gsap.fromTo(".journal-portrait-motion",{xPercent:-110,rotation:70,opacity:0,transformOrigin:"0% 100%"},{scrollTrigger:{trigger:host.querySelector(".journal-portrait"),start:"top 88%",once:true},xPercent:0,rotation:0,opacity:1,duration:2,ease:"sine.inOut"});
    gsap.fromTo(".journal-handwriting",{y:28,rotation:-8,opacity:0},{scrollTrigger:{trigger:host.querySelector(".home-journal"),start:"top 82%",once:true},y:0,rotation:0,opacity:1,delay:.25,duration:.75,ease:"back.out(1.25)"});
    if(!desktop||!matchMedia("(pointer:fine)").matches)return cleanupScroll;
    const drift=Array.from(host.querySelectorAll<HTMLElement>(".hero-figure .scene-drift"));
    const motions=drift.map((el,i)=>({x:gsap.quickTo(el,"x",{duration:.8,ease:"power3.out"}),y:gsap.quickTo(el,"y",{duration:.8,ease:"power3.out"}),weight:[11,-15,9,-10,13][i]||8}));
    const move=(e:PointerEvent)=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;motions.forEach(m=>{m.x(x*m.weight*2);m.y(y*m.weight*2);});};
    const leave=()=>motions.forEach(m=>{m.x(0);m.y(0);});
    hero.addEventListener("pointermove",move);hero.addEventListener("pointerleave",leave);
    return()=>{cleanupScroll();hero.removeEventListener("pointermove",move);hero.removeEventListener("pointerleave",leave);};
   },host);
   dispose=()=>mm.revert();
   const refresh=()=>ScrollTrigger.refresh();
   const images=Array.from(host.querySelectorAll("img"));
   await Promise.all(images.map(img=>img.decode().catch(()=>{})));
   if(!cancelled)refresh();
  }
  void setup();return()=>{cancelled=true;dispose();};
 },[]);
 return <div className="home-scene" ref={root}>
  <section className="home-hero" aria-label="认识孙烁飞">
   <SkyScene paused={motionPaused}/>
   <div className="scene-paper-grid" aria-hidden="true"/>
   <div className="hero-topline"><span><Sparkles size={17}/>一个关于我，也关于好奇心的地方</span></div>
    <div className="orbit-wire"><svg className="scene-orbit-line" viewBox="0 0 1260 300" fill="none" aria-hidden="true">
     <defs><filter id="cord-shadow" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="1.7" floodColor="#24435c" floodOpacity=".24"/></filter></defs>
     <g filter="url(#cord-shadow)"><path d={cordPath} stroke="#8b7351" strokeWidth="5.5"/><path d={cordPath} stroke="#e2cdab" strokeWidth="4"/><path d={cordPath} stroke="#aa8d66" strokeWidth="3.5" strokeDasharray="1 4"/><path d={cordPath} stroke="#f0e1c8" strokeWidth=".8"/></g>
    </svg><span className="cord-nail cord-nail-left" aria-hidden="true"/><span className="cord-nail cord-nail-right" aria-hidden="true"/>
    {[0,1].map(row=><div className="mobile-cord-row" key={row} aria-hidden="true"><svg viewBox="0 0 100 24" preserveAspectRatio="none" fill="none"><path d="M 0 2 Q 50 21 100 2" stroke="#8b7351" strokeWidth="1.6"/><path d="M 0 2 Q 50 21 100 2" stroke="#e2cdab" strokeWidth="1"/><path d="M 0 2 Q 50 21 100 2" stroke="#aa8d66" strokeWidth=".8" strokeDasharray=".3 1.2"/><path d="M 0 2 Q 50 21 100 2" stroke="#f0e1c8" strokeWidth=".2"/></svg></div>)}
    <nav className="scene-orbit-nav" aria-label="探索我的各个方面">
     <div className="scene-object scene-practice scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("practice")} aria-label="打开志愿实践"><img className="scene-cutout" src="/assets/home-v2/practice-care.webp" alt="双手托起红色爱心的立体物件" width={320} height={320}/><span>志愿实践 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-experience scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("experience")} aria-label="打开实习经历"><img className="scene-cutout" src="/assets/home-v2/experience-work.webp" alt="立体皮质手提箱" width={320} height={320}/><span>实习经历 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-trophy scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("awards")} aria-label="打开荣誉收藏"><img src="/assets/home-v2/trophy.webp" alt="装饰奖杯" width={362} height={480}/><span>荣誉收藏 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-research scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("research")} aria-label="打开研究手记"><img className="scene-cutout" src="/assets/home-v2/research-lens.webp" alt="立体蓝色放大镜" width={320} height={320}/><span>研究手记 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-ai scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("projects")} aria-label="打开 AI 实验室"><div className="scene-ai-mark"><img src="/assets/home-v2/chatgpt-mark.svg" alt="ChatGPT 标志" width={80} height={80}/></div><span>AI 实验室 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-notebook scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("notes")} aria-label="打开随笔"><img src="/assets/notebook-cobalt.webp" alt="蓝色笔记本与铅笔"/><span>随笔 <ArrowUpRight size={14}/></span></button></div></div></div></div>
     <div className="scene-object scene-school scene-enter orbit-entry"><div className="scene-depth"><div className="scene-drift"><div className="orbit-hanger"><button onClick={()=>open("education")} aria-label="打开求学时光"><img src="/assets/ustc-seal.png" alt="中国科学技术大学校徽"/><span>求学时光 <ArrowUpRight size={14}/></span></button></div></div></div></div>
    </nav></div>
   <div className="hero-main"><div className="hero-left">
   <div className="hero-title">
    <p className="hero-greeting hero-title-line">你好，很高兴认识你。</p>
    <div className="hero-name"><h1 className="hero-title-line"><TechText text="孙烁飞" fontWeight={600} fontSize={150} fontFamily={'"Songti SC", "Noto Serif SC", "STSong", serif'} align="start" reveal="letter" dashLength={4} dashGap={2} specks={15} color="#17374c" accentColor="#315f85" letterSpacing={-0.05} reach={200} softness={0.7} strokeWidth={1.5} speed={1} lineStyle="dashed" selection labels draggable sweep/><span className="hero-roman">Sofian Sun</span></h1></div>
    <div className="hero-identity hero-title-line"><span>管理学 × AI</span><span>中国科学技术大学</span></div>
    <p className="hero-description hero-title-line">在数据里寻找答案，<br/>在生活里收集问题。</p>
    <div className="hero-primary-enter hero-title-line"><button className="hero-primary" onClick={()=>open("about")}>从这里认识我 <ArrowUpRight size={20}/></button></div>
   </div>
   </div><div className="hero-orbit">

   <div className="portrait-stage"><div className="hero-figure scene-enter"><div className="scene-depth"><div className="scene-drift"><button onClick={()=>open("about")} aria-label="查看关于孙烁飞"><img className="hero-person" src="/assets/home-v2/portrait-side.webp" alt="孙烁飞戴着帽子、手扶帽檐的侧脸插画" width={879} height={1000} fetchPriority="high"/><span className="hero-signature">好奇心，未完待续 <Sparkles size={16}/></span></button></div></div></div>
   </div></div></div>
   <div className="hero-footer"><a className="scene-scroll-hint" href="#journey">往下，慢慢认识 <ArrowDown size={16}/></a></div>
  </section>
  <section className="home-journey" id="journey">
   <div className="journey-copy"><span className="section-kicker"><UserRound size={17}/>不止一张简历</span><h2>几条不同的路，<br/>构成今天的我。</h2><p>学习、研究、工作与志愿实践，是我认识世界的几种方式。这里收集着一路走来的经历，也保留着下一步的可能。</p><button className="home-inline-link" onClick={()=>open("about")}>关于我 <ArrowUpRight size={18}/></button></div>
   <div className="journey-links">{paths.map(p=><button key={p.id} onClick={()=>open(p.id)}><span className="journey-number">{p.number}</span><span><strong>{p.title}</strong><span>{p.description}</span></span><ArrowUpRight size={23}/></button>)}</div>
  </section>
  <section className="home-work" aria-labelledby="home-work-title">
   <header className="home-section-header"><div><span className="section-kicker"><FlaskConical size={17}/>AI 实验室</span><h2 id="home-work-title">把想法，做成作品。</h2></div><button className="home-inline-link" onClick={()=>open("projects")}>全部 6 个项目 <ArrowUpRight size={18}/></button></header>
   <div className="home-projects">{labProjects.slice(0,3).map(p=><button key={p.id} className="home-project" data-project={p.id} onClick={()=>open("projects",p.id)}><div className="home-project-image"><img src={p.cover} alt={`${p.name}工作流`} loading="lazy"/></div><div className="home-project-name"><h3>{p.name}</h3><ArrowUpRight size={22}/></div><p>{p.summary}</p></button>)}</div>
  </section>
  <section className="home-journal" aria-labelledby="home-journal-title"><div className="journal-portrait"><div className="journal-portrait-motion"><img src="/assets/home-v2/avatar-front.webp" alt="孙烁飞的正面插画头像" width={581} height={640}/><span className="journal-handwriting">记录，也是一种探索。</span></div></div><div className="home-journal-copy"><span className="section-kicker"><BookOpen size={17}/>随笔</span><h2 id="home-journal-title">给生活和想法，<br/>留一点空白。</h2><p>研究之外，也想记下阅读、旅行和日常里那些值得停一停的瞬间。</p><a className="home-inline-link" href="/notes">翻翻我的随笔 <ChevronRight size={19}/></a></div></section>
  <footer className="home-page-footer"><span>孙烁飞 · 一张不断生长的桌面</span><a href="mailto:sunshuofei@mail.ustc.edu.cn">聊点有意思的 <ArrowUpRight size={16}/></a></footer>
 </div>;
}
