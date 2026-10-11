"use client";
import {usePathname} from 'next/navigation';
import {Toaster} from '@/components/ui/sonner';
export default function AppToaster(){const pathname=usePathname();return <Toaster position={pathname?.startsWith('/studio')?'top-center':'bottom-right'}/>;}
