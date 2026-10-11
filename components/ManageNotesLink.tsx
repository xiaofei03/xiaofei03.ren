import {NotebookPen} from 'lucide-react';
import '@/app/admin/admin.css';
export default function ManageNotesLink({compact=false}:{compact?:boolean}){return <a href="/admin/login" className={compact?'admin-manage-link':'quiet-link admin-note-link'}><NotebookPen size={16}/>管理随笔</a>;}
