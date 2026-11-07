import SectionShell from "@/components/SectionShell";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <SectionShell active="finance">{children}</SectionShell>;
}
