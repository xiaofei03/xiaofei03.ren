import {redirect} from 'next/navigation';
import {adminConfigured} from '@/server/storage';
import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export const metadata={title:'首次设置 · 日光之间',robots:{index:false,follow:false}};
export default function Setup(){if(adminConfigured())redirect('/admin/login');return <AuthForm setup/>;}
