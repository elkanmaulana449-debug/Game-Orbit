// app/admin/page.tsx — Admin · Persetujuan developer
import { WorkspaceShell } from "@/app/workspace/shell";
import { Persetujuan } from "./persetujuan";

export const metadata = { title: "Persetujuan developer • Game Orbit" };

export default function AdminPage() {
  return (
    <WorkspaceShell varian="admin" aktif="persetujuan" halaman="Persetujuan developer">
      <Persetujuan />
    </WorkspaceShell>
  );
}
