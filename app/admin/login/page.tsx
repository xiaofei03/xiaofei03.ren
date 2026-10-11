import {redirect} from 'next/navigation';
import {getAdministrator} from '@/app/admin-auth';
import {adminConfigured} from '@/server/storage';
import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export const metadata={title:'管理随笔 · 日光之间',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}){const q=await searchParams;const next=typeof q.next==='string'&&/^\/studio(?:\?edit=[a-zA-Z0-9-]{1,80})?$/.test(q.next)?q.next:'/studio';if(await getAdministrator())redirect(next);return <AuthForm next={next} configured={adminConfigured()}/>;}
