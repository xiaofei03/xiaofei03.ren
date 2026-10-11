import { requireSession,cookieHeader,apiError } from '@/server/security';
import { database } from '@/server/storage';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const s=requireSession(request,true);database().prepare('UPDATE sessions SET expires_at=0 WHERE token_hash=?').run(s.tokenHash);return Response.json({ok:true},{headers:{'Set-Cookie':cookieHeader('',request,true),'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
