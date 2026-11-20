// app/dashboard/game/[id]/ubah/page.tsx — Developer · Ubah game
import { Suspense } from "react";
import { WorkspaceShell } from "@/app/workspace/shell";
import { GameForm } from "../../../game-form";

export const metadata = { title: "Ubah game • Game Orbit" };

async function Isi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameForm gameId={id} />;
}

export default function UbahGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <WorkspaceShell varian="developer" aktif="game" halaman="Ubah game">
      <Suspense fallback={<p className="text-[12px] text-[#70758a]">Memuat…</p>}>
        <Isi params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
