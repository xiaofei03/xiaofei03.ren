export type ArticleNode = { type: string; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[]; content?: ArticleNode[] };
const blocks = new Set(['doc','paragraph','heading','text','bulletList','orderedList','listItem','blockquote','codeBlock','hardBreak','horizontalRule','image']);
const marks = new Set(['bold','italic','strike','underline','code','link']);
export const mediaIdFromUrl = (url: unknown) => typeof url === 'string' ? url.match(/^\/api\/media\/([a-f0-9-]{36})$/)?.[1] : undefined;
export function safeLink(value: unknown): string | undefined {
 if(typeof value !== 'string' || value.length > 2048) return;
 try { const url = new URL(value); if(['http:','https:','mailto:'].includes(url.protocol)) return value; } catch {}
}
export function safeImage(value: unknown): string | undefined {
 if(mediaIdFromUrl(value)) return value as string;
 if(typeof value === 'string' && /^\/assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(value) && !value.includes('..')) return value;
}
export function validateDocument(value: unknown): ArticleNode {
 let count = 0, length = 0;
 function clean(v: unknown, depth: number): ArticleNode {
  if(depth > 32 || ++count > 8000 || !v || typeof v !== 'object') throw new Error('文章结构过大或格式无效。');
  const n = v as ArticleNode;
  if(!blocks.has(n.type)) throw new Error('文章包含不支持的内容。');
  const out: ArticleNode = { type: n.type };
  if(n.type === 'text') { if(typeof n.text !== 'string') throw new Error('正文格式无效。'); length += n.text.length; out.text = n.text; }
  if(length > 250000) throw new Error('文章过长，请分篇保存。');
  if(n.marks) {if(!Array.isArray(n.marks)||n.marks.length>8)throw new Error('文字样式无效。');out.marks = n.marks.map(m => { if(!m||!marks.has(m.type)) throw new Error('文字样式无效。'); if(m.type === 'link'){const href=safeLink(m.attrs?.href);if(!href)throw new Error('链接格式无效。');return {type:'link',attrs:{href}};} return {type:m.type}; });}
  if(n.type === 'heading') out.attrs = {level:[1,2,3].includes(Number(n.attrs?.level))?Number(n.attrs?.level):2};
  if(n.type === 'orderedList') out.attrs={start:Math.max(1,Math.min(10000,Number(n.attrs?.start)||1))};
  if(n.type === 'codeBlock') out.attrs={language:String(n.attrs?.language||'').slice(0,40)};
  if(n.type === 'image') { const src=safeImage(n.attrs?.src); if(!src)throw new Error('请使用正文插图按钮上传图片。');out.attrs={src,alt:String(n.attrs?.alt||'').slice(0,300),caption:String(n.attrs?.caption||'').slice(0,500),size:n.attrs?.size==='compact'?'compact':'full'}; }
  if(n.content){if(!Array.isArray(n.content))throw new Error('正文格式无效。');out.content=n.content.map(x=>clean(x,depth+1));}
  return out;
 }
 const doc=clean(value,0);if(doc.type!=='doc')throw new Error('正文格式无效。');return doc;
}
export function documentText(node: ArticleNode): string { return node.type==='text'?node.text||'':(node.content||[]).map(documentText).join(['doc','bulletList','orderedList','blockquote'].includes(node.type)?'\n\n':''); }
export function documentMedia(node: ArticleNode): string[] { const ids: string[]=[]; const visit=(n:ArticleNode)=>{const id=mediaIdFromUrl(n.attrs?.src);if(id)ids.push(id);n.content?.forEach(visit);};visit(node);return [...new Set(ids)]; }
export function documentHasImage(node:ArticleNode):boolean{return node.type==='image'||!!node.content?.some(documentHasImage);}
