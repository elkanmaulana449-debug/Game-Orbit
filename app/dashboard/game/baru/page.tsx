// app/dashboard/game/baru/page.tsx — Developer · Tambah game
import { WorkspaceShell } from "@/app/workspace/shell";
import { GameForm } from "../../game-form";

export const metadata = { title: "Tambah game • Game Orbit" };

export default function TambahGamePage() {
  return (
    <WorkspaceShell varian="developer" aktif="game" halaman="Tambah game">
      <GameForm />
    </WorkspaceShell>
  );
}
