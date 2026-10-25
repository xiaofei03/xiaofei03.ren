"use client";

import {useEffect, useState, type KeyboardEvent} from "react";
import {ArrowRight, ArrowUpRight} from "lucide-react";
import {labProjects} from "@/app/project-data";

const selection = labProjects.slice(0, 3);

export default function FeaturedProjects({open}:{open:(id:string,project?:string)=>void}) {
  const [active, setActive] = useState(0);
  const [vertical, setVertical] = useState(false);
  useEffect(()=>{
    const desktop=matchMedia("(min-width:801px)");
    const update=()=>setVertical(desktop.matches);
    update(); desktop.addEventListener("change",update);
    return ()=>desktop.removeEventListener("change",update);
  },[]);
  const project = selection[active];
  function changeWithKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (index + 1) % selection.length
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index + selection.length - 1) % selection.length
      : event.key === "Home" ? 0 : event.key === "End" ? selection.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`project-tab-${selection[next].id}`)?.focus();
  }
  return <div className="featured-projects">
    <div className="project-selector"><div className="project-choices" role="tablist" aria-label="精选 AI 作品" aria-orientation={vertical?"vertical":"horizontal"}>
      {selection.map((p,index)=><button key={p.id} id={`project-tab-${p.id}`} role="tab"
        aria-label={p.name} aria-selected={index===active} aria-controls="featured-project-panel" tabIndex={index===active?0:-1}
        onClick={()=>setActive(index)} onKeyDown={event=>changeWithKeys(event,index)}>
        <img src={p.logo} width={44} height={44} alt=""/>
        <span><strong>{p.name}</strong><span>{p.tagline}</span></span>
        <ArrowRight size={20} aria-hidden="true"/>
      </button>)}
    </div><p className="project-collection-note">从研究中的问题出发，<br/>做一些自己也会使用的工具。</p></div>
    <div className="featured-project-panel" id="featured-project-panel" role="tabpanel"
      aria-labelledby={`project-tab-${project.id}`} tabIndex={0}>
      <button className="featured-project-art" onClick={()=>open("projects",project.id)} aria-label={`查看${project.name}项目详情`}>
        <img key={project.id} src={project.cover} alt={`${project.name}：${project.coverCaption}`} loading="lazy" width={1400} height={860}/>
      </button>
      <div className="featured-project-caption"><p>{project.summary}</p><button onClick={()=>open("projects",project.id)} aria-label={`探索${project.name}项目`}>探索项目 <ArrowUpRight size={17}/></button></div>
    </div>
  </div>;
}
