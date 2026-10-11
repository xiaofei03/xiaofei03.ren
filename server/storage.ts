import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';
import { seedPosts, type Post } from '@/app/seed-posts';
import { documentMedia, mediaIdFromUrl } from '@/lib/article-document';

export const dataDirectory=path.resolve(process.env.SUNLIT_DATA_DIR||path.join(process.cwd(),'.local-data'));
let connection: DatabaseSync | undefined;
export function database(){
 if(connection)return connection;
 mkdirSync(dataDirectory,{recursive:true,mode:0o700});
 const db=connection=new DatabaseSync(path.join(dataDirectory,'sunlit.sqlite'));
 chmodSync(path.join(dataDirectory,'sunlit.sqlite'),0o600);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=10000; PRAGMA synchronous=FULL;
 CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY, draft_json TEXT NOT NULL, published_json TEXT, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY, post_id TEXT NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL, kind TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS administrator(id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, csrf TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS login_limits(key TEXT PRIMARY KEY, failures INTEGER NOT NULL, reset_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
 if(!db.prepare("SELECT value FROM settings WHERE key='seeds_imported'").get()){
  const put=db.prepare('INSERT OR IGNORE INTO articles(id,draft_json,published_json,revision,updated_at) VALUES(?,?,?,1,?)');
  db.exec('BEGIN IMMEDIATE');try{for(const p of seedPosts){const json=JSON.stringify({...p,sample:true});put.run(p.id,json,json,p.updatedAt);}db.prepare("INSERT INTO settings(key,value) VALUES('seeds_imported','1')").run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
 if(!db.prepare('SELECT id FROM administrator').get()&&!existsSync(setupKeyPath()))writeFileSync(setupKeyPath(),randomBytes(32).toString('base64url'),{mode:0o600,flag:'wx'});
 return db;
}
export function setupKeyPath(){return path.join(dataDirectory,'first-admin-key');}
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function adminConfigured(){return !!database().prepare('SELECT id FROM administrator').get();}
export function getSetupKey(){database();return readFileSync(setupKeyPath(),'utf8').trim();}
type Row={id:string;draft_json:string;published_json:string|null;revision:number;updated_at:string};
function rowPost(r:Row,all:boolean):Post {
 const p=JSON.parse(all?r.draft_json:r.published_json!) as Post;
 return all?{...p,status:r.published_json?'published':'draft',revision:r.revision,updatedAt:r.updated_at,hasUnpublishedChanges:!!r.published_json&&r.draft_json!==r.published_json}:{...p,status:'published'};
}
export function storedPosts(all=false):Post[]{const rows=database().prepare(`SELECT * FROM articles ${all?'':'WHERE published_json IS NOT NULL'} ORDER BY updated_at DESC`).all() as unknown as Row[];return rows.map(r=>rowPost(r,all)).sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt));}
export function storedPost(id:string,all=false){const r=database().prepare('SELECT * FROM articles WHERE id=?').get(id) as unknown as Row|undefined;return r&&(all||r.published_json)?rowPost(r,all):null;}
export function persistPost(post:Post,mode:'draft'|'publish'|'unpublish'|'autosave',expectedRevision:number){
 const db=database();db.exec('BEGIN IMMEDIATE');
 try{
  const row=db.prepare('SELECT * FROM articles WHERE id=?').get(post.id) as unknown as Row|undefined;
  if((row?.revision||0)!==expectedRevision)throw new Error('CONFLICT');
  const ids=post.document?documentMedia(post.document):[];if(post.coverId)ids.push(post.coverId);if(post.attachmentKey)ids.push(post.attachmentKey);
  for(const id of ids){const m=db.prepare('SELECT post_id FROM media WHERE id=?').get(id);if(!m||m.post_id!==post.id)throw new Error('文章图片或原稿不属于这篇文章，请重新上传。');}
  const json=JSON.stringify({...post,sample:false});
  const published=mode==='publish'?json:mode==='unpublish'?null:row?.published_json||null;
  db.prepare('INSERT INTO articles(id,draft_json,published_json,revision,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET draft_json=excluded.draft_json,published_json=excluded.published_json,revision=excluded.revision,updated_at=excluded.updated_at').run(post.id,json,published,expectedRevision+1,new Date().toISOString());
  db.exec('COMMIT');return storedPost(post.id,true)!;
 }catch(e){db.exec('ROLLBACK');throw e;}
}
export type MediaRecord={id:string;post_id:string;filename:string;mime:string;kind:'image'|'attachment';size:number;created_at:string};
export function mediaRecord(id:string){return database().prepare('SELECT * FROM media WHERE id=?').get(id) as unknown as MediaRecord|undefined;}
export function mediaIsPublished(m:MediaRecord){const post=storedPost(m.post_id);if(!post)return false;if(m.kind==='attachment')return post.attachmentKey===m.id;return post.coverId===m.id||(post.document?documentMedia(post.document).includes(m.id):false)||mediaIdFromUrl(post.coverId)===m.id;}
export function putMedia(m:MediaRecord,bytes:Uint8Array){const dir=path.join(dataDirectory,'uploads');mkdirSync(dir,{recursive:true,mode:0o700});writeFileSync(path.join(dir,m.id),bytes,{mode:0o600,flag:'wx'});database().prepare('INSERT INTO media(id,post_id,filename,mime,kind,size,created_at) VALUES(?,?,?,?,?,?,?)').run(m.id,m.post_id,m.filename,m.mime,m.kind,m.size,m.created_at);}
export function readMedia(id:string){if(!/^[a-f0-9-]{36}$/.test(id))throw new Error('Invalid media');return readFileSync(path.join(dataDirectory,'uploads',id));}
