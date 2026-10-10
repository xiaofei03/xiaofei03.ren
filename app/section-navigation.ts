export const personalSections = [
  { id: "about", label: "关于我", image: "/assets/home-v2/avatar-front.webp", color: "#467cd8" },
  { id: "education", label: "求学时光", image: "/assets/ustc-seal.png", color: "#507dae" },
  { id: "awards", label: "荣誉收藏", image: "/assets/home-v2/trophy.webp", color: "#b48a32" },
  { id: "experience", label: "实习经历", image: "/assets/home-v2/experience-work.webp", color: "#926255" },
  { id: "research", label: "研究手记", image: "/assets/home-v2/research-lens.webp", color: "#7965c5" },
  { id: "projects", label: "AI 实验室", image: "/assets/home-v2/chatgpt-mark.svg", color: "#398e98" },
  { id: "practice", label: "志愿实践", image: "/assets/home-v2/practice-care.webp", color: "#b85d78" },
  { id: "notes", label: "随笔", image: "/assets/notebook-cobalt.webp", color: "#5c79c5" },
] as const;

export type PersonalSection = (typeof personalSections)[number]["id"];
export function sectionHref(id: string, project?: string) {
  if (id === "notes") return "/notes";
  const section = personalSections.some(s => s.id === id) ? id : "about";
  return `/explore/${section}${section === "projects" && project ? `?project=${encodeURIComponent(project)}` : ""}`;
}
