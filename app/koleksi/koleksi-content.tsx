// app/koleksi/koleksi-content.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoreUser } from "@/app/store/client-parts";
import { ArrowRightIcon, LibraryBigIcon, SearchIcon } from "@/app/store/icons";

type GameKoleksi = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  developer: string;
  diperolehPada: string;
};

type Urutan = "terbaru" | "terlama" | "nama";

const URUTAN: { nilai: Urutan; label: string }[] = [
  { nilai: "terbaru", label: "Terbaru dibeli" },
  { nilai: "terlama", label: "Terlama dibeli" },
  { nilai: "nama", label: "Nama A–Z" },
];

function tanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Sampul({ game }: { game: GameKoleksi }) {
  return (
    <div className="aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-[#6d4aff] to-[#b9a6ff]">
      {game.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={game.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-[34px] font-bold text-white">
          {game.title[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function KoleksiContent() {
  const router = useRouter();
  const user = useStoreUser();
  const [games, setGames] = useState<GameKoleksi[] | null>(null);
  const [gagal, setGagal] = useState(false);
  const [q, setQ] = useState("");
  const [urut, setUrut] = useState<Urutan>("terbaru");

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user?.id) return;
    let batal = false;
    fetch(`/api/koleksi?me=${encodeURIComponent(user.id)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { games: GameKoleksi[] }) => !batal && setGames(d.games))
      .catch(() => !batal && setGagal(true));
    return () => {
      batal = true;
    };
  }, [user?.id]);

  const tampil = useMemo(() => {
    if (!games) return [];
    const kata = q.trim().toLowerCase();
    const hasil = games.filter(
      (g) =>
        !kata ||
        g.title.toLowerCase().includes(kata) ||
        g.developer.toLowerCase().includes(kata),
    );
    if (urut === "terlama") hasil.reverse();
    if (urut === "nama") hasil.sort((a, b) => a.title.localeCompare(b.title, "id"));
    return hasil;
  }, [games, q, urut]);

  if (!user) return null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#6d4aff]">PERPUSTAKAAN Game Orbit</p>
        <h1 className="text-[30px] font-bold leading-tight">Koleksi saya</h1>
        <p className="text-[13px] text-[#70758a]">
          {games
            ? `${games.length} game yang sudah kamu miliki.`
            : "Semua game yang sudah kamu miliki, di satu tempat."}
        </p>
      </div>

      {games && games.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-[42px] min-w-0 flex-1 items-center gap-3 rounded-[8px] border border-[#e4e6f0] bg-white px-[15px] sm:max-w-[420px]">
            <SearchIcon size={18} className="shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari di koleksimu"
              className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none"
            />
          </label>
          <select
            value={urut}
            onChange={(e) => setUrut(e.target.value as Urutan)}
            aria-label="Urutkan koleksi"
            className="h-[42px] rounded-[8px] border border-[#e4e6f0] bg-white px-3 text-[13px] font-semibold focus:outline-none"
          >
            {URUTAN.map((u) => (
              <option key={u.nilai} value={u.nilai}>
                Urutkan: {u.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {gagal && (
        <p className="text-[11px] text-[#b42318]">
          Koleksi tidak bisa dimuat. Muat ulang halaman atau coba lagi nanti.
        </p>
      )}

      {!games && !gagal && <p className="text-[12px] text-[#70758a]">Memuat koleksi...</p>}

      {games && games.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[14px] border border-[#e4e6f0] bg-white px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-[14px] bg-[#f0ecff] text-[#6d4aff]">
            <LibraryBigIcon size={26} />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-[17px] font-semibold">Koleksimu masih kosong</h2>
            <p className="max-w-[360px] text-[12px] leading-[1.7] text-[#70758a]">
              Game yang sudah kamu beli akan muncul di sini supaya mudah ditemukan lagi.
            </p>
          </div>
          <Link
            href="/store?jelajahi=1"
            className="flex h-[42px] items-center gap-2 rounded-[8px] bg-[#6d4aff] px-5 text-[13px] font-semibold text-white hover:bg-[#5b3be6]"
          >
            Jelajahi game <ArrowRightIcon size={15} />
          </Link>
        </div>
      )}

      {games && games.length > 0 && tampil.length === 0 && (
        <p className="text-[12px] text-[#70758a]">
          Tidak ada game yang cocok dengan “{q}”.
        </p>
      )}

      {tampil.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tampil.map((g) => (
            <Link
              key={g.id}
              href={`/game/${g.id}`}
              className="flex flex-col gap-4 rounded-[14px] border border-[#e4e6f0] bg-white p-4 transition-shadow hover:shadow-md"
            >
              <Sampul game={g} />
              <div className="flex min-w-0 flex-col gap-[6px]">
                <h3 className="truncate text-[14px] font-semibold">{g.title}</h3>
                <p className="truncate text-[11px] text-[#70758a]">{g.developer}</p>
                <p className="text-[10px] text-[#70758a]">
                  Dimiliki sejak {tanggal(g.diperolehPada)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
