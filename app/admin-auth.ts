import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionFromHeaders } from '@/server/security';
export async function getAdministrator(){return sessionFromHeaders(await headers());}
export async function requireAdministrator(returnTo='/studio'){const user=await getAdministrator();if(!user)redirect('/admin/login?next='+encodeURIComponent(returnTo));return user;}
