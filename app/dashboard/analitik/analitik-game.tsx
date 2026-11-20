// app/dashboard/analitik/analitik-game.tsx
"use client";

import { DownloadIcon } from "@/app/store/icons";
import { Gamepad2Icon, StarIcon } from "@/app/components/icons-extra";
import { useWorkspaceUser } from "@/app/workspace/client";
import { Judul, Kartu, Metrik, formatRupiah } from "@/app/workspace/ui";
import { useAnalitik, useGameDeveloper } from "../data";
import { GrafikUnduhan } from "../grafik";

export function AnalitikGame() {
  const user = useWorkspaceUser(["DEVELOPER"]);
  const { games } = useGameDeveloper(user?.id);
  const data = useAnalitik(user?.id);

  if (!user) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  const urut = [...(games ?? [])].sort((a, b) => b.downloadCount - a.downloadCount);
  const maks = Math.max(1, ...urut.map((g) => g.downloadCount));

  return (
    <>
      <Judul
        eyebrow="PERFORMA"
        title="Analitik"
        desc="Pantau unduhan dan pendapatan game studiomu dalam 30 hari terakhir."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metrik
          warna="ungu"
          label="Unduhan 30 hari"
          nilai={data ? data.unduhan30Hari.toLocaleString("id-ID") : "…"}
          catatan={data ? `${data.unduhan30HariSebelumnya} di 30 hari sebelumnya` : "Memuat"}
          icon={<DownloadIcon size={18} />}
        />
        <Metrik
          warna="hijau"
          label="Pendapatan 30 hari"
          nilai={data ? formatRupiah(data.pendapatan30Hari) : "…"}
          catatan="Dari harga game × pembelian berhasil"
          icon={<Gamepad2Icon size={18} />}
        />
        <Metrik
          warna="oranye"
          label="Rating rata-rata"
          nilai="— / 5"
          catatan="Belum ada ulasan pemain"
          icon={<StarIcon size={18} />}
        />
      </div>

      <Kartu className="flex flex-col gap-4 p-5">
        <p className="text-[15px] font-semibold">Unduhan 30 hari terakhir</p>
        {data ? (
          <GrafikUnduhan data={data.harian} />
        ) : (
          <p className="py-6 text-[11px] text-[#70758a]">Memuat grafik…</p>
        )}
      </Kartu>

      <Kartu className="flex flex-col gap-4 p-5">
        <p className="text-[15px] font-semibold">Unduhan per game</p>
        {urut.length === 0 && (
          <p className="text-[11px] text-[#70758a]">Belum ada game.</p>
        )}
        {urut.map((g) => (
          <div key={g.id} className="flex items-center gap-4">
            <span className="w-[180px] shrink-0 truncate text-[12px]">{g.title}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0ecff]">
              <div
                className="h-full rounded-full bg-[#6d4aff]"
                style={{ width: `${(g.downloadCount / maks) * 100}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-[12px]">
              {g.downloadCount.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </Kartu>
    </>
  );
}
