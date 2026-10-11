import {notFound} from 'next/navigation';
import {findPost} from '@/app/post-store';
import {getAdministrator} from '@/app/admin-auth';
import Markdown from '@/app/markdown';
import RichArticle from '@/app/rich-article';
import {FileText,NotebookPen} from 'lucide-react';
export const dynamic='force-dynamic';
export default async function Article({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{preview?:string}>}){
 const {id}=await params,q=await searchParams,admin=await getAdministrator(),preview=!!admin&&q.preview==='1';
 const post=await findPost(id,preview);if(!post)notFound();
 return <main className="journal-page"><header className="journal-nav"><a href="/notes" className="journal-brand"><span className="brand-mark">S.</span>日光之间</a><a href="/">回到首页</a></header><article className="article-container">
 {preview&&<p className="article-preview-banner">正在预览编辑中的草稿。这些修改只有你可见，点击“发布”后才会更新访客看到的文章。</p>}
 <div className="note-meta"><span>{post.category}</span><time>{post.date.replaceAll('-','.')}</time><span>{post.sample?'示例文章':`${Math.max(1,Math.ceil(post.content.length/450))} 分钟阅读`}</span></div><h1>{post.title}</h1>
 <div className="article-byline"><img src="/assets/home-v2/avatar-front.webp" alt=""/><span>孙烁飞</span>{admin&&<a href={`/studio?edit=${id}`} className="quiet-link"><NotebookPen size={14}/>编辑文章</a>}</div>
 {post.coverId&&<img className="article-cover" src={`/api/media/${post.coverId}`} alt={`${post.title}的封面`}/>}
 {post.document?<RichArticle document={post.document}/>:<Markdown content={post.content}/>}
 {post.attachmentName&&<div className="article-attachment"><FileText size={22}/><div><b>文章原稿</b><span>{post.attachmentName}</span></div><a className="outline-button" href={`/api/media/${post.attachmentKey}`} target="_blank" rel="noreferrer">查看原稿</a><a className="quiet-link" href={`/api/media/${post.attachmentKey}?download=1`} download>下载</a></div>}
 <footer className="article-footer"><span className="handwriting">Thanks for reading.</span><a href="/notes">继续翻翻笔记</a></footer></article></main>;
}
