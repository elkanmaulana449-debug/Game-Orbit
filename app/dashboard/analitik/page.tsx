// app/dashboard/analitik/page.tsx — Developer · Analitik
import { WorkspaceShell } from "@/app/workspace/shell";
import { AnalitikGame } from "./analitik-game";

export const metadata = { title: "Analitik • Game Orbit" };

export default function AnalitikPage() {
  return (
    <WorkspaceShell varian="developer" aktif="analitik" halaman="Analitik">
      <AnalitikGame />
    </WorkspaceShell>
  );
}
