import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";
import { seedPosts,type Post } from "./seed-posts";
export function database(){if(!env.DB)throw new Error("DB unavailable");return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error("Storage unavailable");return env.BUCKET;}
export function isEditor(user:ChatGPTUser|null){const owner=env.OWNER_EMAIL||process.env.OWNER_EMAIL;return !!owner&&!!user&&user.email.toLowerCase()===owner.toLowerCase();}
export async function editor(){const user=await getChatGPTUser();if(!isEditor(user))throw new Error("FORBIDDEN");return user!;}
function mapRow(r:Record<string,unknown>):Post{return {id:String(r.id),title:String(r.title),category:String(r.category),content:String(r.content),excerpt:String(r.excerpt),date:String(r.date),status:r.status as Post["status"],attachmentKey:r.attachment_key as string|null,attachmentName:r.attachment_name as string|null,updatedAt:String(r.updated_at)};}
export async function listPosts(all=false){const r=await database().prepare("SELECT * FROM posts ORDER BY date DESC").all();const map=new Map(seedPosts.map(p=>[p.id,p]));for(const row of r.results)map.set(String(row.id),mapRow(row));return [...map.values()].filter(p=>all||p.status==="published").sort((a,b)=>b.date.localeCompare(a.date));}
export async function findPost(id:string,all=false){return (await listPosts(all)).find(p=>p.id===id)??null;}
export async function savePost(p:Post){await database().prepare("INSERT INTO posts (id,title,category,content,excerpt,date,status,attachment_key,attachment_name,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,category=excluded.category,content=excluded.content,excerpt=excluded.excerpt,date=excluded.date,status=excluded.status,attachment_key=excluded.attachment_key,attachment_name=excluded.attachment_name,updated_at=excluded.updated_at").bind(p.id,p.title,p.category,p.content,p.excerpt,p.date,p.status,p.attachmentKey,p.attachmentName,p.updatedAt).run();}
