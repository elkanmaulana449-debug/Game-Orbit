// app/admin/game/page.tsx — Admin · Data game
import { WorkspaceShell } from "@/app/workspace/shell";
import { DataGame } from "./data-game";

export const metadata = { title: "Data game • Game Orbit" };

export default function AdminGamePage() {
  return (
    <WorkspaceShell varian="admin" aktif="game" halaman="Data game">
      <DataGame />
    </WorkspaceShell>
  );
}
