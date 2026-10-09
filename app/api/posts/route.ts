import { NextResponse } from "next/server";
import { editor,listPosts,savePost,findPost,bucket } from "@/app/post-store";
export const dynamic="force-dynamic";
const limit=10*1024*1024;
export async function GET(request:Request){try{const all=new URL(request.url).searchParams.get("all")==="1";if(all)await editor();return NextResponse.json({posts:await listPosts(all)},{headers:{"Cache-Control":"no-store"}});}catch(e){return NextResponse.json({error:(e as Error).message==="FORBIDDEN"?"只有站点主人可以管理随笔。":"文章暂时无法加载，请稍后重试。"},{status:(e as Error).message==="FORBIDDEN"?403:503});}}
export async function POST(request:Request){try{
 await editor();const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"请求来源无效。"},{status:403});
 if(Number(request.headers.get("content-length"))>limit+512000)return NextResponse.json({error:"文件大小请控制在 10 MB 以内。"},{status:413});
 const form=await request.formData();const title=String(form.get("title")||"").trim();const content=String(form.get("content")||"").trim();const category=String(form.get("category")||"生活");const date=String(form.get("date")||"");const status=String(form.get("status"));const id=String(form.get("id")||crypto.randomUUID());
 if(!title||title.length>150||content.length>250000||!['生活','研究','AI 与工具','阅读'].includes(category)||!['draft','published'].includes(status)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||! /^[a-zA-Z0-9-]{1,80}$/.test(id))return NextResponse.json({error:"请检查标题、分类、日期和正文。"},{status:400});
 const old=await findPost(id,true);let attachmentKey=old?.attachmentKey??null,attachmentName=old?.attachmentName??null;
 const upload=form.get("file");if(upload instanceof File&&upload.size){if(upload.size>limit||! /\.(pdf|docx|md|txt)$/i.test(upload.name))return NextResponse.json({error:"支持 PDF、Word、Markdown 和 TXT，最大 10 MB。"},{status:400});if(/\.pdf$/i.test(upload.name)){const magic=new TextDecoder().decode(await upload.slice(0,5).arrayBuffer());if(magic!=="%PDF-")return NextResponse.json({error:"这个文件不是有效的 PDF。"},{status:400});}const extension=upload.name.split('.').pop()!.toLowerCase();attachmentKey="posts/"+id+"/"+crypto.randomUUID()+"."+extension;attachmentName=upload.name.slice(0,200);await bucket().put(attachmentKey,await upload.arrayBuffer(),{httpMetadata:{contentType:extension==='pdf'?'application/pdf':'application/octet-stream'}});}
 if(!content&&!attachmentKey)return NextResponse.json({error:"请填写正文或上传文章。"},{status:400});
 const excerpt=String(form.get("excerpt")||content.replace(/[#>*`\[\]]/g,'').replace(/\s+/g,' ').slice(0,95)).slice(0,200);
 const post={id,title,content,category,date,status:status as 'draft'|'published',excerpt,attachmentKey,attachmentName,updatedAt:new Date().toISOString()};await savePost(post);return NextResponse.json({post});
 }catch(e){console.error("Post save failed",(e as Error).message);return NextResponse.json({error:(e as Error).message==="FORBIDDEN"?"请用站点主人的账号登录。":"保存没有完成，输入内容仍在，请稍后重试。"},{status:(e as Error).message==="FORBIDDEN"?403:503});}}
