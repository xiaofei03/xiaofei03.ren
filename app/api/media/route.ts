import { randomUUID } from 'node:crypto';
import { requireSession,apiError } from '@/server/security';
import { putMedia } from '@/server/storage';
import { readForm } from '@/server/request-body';
import { unzipSync } from 'fflate';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireSession(request,true);const form=await readForm(request);const file=form.get('file'),postId=String(form.get('postId')||''),kind=form.get('kind')==='attachment'?'attachment':'image';
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(postId)||!(file instanceof File)||!file.size||file.size>10*1024*1024)throw new Error('请上传 10 MB 以内的有效文件。');
 const bytes=new Uint8Array(await file.arrayBuffer());let mime='';
 const signature=Buffer.from(bytes.slice(0,16));
 if(kind==='image'){
  if(signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
  else if(signature.toString('ascii',0,4)==='RIFF'&&signature.toString('ascii',8,12)==='WEBP')mime='image/webp';
  if(!mime)throw new Error('正文插图支持 JPG、PNG 和 WebP，请转换后再上传。');
 }else{
  if(/\.pdf$/i.test(file.name)&&signature.toString('ascii',0,5)==='%PDF-')mime='application/pdf';
  else if(/\.docx$/i.test(file.name)&&bytes[0]===80&&bytes[1]===75){const zip=unzipSync(bytes,{filter:f=>f.name==='word/document.xml'&&f.originalSize<2*1024*1024});if(!zip['word/document.xml'])throw new Error('Word 格式无效或正文过大。');mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document';}
  else if(/\.(md|txt)$/i.test(file.name)){new TextDecoder('utf-8',{fatal:true}).decode(bytes);mime='text/plain; charset=utf-8';}
  if(!mime)throw new Error('原稿支持 PDF、Word、Markdown 和 UTF-8 TXT。');
 }
 const id=randomUUID();putMedia({id,post_id:postId,filename:file.name.slice(0,200),mime,kind,size:file.size,created_at:new Date().toISOString()},bytes);
 return Response.json({media:{id,url:'/api/media/'+id,name:file.name,kind,size:file.size}},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return apiError(e);}}
