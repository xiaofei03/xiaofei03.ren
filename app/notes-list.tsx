"use client";
import { useEffect,useState } from "react";
import { Search } from "lucide-react";
import { Tabs,TabsList,TabsTrigger } from "@/components/ui/tabs";
import "./rich-article.css";
import type { Post } from "./seed-posts";
export default function NotesList({compact=false}:{compact?:boolean}){
 const [posts,setPosts]=useState<Post[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false),[category,setCategory]=useState("全部"),[query,setQuery]=useState("");
 async function reload(){setLoading(true);setError(false);try{const r=await fetch('/api/posts');if(!r.ok)throw new Error();const d=await r.json() as {posts:Post[]};setPosts(d.posts);}catch{setError(true);}finally{setLoading(false);}}
 useEffect(()=>{void reload();},[]);
 const filtered=posts.filter(p=>(category==='全部'||category===p.category)&&(!query||`${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase())));
 return <div className={`notes-list ${compact?'compact':''}`}>
 {!compact&&<div className="notes-toolbar"><Tabs value={category} onValueChange={setCategory}><TabsList variant="line">{['全部','生活','研究','AI 与工具','阅读'].map(c=><TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList></Tabs><label className="search-box"><Search size={17}/><input type="search" placeholder="找一篇文章" aria-label="搜索随笔" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>}
 {loading?<div className="loading-notes" role="status">正在翻开笔记…</div>:error?<div className="notes-empty"><p>暂时没有读到文章。</p><button className="outline-button" onClick={reload}>再试一次</button></div>:filtered.length===0?<div className="notes-empty"><p>这一页还没有笔记。</p>{query&&<button className="quiet-link" onClick={()=>setQuery('')}>清除搜索</button>}</div>:filtered.map((p,i)=><a className="note-row" key={p.id} href={`/notes/${p.id}`}><span className="note-number">{String(i+1).padStart(2,'0')}</span><div><div className="note-meta"><span>{p.category}</span><time>{p.date.replaceAll('-','.')}</time>{p.sample&&<span className="note-sample">示例</span>}</div><h3>{p.title}</h3><p>{p.excerpt||'打开这篇文章，慢慢读。'}</p></div>{p.coverId&&<img className="note-cover" src={`/api/media/${p.coverId}`} alt="" loading="lazy"/>}<span className="reading-time">{Math.max(1,Math.ceil(p.content.length/450))} 分钟</span></a>)}
 </div>;
}
