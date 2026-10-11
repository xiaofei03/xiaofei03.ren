import { storedPosts,persistPost,mediaRecord } from '@/server/storage';
import { requireSession,apiError } from '@/server/security';
import { validateDocument,documentText,documentMedia,documentHasImage } from '@/lib/article-document';
import { readJson } from '@/server/request-body';
import type { Post } from '@/app/seed-posts';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const all=new URL(request.url).searchParams.get('all')==='1';if(all)requireSession(request);const posts=storedPosts(all);return Response.json({posts},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function POST(request:Request){try{
 requireSession(request,true);const data=await readJson(request);const id=String(data.id||''),title=String(data.title||'').trim(),category=String(data.category||'生活'),date=String(data.date||'');
 const mode=data.mode||'draft',parsedDate=new Date(date+'T00:00:00Z');if(!['draft','publish','unpublish','autosave'].includes(mode)||!Number.isInteger(data.revision)||data.revision<0||!title||title.length>150||!['生活','研究','AI 与工具','阅读'].includes(category)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsedDate.getTime())||parsedDate.toISOString().slice(0,10)!==date||!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw new Error('请检查标题、分类、日期和正文。');
 const document=data.document?validateDocument(data.document):null;
 const content=document?documentText(document):String(data.content||'').trim();if(content.length>250000)throw new Error('文章过长，请分篇保存。');
 const coverId=data.coverId?String(data.coverId):null,attachmentKey=data.attachmentKey?String(data.attachmentKey):null;
 for(const m of [...(document?documentMedia(document):[]),...(coverId?[coverId]:[])]){if(mediaRecord(m)?.kind!=='image')throw new Error('图片格式无效。');}
 const attachment=attachmentKey?mediaRecord(attachmentKey):null;if(attachmentKey&&attachment?.kind!=='attachment')throw new Error('原稿格式无效。');
 if(mode==='publish'&&!content&&!attachmentKey&&!(document&&documentHasImage(document)))throw new Error('发布前请写一点正文，插入图片，或上传原稿。');
 const post:Post={id,title,category,date,content,document,coverId,attachmentKey,attachmentName:attachment?.filename||null,status:'draft',excerpt:String(data.excerpt||content.replace(/\s+/g,' ').slice(0,100)).slice(0,200),updatedAt:new Date().toISOString()};
 return Response.json({post:persistPost(post,mode,data.revision)},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return apiError(e);}}
