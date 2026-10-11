'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';

const MotionContext = createContext({ disabled: false, paused: false, reduced: false, toggle: () => {} });

export function MotionPreferences({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try { setPaused(localStorage.getItem('sunlit-motion-paused') === 'true'); } catch {}
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused || reduced ? 'off' : 'on';
  }, [paused, reduced]);
  useEffect(() => {
    const update = () => { document.documentElement.dataset.pageVisible = String(!document.hidden); };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const toggle = () => setPaused(value => {
    try { localStorage.setItem('sunlit-motion-paused', String(!value)); } catch {}
    return !value;
  });
  return <MotionContext.Provider value={{ disabled: paused || reduced, paused, reduced, toggle }}>{children}</MotionContext.Provider>;
}

export const useMotionPreferences = () => useContext(MotionContext);

export function MotionToggle() {
  const { paused, reduced, toggle } = useMotionPreferences();
  const label = reduced ? '系统已设置减少动态效果' : paused ? '开启动效' : '暂停动态';
  return <button type="button" className="motion-toggle" onClick={toggle} disabled={reduced} aria-label={label} aria-pressed={paused || reduced} title={label}>
    {paused || reduced ? <Play size={15}/> : <Pause size={15}/>}<span>{label}</span>
  </button>;
}
