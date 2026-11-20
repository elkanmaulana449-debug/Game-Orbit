// app/dashboard/game/daftar-game.tsx
"use client";

import Link from "next/link";
import { PlusIcon } from "@/app/components/icons-extra";
import { useWorkspaceUser } from "@/app/workspace/client";
import { Judul, tombolUngu } from "@/app/workspace/ui";
import { useGameDeveloper } from "../data";
import { TabelGame } from "../tabel-game";

export function DaftarGame() {
  const user = useWorkspaceUser(["DEVELOPER"]);
  const { games, gagal, hapus } = useGameDeveloper(user?.id);

  if (!user) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  return (
    <>
      <Judul
        eyebrow="KARYAMU"
        title="Game saya"
        desc="Semua game milik studiomu. Ubah detail, ganti gambar, atau hapus game."
        aksi={
          <Link href="/dashboard/game/baru" className={tombolUngu}>
            <PlusIcon size={17} /> Tambah game
          </Link>
        }
      />
      <TabelGame games={games} gagal={gagal} onHapus={hapus} />
    </>
  );
}
