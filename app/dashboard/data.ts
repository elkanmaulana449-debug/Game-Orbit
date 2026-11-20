// app/dashboard/data.ts
// Tipe dan hook data yang dipakai halaman-halaman developer.

import { useCallback, useEffect, useState } from "react";

export type GameDev = {
  id: string;
  title: string;
  description: string;
  genre: string;
  price: number;
  imageUrl: string | null;
  videoUrl: string | null;
  status: string; // PUBLISHED | REVIEW | INACTIVE
  updatedAt: string;
  downloadCount: number;
};

export type Analitik = {
  harian: { tanggal: string; jumlah: number }[];
  unduhan30Hari: number;
  unduhan30HariSebelumnya: number;
  pendapatan30Hari: number;
  aktivitas: { pembeli: string; game: string; waktu: string }[];
};

export function useGameDeveloper(developerId?: string) {
  const [games, setGames] = useState<GameDev[] | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    if (!developerId) return;
    let batal = false;
    fetch(`/api/games?developerId=${encodeURIComponent(developerId)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { games: GameDev[] }) => !batal && setGames(d.games))
      .catch(() => !batal && setGagal(true));
    return () => {
      batal = true;
    };
  }, [developerId]);

  const hapus = useCallback(
    async (g: GameDev) => {
      if (
        !developerId ||
        !confirm(`Hapus “${g.title}”? Transaksi dan kepemilikan game ini juga akan dihapus.`)
      )
        return;
      const res = await fetch(
        `/api/games/${g.id}?developerId=${encodeURIComponent(developerId)}`,
        { method: "DELETE" },
      ).catch(() => null);
      const d = await res?.json().catch(() => ({}));
      if (!res || !res.ok) {
        alert(d?.pesan || "Game gagal dihapus.");
        return;
      }
      setGames((cur) => (cur ?? []).filter((x) => x.id !== g.id));
    },
    [developerId],
  );

  return { games, gagal, hapus };
}

export function useAnalitik(developerId?: string) {
  const [data, setData] = useState<Analitik | null>(null);

  useEffect(() => {
    if (!developerId) return;
    let batal = false;
    fetch(`/api/developer/analitik?developerId=${encodeURIComponent(developerId)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Analitik) => !batal && setData(d))
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [developerId]);

  return data;
}

export function waktuRelatif(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  const kemarin = new Date(n.getTime() - 24 * 60 * 60 * 1000);
  const jam = d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", ".");
  if (d.toDateString() === n.toDateString()) return `Hari ini, ${jam}`;
  if (d.toDateString() === kemarin.toDateString()) return `Kemarin, ${jam}`;
  return `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${jam}`;
}
