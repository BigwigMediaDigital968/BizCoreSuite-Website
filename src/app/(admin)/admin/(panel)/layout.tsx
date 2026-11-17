import { AdminShell } from "@/src/components/admin/AdminShell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
