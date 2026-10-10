"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { personalSections, sectionHref } from "@/app/section-navigation";

export default function useSectionTools() {
  const router = useRouter();
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: "open_personal_section", title: "打开个人板块",
        description: "前往指定个人板块的全屏页面。",
        inputSchema: { type: "object", properties: { section: { type: "string", enum: personalSections.map(s => s.id) } }, required: ["section"], additionalProperties: false },
        annotations: { readOnlyHint: false },
        execute(input: { section?: string }) {
          if (!input || !personalSections.some(s => s.id === input.section)) throw new Error("无效的板块");
          const href = sectionHref(input.section!);
          router.push(href);
          return { opened: input.section, href };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [router]);
}
