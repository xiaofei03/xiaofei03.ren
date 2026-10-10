import { notFound } from "next/navigation";
import { personalSections } from "@/app/section-navigation";
import SectionPage from "@/app/section-page";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return { title: `${personalSections.find(s => s.id === section)?.label || "个人板块"} · 日光之间` };
}
export default async function ExplorePage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ project?: string }> }) {
  const { section } = await params;
  if (!personalSections.some(s => s.id === section) || section === "notes") notFound();
  const query = await searchParams;
  return <SectionPage section={section} initialProject={section === "projects" && typeof query.project === "string" ? query.project : undefined}/>;
}
