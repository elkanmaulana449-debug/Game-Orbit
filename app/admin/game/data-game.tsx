// app/admin/game/data-game.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, DownloadIcon, SearchIcon } from "@/app/store/icons";
import {
  CirclePauseIcon,
  Clock3Icon,
  EllipsisIcon,
  Gamepad2Icon,
  InfoIcon,
  SlidersIcon,
} from "@/app/components/icons-extra";
import { CircleCheckIcon, EyeIcon } from "@/app/store/icons";
import { GAME_GENRES } from "@/app/lib/game-genres";
import { useWorkspaceUser } from "@/app/workspace/client";
import {
  Judul,
  Kartu,
  Metrik,
  Pager,
  Status,
  dua,
  formatRupiah,
  formatTanggal,
  tombolPutih,
  unduhCsv,
} from "@/app/workspace/ui";

type Game = {
  id: string;
  title: string;
  genre: string;
  price: number;
  imageUrl: string | null;
  status: string; // PUBLISHED | REVIEW | INACTIVE
  updatedAt: string;
  downloadCount: number;
  developer: { id: string; name: string | null; studioName: string | null };
};

const PER_HALAMAN = 6;
const STATUS = [
  { nilai: "PUBLISHED", label: "Dipublikasikan", warna: "hijau" },
  { nilai: "REVIEW", label: "Update ditinjau", warna: "kuning" },
  { nilai: "INACTIVE", label: "Nonaktif", warna: "abu" },
] as const;

const labelStatus = (s: string) => STATUS.find((x) => x.nilai === s) ?? STATUS[0];
const namaDev = (g: Game) =>
  g.developer?.studioName || g.developer?.name || "Developer";

// Menu kecil untuk <select> yang tampil seperti tombol di Figma
function Pilih({
  icon,
  nilai,
  onGanti,
  opsi,
  label,
}: {
  icon: React.ReactNode;
  nilai: string;
  onGanti: (v: string) => void;
  opsi: { nilai: string; label: string }[];
  label: string;
}) {
  return (
    <label className={`${tombolPutih} relative cursor-pointer`}>
      {icon}
      <span>{opsi.find((o) => o.nilai === nilai)?.label ?? label}</span>
      <select
        aria-label={label}
        value={nilai}
        onChange={(e) => onGanti(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {opsi.map((o) => (
          <option key={o.nilai} value={o.nilai}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DataGame() {
  const admin = useWorkspaceUser(["ADMIN"]);
  const [games, setGames] = useState<Game[] | null>(null);
  const [jumlahDev, setJumlahDev] = useState(0);
  const [gagal, setGagal] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [genre, setGenre] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const muat = useCallback(async () => {
    try {
      const [g, u] = await Promise.all([
        fetch("/api/games", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
      ]);
      if (!g.ok) throw new Error();
      setGames(((await g.json()) as { games: Game[] }).games);
      if (u.ok) {
        const d = (await u.json()) as { users: { role: string; status: string }[] };
        setJumlahDev(
          d.users.filter((x) => x.role === "DEVELOPER" && x.status === "APPROVED").length,
        );
      }
      setGagal(false);
    } catch {
      setGagal(true);
    }
  }, []);

  useEffect(() => {
    if (admin) void muat();
  }, [admin, muat]);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  const jumlah = (s: string) => (games ?? []).filter((g) => g.status === s).length;

  const daftar = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return (games ?? []).filter(
      (g) =>
        (!status || g.status === status) &&
        (!genre || g.genre === genre) &&
        (!kata ||
          g.title.toLowerCase().includes(kata) ||
          namaDev(g).toLowerCase().includes(kata)),
    );
  }, [games, q, status, genre]);

  const baris = daftar.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN);

  const ubahStatus = async (g: Game, baru: string) => {
    setMenuId(null);
    const res = await fetch(`/api/admin/games/${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId: admin?.id, status: baru }),
    }).catch(() => null);
    if (!res || !res.ok) {
      const d = await res?.json().catch(() => ({}));
      alert(d?.pesan || "Status game gagal diubah.");
      return;
    }
    setGames((cur) => (cur ?? []).map((x) => (x.id === g.id ? { ...x, status: baru } : x)));
  };

  const hapus = async (g: Game) => {
    setMenuId(null);
    if (!admin || !confirm(`Hapus “${g.title}”? Transaksi dan kepemilikan game ini juga akan dihapus.`)) return;
    const res = await fetch(`/api/games/${g.id}?adminId=${encodeURIComponent(admin.id)}`, {
      method: "DELETE",
    }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (!res || !res.ok) {
      alert(d?.pesan || "Game gagal dihapus.");
      return;
    }
    setGames((cur) => (cur ?? []).filter((x) => x.id !== g.id));
  };

  const ekspor = () =>
    unduhCsv("katalog-game-orbit.csv", [
      ["Judul", "Developer", "Genre", "Harga", "Status", "Unduhan", "Diperbarui"],
      ...(games ?? []).map((g) => [
        g.title,
        namaDev(g),
        g.genre,
        g.price,
        labelStatus(g.status).label,
        g.downloadCount,
        formatTanggal(g.updatedAt),
      ]),
    ]);

  if (!admin) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  return (
    <>
      <Judul
        eyebrow="MANAJEMEN KATALOG"
        title="Data game"
        desc="Pantau seluruh game, developer, dan status publikasi dalam satu tempat."
        aksi={
          <button type="button" onClick={ekspor} className={tombolPutih}>
            <DownloadIcon size={17} /> Ekspor katalog
          </button>
        }
      />

      {gagal && (
        <p className="text-[11px] text-[#b42318]">
          Data game tidak bisa dimuat. Pastikan migrasi database sudah dijalankan.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrik
          warna="ungu"
          label="Total game"
          nilai={String((games ?? []).length)}
          catatan={`Dari ${jumlahDev} developer terverifikasi`}
          icon={<Gamepad2Icon size={18} />}
        />
        <Metrik
          warna="hijau"
          label="Dipublikasikan"
          nilai={dua(jumlah("PUBLISHED"))}
          catatan="Tersedia di katalog pengguna"
          icon={<CircleCheckIcon size={18} />}
        />
        <Metrik
          warna="oranye"
          label="Dalam peninjauan"
          nilai={dua(jumlah("REVIEW"))}
          catatan="Menunggu moderasi konten"
          icon={<Clock3Icon size={18} />}
        />
        <Metrik
          warna="biru"
          label="Nonaktif"
          nilai={dua(jumlah("INACTIVE"))}
          catatan="Tidak ditampilkan di katalog"
          icon={<CirclePauseIcon size={18} />}
        />
      </div>

      <Kartu>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 w-full items-center gap-[10px] rounded-[8px] border border-[#e4e6f0] bg-[#f5f6fa] px-[13px] sm:w-[425px]">
              <SearchIcon size={17} className="shrink-0" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setHalaman(1);
                }}
                placeholder="Cari judul game atau nama developer..."
                className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none"
              />
            </label>
            <Pilih
              icon={<ChevronDownIcon size={17} />}
              label="Status"
              nilai={status}
              onGanti={(v) => {
                setStatus(v);
                setHalaman(1);
              }}
              opsi={[
                { nilai: "", label: "Semua status" },
                ...STATUS.map((s) => ({ nilai: s.nilai, label: s.label })),
              ]}
            />
            <Pilih
              icon={<SlidersIcon size={17} />}
              label="Genre"
              nilai={genre}
              onGanti={(v) => {
                setGenre(v);
                setHalaman(1);
              }}
              opsi={[
                { nilai: "", label: "Semua genre" },
                ...GAME_GENRES.map((g) => ({ nilai: g, label: g })),
              ]}
            />
          </div>
          <p className="text-[11px]">{(games ?? []).length} game terdaftar</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid h-10 grid-cols-[300px_186px_130px_163px_130px_70px] items-center bg-[#f5f6fa] px-5 text-[10px] font-semibold">
              <span>GAME</span>
              <span>DEVELOPER</span>
              <span>GENRE</span>
              <span>STATUS</span>
              <span>DIPERBARUI</span>
              <span>AKSI</span>
            </div>
            {games === null && !gagal && (
              <p className="px-5 py-8 text-[11px] text-[#70758a]">Memuat…</p>
            )}
            {games !== null && baris.length === 0 && (
              <p className="px-5 py-8 text-[11px] text-[#70758a]">
                Tidak ada game yang cocok.
              </p>
            )}
            {baris.map((g) => {
              const st = labelStatus(g.status);
              return (
                <div
                  key={g.id}
                  className="grid min-h-[59px] grid-cols-[300px_186px_130px_163px_130px_70px] items-center border-b border-[#e4e6f0] px-5 py-2"
                >
                  <div className="flex min-w-0 items-center gap-[13px]">
                    <div className="h-[43px] w-[52px] shrink-0 overflow-hidden rounded-[7px] bg-gradient-to-br from-[#6d4aff] to-[#b9a6ff]">
                      {g.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.imageUrl} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-[5px]">
                      <span className="truncate text-[12px] font-semibold">{g.title}</span>
                      <span className="truncate text-[10px]">
                        {formatRupiah(g.price)} • {g.downloadCount} unduhan
                      </span>
                    </div>
                  </div>
                  <span className="truncate pr-3 text-[12px]">{namaDev(g)}</span>
                  <span className="text-[11px]">{g.genre}</span>
                  <span>
                    <Status warna={st.warna}>{st.label}</Status>
                  </span>
                  <span className="text-[11px] text-[#70758a]">
                    {formatTanggal(g.updatedAt)}
                  </span>
                  <div
                    ref={menuId === g.id ? menuRef : undefined}
                    className="relative flex items-center gap-[15px]"
                  >
                    <Link
                      href={`/game/${g.id}`}
                      target="_blank"
                      aria-label="Lihat di toko"
                    >
                      <EyeIcon size={17} />
                    </Link>
                    <button
                      type="button"
                      aria-label="Menu aksi"
                      onClick={() => setMenuId(menuId === g.id ? null : g.id)}
                    >
                      <EllipsisIcon size={17} />
                    </button>
                    {menuId === g.id && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-[190px] overflow-hidden rounded-[10px] border border-[#e4e6f0] bg-white text-[12px] shadow-lg">
                        {STATUS.filter((s) => s.nilai !== g.status).map((s) => (
                          <button
                            key={s.nilai}
                            type="button"
                            onClick={() => ubahStatus(g, s.nilai)}
                            className="block w-full px-3 py-2.5 text-left hover:bg-[#f5f6fa]"
                          >
                            {s.nilai === "PUBLISHED"
                              ? "Publikasikan"
                              : s.nilai === "REVIEW"
                                ? "Tandai ditinjau"
                                : "Nonaktifkan"}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => hapus(g)}
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

        <Pager
          halaman={halaman}
          total={daftar.length}
          perHalaman={PER_HALAMAN}
          satuan="game"
          onGanti={setHalaman}
        />
      </Kartu>

      <p className="flex items-center gap-[10px] text-[11px] text-[#70758a]">
        <InfoIcon size={15} />
        Game nonaktif tetap tersimpan, tetapi tidak dapat ditemukan atau diunduh oleh pengguna.
      </p>
    </>
  );
}
