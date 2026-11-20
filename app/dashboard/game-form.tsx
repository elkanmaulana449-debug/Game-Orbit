// app/dashboard/game-form.tsx
// Formulir tambah / ubah game (logika upload sama seperti dashboard lama).
"use client";

import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAME_GENRES } from "@/app/lib/game-genres";
import { useWorkspaceUser } from "@/app/workspace/client";
import {
  Judul,
  Kartu,
  formatRupiah,
  tombolPutih,
  tombolUngu,
} from "@/app/workspace/ui";
import type { GameDev } from "./data";

const kolom =
  "h-[49px] w-full rounded-[8px] border border-[#e4e6f0] bg-[#f5f6fa] px-[15px] text-[14px] placeholder:text-[#9aa0b5] focus:border-[#6d4aff] focus:bg-white focus:outline-none";
const label = "flex flex-col gap-[9px] text-[13px] font-medium text-[#70758a]";

const BATAS_GAMBAR = 10 * 1024 * 1024;
const BATAS_VIDEO = 100 * 1024 * 1024;

function UploadIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m17 8-5-5-5 5" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}

// Kotak unggah file dengan pratinjau (gambar atau video)
function Unggah({
  jenis,
  judul,
  petunjuk,
  accept,
  batas,
  file,
  urlLama,
  hapusLama,
  onFile,
  onHapusLama,
  onGalat,
}: {
  jenis: "gambar" | "video";
  judul: string;
  petunjuk: string;
  accept: string;
  batas: number;
  file: File | null;
  urlLama: string | null;
  hapusLama: boolean;
  onFile: (f: File | null) => void;
  onHapusLama: (v: boolean) => void;
  onGalat: (pesan: string) => void;
}) {
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [seret, setSeret] = useState(false);

  useEffect(() => {
    if (!file) {
      setPratinjau(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPratinjau(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const terima = (f: File | undefined) => {
    if (!f) return;
    if (!accept.split(",").includes(f.type)) {
      onGalat(`Format ${judul.toLowerCase()} tidak didukung.`);
      return;
    }
    if (f.size > batas) {
      onGalat(`${judul} terlalu besar (maks. ${batas / 1024 / 1024} MB).`);
      return;
    }
    onGalat("");
    onHapusLama(false);
    onFile(f);
  };

  const sumber = pratinjau ?? (!hapusLama ? urlLama : null);

  const lepas = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setSeret(false);
    terima(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-[9px]">
      <span className="text-[13px] font-medium text-[#70758a]">{judul}</span>

      {sumber ? (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-[10px] border border-[#e4e6f0] bg-[#f5f6fa]">
            {jenis === "gambar" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sumber} alt="Pratinjau sampul" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <video src={sumber} controls className="aspect-video w-full bg-black" />
            )}
          </div>
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <span className="min-w-0 truncate text-[#70758a]">
              {file ? file.name : "File saat ini"}
            </span>
            <div className="flex shrink-0 gap-3">
              <label className="cursor-pointer font-semibold text-[#6d4aff] hover:underline">
                Ganti
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    terima(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (file) onFile(null);
                  else onHapusLama(true);
                }}
                className="font-semibold text-[#c3475a] hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setSeret(true);
          }}
          onDragLeave={() => setSeret(false)}
          onDrop={lepas}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed px-4 py-8 text-center transition ${
            seret
              ? "border-[#6d4aff] bg-[#f0ecff]"
              : "border-[#d9dcec] bg-[#fafaff] hover:border-[#6d4aff] hover:bg-[#f7f5ff]"
          }`}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-[#ede8ff] text-[#6d4aff]">
            <UploadIcon />
          </span>
          <span className="text-[12px] font-semibold text-[#22243a]">
            Klik untuk memilih, atau seret file ke sini
          </span>
          <span className="text-[11px] text-[#70758a]">{petunjuk}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              terima(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export function GameForm({ gameId }: { gameId?: string }) {
  const router = useRouter();
  const user = useWorkspaceUser(["DEVELOPER"]);
  const ubah = !!gameId;

  const [game, setGame] = useState<GameDev | null>(null);
  const [memuat, setMemuat] = useState(ubah);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [genre, setGenre] = useState<string>("Lainnya");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [hapusGambar, setHapusGambar] = useState(false);
  const [hapusVideo, setHapusVideo] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState("");

  // Mode ubah: isi formulir dari data game
  useEffect(() => {
    if (!gameId || !user) return;
    let batal = false;
    fetch(`/api/games/${gameId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { game: GameDev & { developerId: string } }) => {
        if (batal) return;
        if (d.game.developerId !== user.id) {
          setGalat("Game ini bukan milik akun kamu.");
        } else {
          setGame(d.game);
          setJudul(d.game.title);
          setDeskripsi(d.game.description);
          setGenre(d.game.genre || "Lainnya");
          setHarga(String(d.game.price));
        }
      })
      .catch(() => !batal && setGalat("Game tidak ditemukan."))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [gameId, user]);

  const unggah = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    form.set("developerId", user!.id);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.pesan || "Gagal mengunggah media.");
    return d.url as string;
  };

  const simpan = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || menyimpan) return;
    setMenyimpan(true);
    setGalat("");
    try {
      let imageUrl = game?.imageUrl ?? null;
      let videoUrl = game?.videoUrl ?? null;
      if (gambar) imageUrl = await unggah(gambar);
      else if (hapusGambar) imageUrl = null;
      if (video) videoUrl = await unggah(video);
      else if (hapusVideo) videoUrl = null;

      const res = await fetch(ubah ? `/api/games/${gameId}` : "/api/games", {
        method: ubah ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: judul,
          description: deskripsi,
          genre,
          price: harga,
          developerId: user.id,
          imageUrl,
          videoUrl,
          removeImage: hapusGambar,
          removeVideo: hapusVideo,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.pesan || "Gagal menyimpan game.");
      router.push("/dashboard/game");
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan game.");
    } finally {
      setMenyimpan(false);
    }
  };

  if (!user) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  const angkaHarga = Number(harga);
  const labelHarga =
    harga === "" || !Number.isFinite(angkaHarga) || angkaHarga < 0
      ? null
      : formatRupiah(angkaHarga);

  return (
    <>
      <Judul
        eyebrow="KARYAMU"
        title={ubah ? "Ubah game" : "Tambah game"}
        desc={
          ubah
            ? "Perbarui detail, gambar sampul, atau video game."
            : "Isi detail game, lalu unggah gambar dan video pendukung."
        }
      />

      {memuat ? (
        <p className="text-[12px] text-[#70758a]">Memuat game…</p>
      ) : ubah && !game ? (
        <p className="text-[12px] text-[#b42318]">{galat || "Game tidak ditemukan."}</p>
      ) : (
        <form onSubmit={simpan} className="flex flex-col gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            {/* Informasi */}
            <Kartu className="flex flex-col gap-[22px] p-6">
              <h2 className="text-[17px]">Informasi game</h2>

              <label className={label}>
                Judul game
                <input
                  required
                  maxLength={80}
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Eclipse: Frontier"
                  className={kolom}
                />
              </label>

              <label className={label}>
                <span className="flex items-center justify-between">
                  Deskripsi
                  <span className="text-[11px] font-normal">{deskripsi.length}/1000</span>
                </span>
                <textarea
                  required
                  rows={7}
                  maxLength={1000}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ceritakan tentang game ini: alur cerita, cara bermain, dan keunikannya."
                  className={`${kolom} h-auto resize-y py-3 leading-[1.7]`}
                />
              </label>

              <div className="flex flex-col gap-[18px] sm:flex-row">
                <label className={`${label} flex-1`}>
                  Genre
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className={kolom}>
                    {GAME_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${label} flex-1`}>
                  Harga
                  <span className="flex h-[49px] items-center overflow-hidden rounded-[8px] border border-[#e4e6f0] bg-[#f5f6fa] focus-within:border-[#6d4aff] focus-within:bg-white">
                    <span className="flex h-full items-center border-r border-[#e4e6f0] px-[15px] text-[13px] font-semibold text-[#22243a]">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="0"
                      className="h-full min-w-0 flex-1 bg-transparent px-[15px] text-[14px] text-[#22243a] placeholder:text-[#9aa0b5] focus:outline-none"
                    />
                  </span>
                  <span className="text-[11px] font-normal">
                    {labelHarga ? `Tampil di toko: ${labelHarga}` : "Isi 0 untuk game gratis."}
                  </span>
                </label>
              </div>
            </Kartu>

            {/* Media */}
            <Kartu className="flex flex-col gap-[22px] p-6">
              <h2 className="text-[17px]">Media</h2>
              <Unggah
                jenis="gambar"
                judul="Gambar sampul"
                petunjuk="JPG, PNG, WEBP, atau GIF • maks. 10 MB"
                accept="image/jpeg,image/png,image/webp,image/gif"
                batas={BATAS_GAMBAR}
                file={gambar}
                urlLama={game?.imageUrl ?? null}
                hapusLama={hapusGambar}
                onFile={setGambar}
                onHapusLama={setHapusGambar}
                onGalat={setGalat}
              />
              <Unggah
                jenis="video"
                judul="Video game (opsional)"
                petunjuk="MP4 atau WEBM • maks. 100 MB"
                accept="video/mp4,video/webm"
                batas={BATAS_VIDEO}
                file={video}
                urlLama={game?.videoUrl ?? null}
                hapusLama={hapusVideo}
                onFile={setVideo}
                onHapusLama={setHapusVideo}
                onGalat={setGalat}
              />
              {ubah && (
                <p className="text-[11px] text-[#70758a]">
                  File baru menggantikan file lama setelah disimpan.
                </p>
              )}
            </Kartu>
          </div>

          {galat && (
            <p role="alert" className="rounded-[8px] bg-[#fff0f1] px-3 py-2.5 text-[12px] text-[#c3475a]">
              {galat}
            </p>
          )}

          <div className="flex gap-[10px]">
            <button type="submit" disabled={menyimpan} className={tombolUngu}>
              {menyimpan ? "Mengunggah dan menyimpan…" : ubah ? "Simpan perubahan" : "Simpan game"}
            </button>
            <Link href="/dashboard/game" className={tombolPutih}>
              Batal
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
