'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const MotionContext = createContext({ disabled: false });

export function MotionPreferences({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'off' : 'on';
  }, [reduced]);
  useEffect(() => {
    const update = () => { document.documentElement.dataset.pageVisible = String(!document.hidden); };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <MotionContext.Provider value={{ disabled: reduced }}>{children}</MotionContext.Provider>;
}

export const useMotionPreferences = () => useContext(MotionContext);
