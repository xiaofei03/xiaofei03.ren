import { sessionFromHeaders } from '@/server/security';
import { adminConfigured } from '@/server/storage';
export const dynamic='force-dynamic';
export async function GET(request:Request){const admin=sessionFromHeaders(request.headers);return Response.json({configured:adminConfigured(),admin:admin?{username:admin.username,csrf:admin.csrf}:null},{headers:{'Cache-Control':'no-store'}});}
