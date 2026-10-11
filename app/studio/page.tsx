import { requireAdministrator } from "../admin-auth";
import Studio from "./studio";
export const dynamic="force-dynamic";
export const metadata={title:"写作工作室 · 日光之间",robots:{index:false,follow:false}};
async function ProtectedStudio({editId}:{editId?:string}){const user=await requireAdministrator('/studio'+(editId?'?edit='+encodeURIComponent(editId):''));return <Studio editId={editId} username={user.username} csrf={user.csrf}/>;}
export default async function StudioPage({searchParams}:{searchParams:Promise<{edit?:string}>}){const q=searchParams?await searchParams:{};return <ProtectedStudio editId={typeof q.edit==='string'?q.edit:undefined}/>;}
