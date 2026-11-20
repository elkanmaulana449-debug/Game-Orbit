// app/dashboard/tabel-game.tsx
// Tabel "Game saya" (dipakai di Ringkasan dan halaman Game saya).
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, PencilIcon } from "@/app/store/icons";
import { EllipsisIcon } from "@/app/components/icons-extra";
import { Kartu, Pager, Status, formatRupiah, formatTanggal } from "@/app/workspace/ui";
import type { GameDev } from "./data";

const STATUS = {
  PUBLISHED: { label: "Dipublikasikan", warna: "hijau" },
  REVIEW: { label: "Update ditinjau", warna: "kuning" },
  INACTIVE: { label: "Nonaktif", warna: "abu" },
} as const;

export function TabelGame({
  games,
  gagal,
  batas,
  onHapus,
}: {
  games: GameDev[] | null;
  gagal: boolean;
  batas?: number; // tampilkan sekian baris saja (tanpa paginasi)
  onHapus: (g: GameDev) => void;
}) {
  const [q, setQ] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  const daftar = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return (games ?? []).filter((g) => !kata || g.title.toLowerCase().includes(kata));
  }, [games, q]);

  const tampil = batas
    ? daftar.slice(0, batas)
    : daftar.slice((halaman - 1) * 8, halaman * 8);

  return (
    <Kartu className="overflow-hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-5">
        <h2 className="text-[16px]">Game saya</h2>
        <label className="flex h-8 w-[265px] max-w-[55%] items-center gap-[9px] rounded-[7px] bg-[#f5f6fa] px-[10px]">
          <SearchIcon size={15} className="shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setHalaman(1);
            }}
            placeholder="Cari game milik studio..."
            className="min-w-0 flex-1 bg-transparent text-[10px] focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid h-[34px] grid-cols-[345px_200px_130px_100px_148px_90px] items-center bg-[#f5f6fa] px-5 text-[9px] font-semibold">
            <span>GAME</span>
            <span>STATUS</span>
            <span>UNDUHAN</span>
            <span>RATING</span>
            <span>DIPERBARUI</span>
            <span>AKSI</span>
          </div>

          {games === null && !gagal && (
            <p className="px-5 py-8 text-[11px] text-[#70758a]">Memuat…</p>
          )}
          {gagal && (
            <p className="px-5 py-8 text-[11px] text-[#b42318]">
              Game tidak bisa dimuat. Muat ulang halaman.
            </p>
          )}
          {games !== null && tampil.length === 0 && (
            <p className="px-5 py-8 text-[11px] text-[#70758a]">
              {games.length === 0
                ? "Belum ada game. Tambahkan game pertamamu."
                : "Tidak ada game yang cocok."}
            </p>
          )}

          {tampil.map((g) => {
            const st = STATUS[g.status as keyof typeof STATUS] ?? STATUS.PUBLISHED;
            return (
              <div
                key={g.id}
                className="grid min-h-[74px] grid-cols-[345px_200px_130px_100px_148px_90px] items-center border-b border-[#e4e6f0] px-5 py-2 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-[46px] w-[60px] shrink-0 overflow-hidden rounded-[7px] bg-gradient-to-br from-[#6d4aff] to-[#b9a6ff]">
                    {g.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.imageUrl} alt="" className="size-full object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-[5px]">
                    <span className="truncate text-[12px] font-semibold">{g.title}</span>
                    <span className="truncate text-[10px] text-[#70758a]">
                      {g.genre} • {formatRupiah(g.price)}
                    </span>
                  </div>
                </div>
                <span>
                  <Status warna={st.warna}>{st.label}</Status>
                </span>
                <span className="text-[12px]">
                  {g.downloadCount.toLocaleString("id-ID")}
                </span>
                <span className="text-[12px] text-[#70758a]">—</span>
                <span className="text-[11px]">{formatTanggal(g.updatedAt)}</span>
                <div
                  ref={menuId === g.id ? menuRef : undefined}
                  className="relative flex items-center gap-[15px]"
                >
                  <Link href={`/dashboard/game/${g.id}/ubah`} aria-label="Ubah game">
                    <PencilIcon size={16} />
                  </Link>
                  <button
                    type="button"
                    aria-label="Menu aksi"
                    onClick={() => setMenuId(menuId === g.id ? null : g.id)}
                  >
                    <EllipsisIcon size={17} />
                  </button>
                  {menuId === g.id && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-[170px] overflow-hidden rounded-[10px] border border-[#e4e6f0] bg-white text-[12px] shadow-lg">
                      <Link
                        href={`/game/${g.id}`}
                        className="block px-3 py-2.5 hover:bg-[#f5f6fa]"
                      >
                        Lihat di toko
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(null);
                          onHapus(g);
                        }}
                        className="block w-full px-3 py-2.5 text-left text-[#c3475a] hover:bg-[#f5f6fa]"
                      >
                        Hapus game
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!batas && (
        <Pager
          halaman={halaman}
          total={daftar.length}
          perHalaman={8}
          satuan="game"
          onGanti={setHalaman}
        />
      )}
    </Kartu>
  );
}
