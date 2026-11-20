"use client";

import { useCallback, useEffect, useState } from "react";

export type Ulasan = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
};
export type DataUlasan = {
  ringkasan: { rata: number; jumlah: number; distribusi: number[]; unduhan: number };
  ulasan: Ulasan[];
  punyaGame: boolean;
  milikSaya: { id: string; rating: number; content: string } | null;
};

const KOSONG: DataUlasan = {
  ringkasan: { rata: 0, jumlah: 0, distribusi: [0, 0, 0, 0, 0], unduhan: 0 },
  ulasan: [],
  punyaGame: false,
  milikSaya: null,
};

export function useUlasan(gameId: string, userId: string | null) {
  const [data, setData] = useState<DataUlasan>(KOSONG);
  const [memuat, setMemuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  const muat = useCallback(async () => {
    try {
      const query = userId ? `?me=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/games/${gameId}/ulasan${query}`, { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
        setGagal(false);
      } else {
        setGagal(true);
      }
    } catch (error) {
      console.error("ERROR_MUAT_ULASAN", error);
      setGagal(true);
    } finally {
      setMemuat(false);
    }
  }, [gameId, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  return { data, memuat, muat, gagal };
}

export function Bintang({ nilai, ukuran = 14 }: { nilai: number; ukuran?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${nilai} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={ukuran} height={ukuran} viewBox="0 0 24 24" fill={n <= Math.round(nilai) ? "#f5b301" : "#e1e3ed"} aria-hidden="true">
          <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function labelRating(data: DataUlasan) {
  return data.ringkasan.jumlah === 0 ? "Belum ada rating" : `${data.ringkasan.jumlah} ulasan`;
}

function tanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function PanelUlasan({
  gameId, judul, userId, peran, data, gagalMuat, onUbah, onLogin, onMiliki,
}: {
  gagalMuat?: boolean;
  gameId: string;
  judul: string;
  userId: string | null;
  peran: string | null;
  data: DataUlasan;
  onUbah: () => void;
  onLogin: () => void;
  onMiliki: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isi, setIsi] = useState("");
  const [kirim, setKirim] = useState(false);
  const [pesan, setPesan] = useState("");
  const [mengubah, setMengubah] = useState(false);

  const { ringkasan } = data;
  const sudahMenulis = Boolean(data.milikSaya) && !mengubah;

  const mulaiUbah = () => {
    if (!data.milikSaya) return;
    setRating(data.milikSaya.rating);
    setIsi(data.milikSaya.content);
    setMengubah(true);
  };

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setPesan("");
    if (rating < 1) return setPesan("Pilih rating bintang dulu.");
    if (isi.trim().length < 5) return setPesan("Ulasan minimal 5 karakter.");
    setKirim(true);
    try {
      const res = await fetch(`/api/games/${gameId}/ulasan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, content: isi }),
      });
      const hasil = await res.json().catch(() => ({}));
      if (!res.ok) return setPesan(hasil.pesan || "Gagal menyimpan ulasan.");
      setMengubah(false);
      setRating(0);
      setIsi("");
      onUbah();
    } catch (error) {
      console.error("ERROR_KIRIM_ULASAN", error);
      setPesan("Tidak dapat terhubung ke server.");
    } finally {
      setKirim(false);
    }
  };

  const hapus = async () => {
    if (!userId || !confirm("Hapus ulasan kamu?")) return;
    try {
      await fetch(`/api/games/${gameId}/ulasan?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
      setRating(0);
      setIsi("");
      onUbah();
    } catch (error) {
      console.error("ERROR_HAPUS_ULASAN", error);
    }
  };

  return (
    <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[.8fr_1.6fr]">
      <aside className="h-fit rounded-xl border border-[#e3e5ef] bg-white p-5">
        <h2 className="text-lg font-semibold">Rating & ulasan</h2>
        <div className="mt-4 flex items-center gap-4">
          <strong className="text-4xl">{ringkasan.jumlah === 0 ? "—" : ringkasan.rata.toFixed(1)}</strong>
          <div>
            <Bintang nilai={ringkasan.rata} ukuran={16} />
            <p className="mt-1 text-[10px] text-[#85889a]">{ringkasan.jumlah} ulasan · {ringkasan.unduhan} pemain</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const jumlah = ringkasan.distribusi[n - 1];
            const persen = ringkasan.jumlah === 0 ? 0 : (jumlah / ringkasan.jumlah) * 100;
            return (
              <div key={n} className="flex items-center gap-2 text-[10px] text-[#73768b]">
                <span className="w-3">{n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eceef5]">
                  <div className="h-full rounded-full bg-[#f5b301]" style={{ width: `${persen}%` }} />
                </div>
                <span className="w-5 text-right">{jumlah}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="space-y-4">
        {gagalMuat && (
          <p className="rounded-xl bg-[#fff0f1] p-4 text-[12px] text-[#c3475a]">
            Ulasan gagal dimuat dari server. Pastikan migrasi database sudah dijalankan (npx prisma migrate dev --config prisma7.config.ts) lalu restart npm run dev.
          </p>
        )}
        <div className="rounded-xl border border-[#e3e5ef] bg-white p-5">
          {!userId ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-[#73768b]">Masuk untuk menulis ulasan.</p>
              <button onClick={onLogin} className="rounded-lg bg-[#704cff] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#5d3ee0]">Masuk</button>
            </div>
          ) : peran !== "USER" ? (
            <p className="text-[12px] text-[#73768b]">Hanya akun pemain yang bisa menulis ulasan.</p>
          ) : !data.punyaGame ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] leading-5 text-[#73768b]">Miliki {judul} dulu (beli atau unduh) untuk bisa memberi rating dan ulasan.</p>
              <button onClick={onMiliki} className="rounded-lg bg-[#f0ecff] px-4 py-2 text-[11px] font-semibold text-[#6743dc] hover:bg-[#e6e0ff]">Dapatkan game</button>
            </div>
          ) : sudahMenulis && data.milikSaya ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] font-semibold">Ulasan kamu</p>
                <div className="flex gap-3 text-[11px]">
                  <button onClick={mulaiUbah} className="text-[#6d4aff] hover:underline">Ubah</button>
                  <button onClick={hapus} className="text-[#d6455d] hover:underline">Hapus</button>
                </div>
              </div>
              <div className="mt-2"><Bintang nilai={data.milikSaya.rating} /></div>
              <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[#555970]">{data.milikSaya.content}</p>
            </div>
          ) : (
            <form onSubmit={simpan}>
              <p className="text-[12px] font-semibold">{mengubah ? "Ubah ulasan" : "Tulis ulasan"}</p>
              <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} bintang`}
                    className="p-0.5"
                  >
                    <Bintang nilai={(hover || rating) >= n ? n : 0} ukuran={24} />
                  </button>
                ))}
              </div>
              <textarea
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={`Ceritakan pengalamanmu bermain ${judul}...`}
                className="mt-3 w-full resize-y rounded-lg border border-[#dfe1ec] p-3 text-[12px] outline-none focus:border-[#704cff]"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-[#85889a]">
                <span className="text-[#d6455d]">{pesan}</span>
                <span>{isi.length}/1000</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button disabled={kirim} className="rounded-lg bg-[#704cff] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#5d3ee0] disabled:opacity-60">
                  {kirim ? "Menyimpan..." : "Kirim ulasan"}
                </button>
                {mengubah && (
                  <button type="button" onClick={() => setMengubah(false)} className="rounded-lg px-4 py-2 text-[11px] text-[#70758a] hover:bg-[#f0f1f6]">Batal</button>
                )}
              </div>
            </form>
          )}
        </div>

        {data.ulasan.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d8dbe8] bg-white p-6 text-center text-[12px] text-[#73768b]">
            Belum ada ulasan untuk {judul}. Jadilah yang pertama!
          </p>
        ) : (
          data.ulasan.map((item) => (
            <article key={item.id} className="rounded-xl border border-[#e3e5ef] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#ece7ff] text-[11px] font-bold text-[#6743dc]">
                    {item.user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">{item.user.name}{item.user.id === userId && <span className="ml-2 text-[9px] font-normal text-[#6d4aff]">(kamu)</span>}</p>
                    <p className="text-[10px] text-[#85889a]">{tanggal(item.createdAt)}</p>
                  </div>
                </div>
                <Bintang nilai={item.rating} />
              </div>
              <p className="mt-3 whitespace-pre-line text-[12px] leading-5 text-[#555970]">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
