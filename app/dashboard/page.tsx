// app/dashboard/page.tsx — Developer · Dashboard (Ringkasan)
import { WorkspaceShell } from "@/app/workspace/shell";
import { Ringkasan } from "./ringkasan";

export const metadata = { title: "Ringkasan developer • Game Orbit" };

export default function DashboardPage() {
  return (
    <WorkspaceShell varian="developer" aktif="ringkasan" halaman="Ringkasan">
      <Ringkasan />
    </WorkspaceShell>
  );
}
