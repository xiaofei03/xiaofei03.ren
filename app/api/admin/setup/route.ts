import { assertOrigin,initializeAdmin,cookieHeader,apiError } from '@/server/security';
import { readJson } from '@/server/request-body';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{assertOrigin(request);const data=await readJson(request,8192);const session=await initializeAdmin(String(data.username||'').trim(),String(data.password||''),String(data.key||'').trim());return Response.json({ok:true,csrf:session.csrf},{headers:{'Set-Cookie':cookieHeader(session.token,request),'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
