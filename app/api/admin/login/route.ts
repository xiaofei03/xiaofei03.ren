import { assertOrigin,login,cookieHeader,apiError } from '@/server/security';
import { readJson } from '@/server/request-body';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{assertOrigin(request);const data=await readJson(request,4096);const username=String(data.username||'').trim(),password=String(data.password||'');if(username.length>80||password.length>256)throw new Error('BAD_LOGIN');const session=await login(username,password);return Response.json({ok:true,csrf:session.csrf},{headers:{'Set-Cookie':cookieHeader(session.token,request),'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
