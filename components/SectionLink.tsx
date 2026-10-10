"use client";
import type { AnchorHTMLAttributes } from "react";
import { useRouter } from "next/navigation";

// Keep real links for keyboard use, copied URLs and opening a new tab.
export default function SectionLink({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useRouter();
  return <a {...props} href={href} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank") return;
    event.preventDefault();
    router.push(href);
  }}/>;
}
