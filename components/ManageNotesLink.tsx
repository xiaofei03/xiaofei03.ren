import {NotebookPen} from 'lucide-react';
import '@/app/admin/admin.css';
export default function ManageNotesLink({compact=false,stamp=false}:{compact?:boolean;stamp?:boolean}){
 if(stamp)return <a href="/admin/login?next=/studio" className="journal-stamp journal-write-link" aria-label="慢慢写，慢慢想 · 管理随笔" title="登录后开始写作">慢慢写<br/>慢慢想</a>;
 return <a href="/admin/login" className={compact?'admin-manage-link':'quiet-link admin-note-link'}><NotebookPen size={16}/>管理随笔</a>;
}
