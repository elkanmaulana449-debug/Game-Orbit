// app/dashboard/ringkasan.tsx
"use client";

import Link from "next/link";
import { BadgeCheckIcon, CircleCheckIcon, DownloadIcon } from "@/app/store/icons";
import {
  Clock3Icon,
  Gamepad2Icon,
  PlusIcon,
  StarIcon,
} from "@/app/components/icons-extra";
import { useWorkspaceUser } from "@/app/workspace/client";
import { Judul, Kartu, Metrik, dua, tombolUngu } from "@/app/workspace/ui";
import { useAnalitik, useGameDeveloper, waktuRelatif } from "./data";
import { GrafikUnduhan } from "./grafik";
import { TabelGame } from "./tabel-game";

export function Ringkasan() {
  const user = useWorkspaceUser(["DEVELOPER"]);
  const { games, gagal, hapus } = useGameDeveloper(user?.id);
  const analitik = useAnalitik(user?.id);

  if (!user) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  const nama = user.studioName || user.name || "Developer";
  const daftar = games ?? [];
  const terbit = daftar.filter((g) => g.status === "PUBLISHED").length;
  const ditinjau = daftar.filter((g) => g.status === "REVIEW").length;
  const totalUnduhan = daftar.reduce((n, g) => n + g.downloadCount, 0);

  let tren = "Dari transaksi yang berhasil";
  if (analitik) {
    const { unduhan30Hari: kini, unduhan30HariSebelumnya: lalu } = analitik;
    tren =
      lalu > 0
        ? `${kini >= lalu ? "↑" : "↓"} ${Math.abs(Math.round(((kini - lalu) / lalu) * 1000) / 10)
            .toString()
            .replace(".", ",")}% dibanding bulan lalu`
        : `${kini} unduhan dalam 30 hari terakhir`;
  }

  const tujuh = analitik?.harian.slice(-7) ?? [];
  const total7 = tujuh.reduce((n, d) => n + d.jumlah, 0);

  return (
    <>
      <Judul
        eyebrow="DEVELOPER HUB"
        title={`Selamat datang, ${nama}.`}
        desc="Kelola karya, pantau performa, dan bawa dunia buatanmu ke lebih banyak pemain."
        aksi={
          <Link href="/dashboard/game/baru" className={tombolUngu}>
            <PlusIcon size={17} /> Tambah game
          </Link>
        }
      />

      <div className="flex items-center gap-3 rounded-[14px] border border-[#e4e6f0] bg-[#e9f8ef] px-[18px] py-[15px]">
        <BadgeCheckIcon size={23} className="shrink-0 text-[#168355]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <p className="text-[12px] font-semibold text-[#168355]">
            Akun developer disetujui
          </p>
          <p className="text-[11px]">
            Studio kamu sudah terverifikasi. Kamu dapat mengunggah dan mengelola game.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metrik
          warna="ungu"
          label="Game saya"
          nilai={dua(daftar.length)}
          catatan={`${terbit} terbit • ${ditinjau} pembaruan dalam peninjauan`}
          icon={<Gamepad2Icon size={18} />}
        />
        <Metrik
          warna="hijau"
          label="Total unduhan"
          nilai={totalUnduhan.toLocaleString("id-ID")}
          catatan={tren}
          icon={<DownloadIcon size={18} />}
        />
        <Metrik
          warna="oranye"
          label="Rating rata-rata"
          nilai="— / 5"
          catatan="Belum ada ulasan pemain"
          icon={<StarIcon size={18} />}
        />
      </div>

      <TabelGame games={games} gagal={gagal} batas={5} onHapus={hapus} />
      {daftar.length > 5 && (
        <Link href="/dashboard/game" className="-mt-3 text-[12px] font-semibold text-[#6d4aff]">
          Lihat semua game →
        </Link>
      )}

      <div className="flex flex-col gap-[22px] xl:flex-row xl:items-start">
        <Kartu className="flex flex-col gap-4 p-5 xl:w-[683px] xl:shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-[6px]">
              <p className="text-[15px] font-semibold">Unduhan 7 hari terakhir</p>
              <p className="text-[10px]">{total7.toLocaleString("id-ID")} unduhan</p>
            </div>
            {tujuh.length > 0 && (
              <p className="text-[10px]">
                {new Date(tujuh[0].tanggal).toLocaleDateString("id-ID", { day: "numeric" })}–
                {new Date(tujuh[6].tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          {tujuh.length > 0 ? (
            <GrafikUnduhan data={tujuh} />
          ) : (
            <p className="py-6 text-[11px] text-[#70758a]">Memuat grafik…</p>
          )}
        </Kartu>

        <Kartu className="flex min-w-0 flex-1 flex-col gap-[17px] p-5">
          <p className="text-[15px] font-semibold">Aktivitas terbaru</p>
          {analitik && analitik.aktivitas.length === 0 && (
            <p className="text-[11px] text-[#70758a]">Belum ada aktivitas pembelian.</p>
          )}
          {analitik?.aktivitas.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              {i === 0 ? <Clock3Icon size={17} /> : <CircleCheckIcon size={17} />}
              <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <p className="truncate text-[11px]">
                  {a.pembeli} memiliki {a.game}
                </p>
                <p className="text-[9px] text-[#70758a]">{waktuRelatif(a.waktu)}</p>
              </div>
            </div>
          ))}
        </Kartu>
      </div>
    </>
  );
}
