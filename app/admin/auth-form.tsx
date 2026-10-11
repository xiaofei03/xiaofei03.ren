"use client";
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Eye,EyeOff,KeyRound,Loader2} from 'lucide-react';
export default function AuthForm({setup=false,next='/studio',configured=true}:{setup?:boolean;next?:string;configured?:boolean}){
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[key,setKey]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();if(setup&&password!==confirm){setError('两次密码不一致。');return;}setBusy(true);setError('');try{const r=await fetch('/api/admin/'+(setup?'setup':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,...(setup?{key}:{})})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error||'登录没有完成。');location.assign(next);}catch(e){setError((e as Error).message);setBusy(false);}}
 return <section className="admin-card"><KeyRound size={26}/><h2>{setup?'设置你的写作账号':'管理员登录'}</h2><p>{setup?'首次使用时设置一次。账号只用于管理你的随笔。':'登录后可以写文章、上传图片和原稿，管理已发布的随笔。'}</p>
 <form className="admin-form" onSubmit={submit}>
 {setup&&<label className="admin-field">一次性初始化密钥<input required autoComplete="off" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="从本机密钥文件复制"/></label>}
 <label className="admin-field">管理员账号<input name="username" required autoComplete="username" minLength={3} maxLength={80} pattern="[a-zA-Z0-9_.@\-]+" value={username} onChange={e=>setUsername(e.target.value)} placeholder="英文、数字或邮箱"/></label>
 <label className="admin-field">密码<div className="admin-password"><input name="password" required type={show?'text':'password'} autoComplete={setup?'new-password':'current-password'} minLength={setup?12:1} maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} placeholder={setup?'至少 12 位，建议使用密码管理器':'输入你的密码'}/><button type="button" aria-label={show?'隐藏密码':'显示密码'} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
 {setup&&<label className="admin-field">再次输入密码<input required type="password" autoComplete="new-password" minLength={12} maxLength={256} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}
 {error&&<p role="alert" className="admin-error">{error}</p>}<button className="admin-submit" disabled={busy}>{busy?<Loader2 size={17} className="spin"/>:<ArrowRight size={17}/>} {busy?'正在验证…':setup?'创建账号并开始写作':'进入写作工作室'}</button></form>
 <div className="admin-help">{setup?<>初始化密钥在本机 <code>.local-data/first-admin-key</code> 中，运行 <code>npm run admin:setup</code> 可查看文件位置。密钥不能代替登录密码，账号创建后将失效。</>:configured?<>这是站点主人的管理入口。访客可以直接阅读，无需注册账号。</>:<>还没有设置管理员。请先<a href="/admin/setup">初始化写作账号</a>。</>}<br/><a className="admin-back" href="/notes"><ArrowLeft size={15}/>回去读随笔</a></div></section>;
}
