import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {safeImage,safeLink} from '@/lib/article-document';
import './rich-article.css';
export default function Markdown({content}:{content:string}){return <div className="article-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={(url,key)=>key==='src'?(safeImage(url)||''):(safeLink(url)||'')} components={{h1:()=>null,a:({children,href})=><a href={href} target="_blank" rel="noreferrer">{children}</a>,img:({src,alt})=>typeof src==='string'&&safeImage(src)?<img src={src} alt={alt||''} loading="lazy"/>:null}}>{content}</ReactMarkdown></div>;}
