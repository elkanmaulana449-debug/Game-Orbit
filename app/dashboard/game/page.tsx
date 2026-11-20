// app/dashboard/game/page.tsx — Developer · Game saya
import { WorkspaceShell } from "@/app/workspace/shell";
import { DaftarGame } from "./daftar-game";

export const metadata = { title: "Game saya • Game Orbit" };

export default function GameSayaPage() {
  return (
    <WorkspaceShell varian="developer" aktif="game" halaman="Game saya">
      <DaftarGame />
    </WorkspaceShell>
  );
}
