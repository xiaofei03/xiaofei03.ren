"use client";
import {useRef,useState} from "react";
import {ArrowLeft,ArrowUpRight,ChevronRight,ExternalLink,GitBranch,LockKeyhole} from "lucide-react";
import {labProjects,projectRepoUrl,projectEvidenceUrl,type LabProject} from "./project-data";
import "./project-lab.css";

export function ProjectCase({project:p,onBack}:{project:LabProject;onBack?:()=>void}){
 return <article className="lab-case" data-project={p.id}>
  {onBack&&<button className="lab-back" onClick={onBack}><ArrowLeft size={17}/>全部项目</button>}
  <header className="lab-case-heading"><img src={p.logo} alt=""/><div><span className="lab-category">{p.category}</span><h2>{p.name}</h2><p className="lab-english">{p.english}</p></div></header>
  <p className="lab-case-tagline">{p.tagline}</p>
  <p className="lab-case-summary">{p.summary}</p>
  <figure className="lab-case-figure" style={{background:p.background}}><img src={p.cover} alt={`${p.name}：${p.coverCaption}`}/><figcaption>{p.coverCaption}</figcaption></figure>
  <section className="lab-case-section"><h3>从一个真实需求开始</h3><p>{p.problem}</p></section>
  <section className="lab-case-section"><h3>把流程做完整</h3><div className="lab-capabilities">{p.features.map(f=><div key={f.title}><h4>{f.title}</h4><p>{f.body}</p></div>)}</div></section>
  <section className="lab-case-section"><h3>藏在界面背后的工作</h3>{p.engineering.map(e=><div className="lab-engineering" key={e.title}><h4>{e.title}</h4><p>{e.body}</p></div>)}</section>
  <section className="lab-case-section"><h3>使用的技术</h3><div className="lab-stack">{p.stack.map(s=><span key={s}>{s}</span>)}</div></section>
  {p.credit&&<p className="lab-credit">{p.credit.text} <a href={p.credit.url} target="_blank" rel="noreferrer">查看上游项目 <ArrowUpRight size={14}/></a></p>}
  <footer className="lab-case-footer"><a className="solid-button" href={projectRepoUrl(p)} target="_blank" rel="noreferrer"><GitBranch size={17}/>查看 GitHub {p.private&&<LockKeyhole size={14}/>}<ArrowUpRight size={16}/></a>{p.private&&<span>私有仓库，访问需要授权</span>}<div className="lab-source-links">{p.evidence.map(e=><a key={e.path} href={projectEvidenceUrl(p,e.path)} target="_blank" rel="noreferrer">{e.label}<ExternalLink size={12}/></a>)}</div></footer>
 </article>;
}

export default function ProjectLab({initialProject}:{initialProject?:string}){
 const [selected,setSelected]=useState<string|null>(initialProject||null);
 const [category,setCategory]=useState("全部");
 const root=useRef<HTMLDivElement>(null),scroll=useRef(0);
 const current=labProjects.find(p=>p.id===selected);
 function show(id:string){const pane=root.current?.closest(".window-content");scroll.current=pane?.scrollTop||0;setSelected(id);if(pane)pane.scrollTop=0;}
 function back(){setSelected(null);requestAnimationFrame(()=>{const pane=root.current?.closest(".window-content");if(pane)pane.scrollTop=scroll.current;});}
 const visible=labProjects.filter(p=>category==="全部"||p.category===category);
 return <div className="project-lab" ref={root}>{current?<ProjectCase key={current.id} project={current} onBack={back}/>:<>
  <header className="lab-heading"><div><h2>让想法成为可用的东西。</h2><p>从研究到日常，把问题拆开，再用代码接起来。</p></div><a className="lab-github-link" href="https://github.com/xiaofei03" target="_blank" rel="noreferrer"><GitBranch size={16}/>GitHub<ArrowUpRight size={15}/></a></header>
  <div className="lab-toolbar"><nav aria-label="项目分类">{["全部",...new Set(labProjects.map(p=>p.category))].map(c=><button key={c} className={category===c?"active":""} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</nav><span>{visible.length} 个项目</span></div>
  <div className="lab-grid">{visible.map((p,i)=><button className="lab-card" key={p.id} data-project={p.id} onClick={()=>show(p.id)} style={{"--lab-accent":p.accent,"--lab-background":p.background} as React.CSSProperties}>
   <span className="lab-card-cover"><img src={p.cover} alt={p.coverCaption} loading={i<2?"eager":"lazy"}/><span className="lab-open"><ArrowUpRight size={19}/></span></span>
   <span className="lab-card-copy"><span className="lab-card-meta">{p.category}<span>{p.english}</span></span><strong>{p.name}</strong><span className="lab-card-summary">{p.summary}</span><span className="lab-card-bottom"><span>{p.stack.slice(0,2).join(" · ")}</span><span>探索项目<ChevronRight size={14}/></span></span></span>
  </button>)}</div>
 </>}</div>;
}
