import { requireChatGPTUser } from "../chatgpt-auth";
import { isEditor } from "../post-store";
import Studio from "./studio";
export const dynamic="force-dynamic";
export const metadata={title:"写作工作室 · 孙烁飞"};
async function ProtectedStudio({editId}:{editId?:string}){const user=await requireChatGPTUser('/studio'+(editId?'?edit='+encodeURIComponent(editId):''));if(!isEditor(user))return <main className="journal-page"><div className="article-container"><h1>这是烁飞的写作空间。</h1><p>只有站点主人可以编辑。你可以继续阅读已经发布的随笔。</p><a href="/notes" className="text-link">去读随笔</a></div></main>;return <Studio editId={editId}/>;}
export default async function StudioPage({searchParams}:{searchParams:Promise<{edit?:string}>}){const q=searchParams?await searchParams:{};return <ProtectedStudio editId={typeof q.edit==='string'?q.edit:undefined}/>;}
