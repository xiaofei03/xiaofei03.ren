import SectionShell from "@/components/SectionShell";
export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <SectionShell active="notes">{children}</SectionShell>;
}
