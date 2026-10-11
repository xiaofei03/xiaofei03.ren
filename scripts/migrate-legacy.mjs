// Offline, copy-only migration. Original D1/R2 data is opened read-only and retained.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,chmodSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import path from 'node:path';
const args=process.argv.slice(2),option=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function files(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name)):x.isFile()?[path.join(dir,x.name)]:[]);}
function fail(message){throw new Error(message);}
function safePost(p){if(!p||!/^[a-zA-Z0-9-]{1,80}$/.test(p.id)||typeof p.title!=='string'||!p.title.trim()||p.title.length>150||typeof p.content!=='string'||p.content.length>250000||!['生活','研究','AI 与工具','阅读'].includes(p.category)||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!['draft','published'].includes(p.status))fail('导出包含有格式无效的文章。');return p;}
try{
 if(args[0]==='export'){
  const state=path.resolve(option('--state')||'.wrangler/state/v3'),out=option('--out');if(!out)fail('请用 --out 指定新的导出目录。');const destination=path.resolve(out);if(existsSync(destination))fail('导出目录已存在，请使用新目录，避免覆盖旧文件。');
  const all=files(state),posts=[],objects=new Map();
  for(const file of all.filter(x=>x.endsWith('.sqlite'))){const db=new DatabaseSync(file,{readOnly:true});try{const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);if(tables.includes('posts'))posts.push(...db.prepare('SELECT * FROM posts').all());if(tables.includes('_mf_objects'))for(const row of db.prepare('SELECT key,blob_id,size FROM _mf_objects').all())objects.set(row.key,row);}finally{db.close();}}
  const prepared=posts.map(row=>{const p=safePost({id:row.id,title:row.title,category:row.category,content:row.content,excerpt:row.excerpt,date:row.date,status:row.status,attachmentKey:null,attachmentName:row.attachment_name,updatedAt:row.updated_at});if(!row.attachment_key)return {post:p};const object=objects.get(row.attachment_key);if(!object)fail('附件元数据缺失：'+row.attachment_key);const original=all.find(f=>path.basename(f)===object.blob_id);if(!original)fail('附件文件缺失：'+row.attachment_key);const bytes=readFileSync(original);if(bytes.length!==object.size)fail('附件大小不匹配：'+row.attachment_key);return {post:p,attachment:{file:'files/'+randomUUID(),filename:row.attachment_name,sha256:hash(bytes),size:bytes.length},bytes};});
  mkdirSync(path.join(destination,'files'),{recursive:true,mode:0o700});for(const p of prepared)if(p.bytes)writeFileSync(path.join(destination,p.attachment.file),p.bytes,{mode:0o600,flag:'wx'});
  writeFileSync(path.join(destination,'manifest.json'),JSON.stringify({version:1,exportedAt:new Date().toISOString(),posts:prepared.map(({post,attachment})=>({post,attachment}))},null,2),{mode:0o600,flag:'wx'});
  console.log(JSON.stringify({exported:posts.length,attachments:prepared.filter(p=>p.attachment).length,path:destination}));
 }else if(args[0]==='import'){
  const source=option('--from');if(!source)fail('请用 --from 指定导出目录。');const directory=path.resolve(source),target=path.resolve(option('--data')||process.env.SUNLIT_DATA_DIR||'.local-data'),dbPath=path.join(target,'sunlit.sqlite');if(!existsSync(dbPath))fail('请先启动网站，让数据库完成初始化。');
  const manifest=JSON.parse(readFileSync(path.join(directory,'manifest.json'),'utf8'));if(manifest.version!==1||!Array.isArray(manifest.posts)||manifest.posts.length>10000)fail('导出包格式不正确。');
  const prepared=manifest.posts.map(item=>{const p=safePost(item.post),a=item.attachment;if(!a)return {post:p};if(!/^files\/[a-f0-9-]{36}$/.test(a.file))fail('附件路径无效。');const bytes=readFileSync(path.join(directory,a.file));if(bytes.length!==a.size||hash(bytes)!==a.sha256)fail('附件校验未通过：'+a.filename);const extension=path.extname(a.filename||'').toLowerCase(),mime=extension==='.pdf'?'application/pdf':extension==='.docx'?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':/\.(md|txt)$/.test(extension)?'text/plain; charset=utf-8':null;if(!mime)fail('不支持的原稿格式：'+a.filename);return {post:p,attachment:{...a,id:randomUUID(),mime},bytes};});
  const db=new DatabaseSync(dbPath);db.exec('PRAGMA busy_timeout=10000');const todo=[],skipped=[];for(const item of prepared){const existing=db.prepare('SELECT draft_json FROM articles WHERE id=?').get(item.post.id);if(existing&&!JSON.parse(existing.draft_json).sample)skipped.push(item.post.id);else todo.push(item);}
  if(args.includes('--dry-run'))console.log(JSON.stringify({willImport:todo.length,skipped,attachments:todo.filter(x=>x.attachment).length,target}));else{
   const stamp=new Date().toISOString().replace(/[:.]/g,'-'),backup=path.join(target,'before-legacy-import-'+stamp+'.sqlite');db.exec(`VACUUM INTO '${backup.replaceAll("'","''")}'`);chmodSync(backup,0o600);mkdirSync(path.join(target,'uploads'),{recursive:true,mode:0o700});
   for(const item of todo)if(item.attachment)writeFileSync(path.join(target,'uploads',item.attachment.id),item.bytes,{mode:0o600,flag:'wx'});
   db.exec('BEGIN IMMEDIATE');try{for(const {post,attachment} of todo){if(attachment)db.prepare('INSERT INTO media(id,post_id,filename,mime,kind,size,created_at) VALUES(?,?,?,?,?,?,?)').run(attachment.id,post.id,attachment.filename,attachment.mime,'attachment',attachment.size,new Date().toISOString());const p={...post,attachmentKey:attachment?.id||null,attachmentName:attachment?.filename||null,sample:false},json=JSON.stringify(p);db.prepare('INSERT INTO articles(id,draft_json,published_json,revision,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(id) DO UPDATE SET draft_json=excluded.draft_json,published_json=excluded.published_json,revision=articles.revision+1,updated_at=excluded.updated_at').run(p.id,json,p.status==='published'?json:null,p.updatedAt||new Date().toISOString());}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
   console.log(JSON.stringify({imported:todo.length,skipped,attachments:todo.filter(x=>x.attachment).length,backup}));
  }db.close();
 }else console.log('用法：node scripts/migrate-legacy.mjs export --state .wrangler/state/v3 --out /新的导出目录\n      node scripts/migrate-legacy.mjs import --from /导出目录 --data /数据库目录 [--dry-run]');
}catch(e){console.error(e.message);process.exitCode=1;}
