"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/app/store/shell";
import { CheckIcon, DownloadIcon } from "@/app/store/icons";
import { Bintang, PanelUlasan, useUlasan } from "./ulasan";

type GameDetails = {
  id: string;
  title: string;
  description: string;
  genre: string;
  price: number;
  imageUrl: string | null;
  videoUrl: string | null;
  developerId: string;
  developer: { name: string | null; studioName: string | null };
};
type SessionUser = { id: string; role: string };
type Tab = "tentang" | "ulasan" | "sistem";

export default function DetailGame() {
  return (
    <Suspense fallback={<AppShell><p className="text-sm text-[#70758a]">Memuat halaman game...</p></AppShell>}>
      <DetailGameContent />
    </Suspense>
  );
}

function DetailGameContent() {
  const { id: idGame } = useParams<{ id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cekKepemilikan, setCekKepemilikan] = useState(true);
  const [sudahDimiliki, setSudahDimiliki] = useState(false);
  const [transaksiBerlangsung, setTransaksiBerlangsung] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const [tab, setTab] = useState<Tab>("tentang");
  const [putarVideo, setPutarVideo] = useState(false);
  const [pesan, setPesan] = useState("");
  const { data: dataUlasan, muat: muatUlasan, gagal: gagalUlasan } = useUlasan(idGame, user?.id ?? null);

  useEffect(() => {
    let aktif = true;
    let userLogin: SessionUser | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) userLogin = JSON.parse(raw) as SessionUser;
    } catch {
      localStorage.removeItem("user");
    }
    // localStorage hanya tersedia di browser; hydrate session setelah mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(userLogin);

    const muatGame = async () => {
      try {
        const res = await fetch(`/api/games/${idGame}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!aktif) return;
        if (res.ok) setGame(data.game);
        else setPesan(data.pesan || "Game tidak ditemukan.");
      } catch (error) {
        console.error("ERROR_DETAIL_GAME", error);
        if (aktif) setPesan("Game gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        if (aktif) setLoading(false);
      }
    };
    void muatGame();

    if (userLogin?.id && userLogin.role === "USER") {
      fetch(`/api/koleksi?me=${encodeURIComponent(userLogin.id)}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (aktif) setSudahDimiliki((data.games ?? []).some((item: { id: string }) => item.id === idGame));
        })
        .catch((error) => console.error("ERROR_CEK_KEPEMILIKAN_GAME", error))
        .finally(() => { if (aktif) setCekKepemilikan(false); });
    } else {
      setCekKepemilikan(false);
    }

    try {
      const tersimpanIds: string[] = JSON.parse(localStorage.getItem("game-orbit-simpan") || "[]");
      setTersimpan(tersimpanIds.includes(idGame));
    } catch {
      localStorage.removeItem("game-orbit-simpan");
      setTersimpan(false);
    }
    return () => { aktif = false; };
  }, [idGame]);

  const handleAksiUtama = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (sudahDimiliki) {
      router.push("/koleksi");
      return;
    }
    if (!game || transaksiBerlangsung) return;
    if (game.price > 0 && !confirm(`Yakin mau membeli ${game.title} seharga ${formatHarga(game.price)}?`)) return;

    setTransaksiBerlangsung(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, gameId: game.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.pesan === "Kamu sudah memiliki game ini!") {
        setSudahDimiliki(true);
        void muatUlasan();
        alert(game.price === 0 ? "Game berhasil ditambahkan ke koleksi!" : "Pembelian berhasil! Game masuk ke koleksi kamu.");
      } else {
        alert(data.pesan || "Transaksi gagal. Coba lagi.");
      }
    } catch (error) {
      console.error("ERROR_TRANSAKSI_GAME", error);
      alert("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setTransaksiBerlangsung(false);
    }
  };

  const toggleSimpan = () => {
    const ids: string[] = JSON.parse(localStorage.getItem("game-orbit-simpan") || "[]");
    const berikutnya = tersimpan ? ids.filter((id) => id !== idGame) : [...ids, idGame];
    localStorage.setItem("game-orbit-simpan", JSON.stringify(berikutnya));
    setTersimpan(!tersimpan);
  };

  const bagikan = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link game berhasil disalin.");
    } catch {
      alert("Browser tidak mengizinkan penyalinan link.");
    }
  };

  if (loading) return <AppShell><p className="text-sm text-[#70758a]">Memuat game...</p></AppShell>;
  if (!game) return <AppShell><p className="text-sm text-[#70758a]">{pesan || "Game tidak ditemukan."}</p></AppShell>;

  const developer = game.developer?.studioName || game.developer?.name || "Developer";
  const labelAksi = transaksiBerlangsung
    ? "Memproses..."
    : cekKepemilikan
      ? "Memeriksa koleksi..."
      : sudahDimiliki
        ? "Mainkan Game Sekarang"
        : game.price === 0
          ? "Tambahkan Game ke Library"
          : "Beli Sekarang";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1180px] gap-5">
        <nav className="mb-5 flex items-center gap-2 text-[11px] text-[#70758a]" aria-label="Breadcrumb">
          <button onClick={() => router.push("/store")} className="hover:text-[#6d4aff]">Jelajahi</button>
          <span>/</span><span>{developer}</span><span>/</span>
          <span className="max-w-[220px] truncate text-[#292a40]">{game.title}</span>
        </nav>

        <section className="relative isolate flex min-h-[270px] items-end overflow-hidden rounded-[18px] bg-[#211a39] p-6 text-white sm:min-h-[300px] sm:p-8">
          {game.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={game.imageUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#171328]/95 via-[#171328]/70 to-[#171328]/15" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#171328]/65 via-transparent to-transparent" />
          <div className="max-w-[700px]">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#d9d0ff]">Pilihan Game Orbit</p>
            <h1 className="text-3xl font-extrabold tracking-[-1px] sm:text-[42px]">{game.title}</h1>
            <p className="mt-2 text-[12px] text-white/80">{developer}<span className="px-2">·</span>{game.genre}</p>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-white/90">
              <span className="inline-flex items-center gap-1.5"><Bintang nilai={dataUlasan.ringkasan.rata} ukuran={13} /><b className="text-sm">{dataUlasan.ringkasan.jumlah === 0 ? "—" : dataUlasan.ringkasan.rata.toFixed(1)}</b></span>
              <span><b className="mr-1 text-sm">{dataUlasan.ringkasan.unduhan}</b> Unduhan</span>
              <span><b className="mr-1 text-sm">{dataUlasan.ringkasan.jumlah}</b> Ulasan</span>
              <span className="font-semibold">{game.price === 0 ? "Gratis" : formatHarga(game.price)}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={handleAksiUtama} disabled={cekKepemilikan || transaksiBerlangsung} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#704cff] px-4 text-[11px] font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#5d3ee0] disabled:cursor-wait disabled:opacity-60">
                {sudahDimiliki ? <CheckIcon size={15} /> : <DownloadIcon size={15} />}{labelAksi}
              </button>
              <button onClick={toggleSimpan} className="min-h-10 rounded-lg bg-white px-4 text-[11px] font-semibold text-[#292a40] hover:bg-[#f0ecff]">{tersimpan ? "✓ Tersimpan" : "Simpan"}</button>
              <button onClick={bagikan} className="min-h-10 rounded-lg border border-white/35 bg-white/10 px-4 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/20">Bagikan</button>
              <span className="ml-1 text-[10px] text-white/75">Tersedia untuk Windows</span>
            </div>
          </div>
        </section>

        <div className="mt-5 flex gap-6 border-b border-[#e1e3ed] text-[11px]">
          {([
            ["tentang", "Tentang game"], ["ulasan", "Rating & ulasan"], ["sistem", "Persyaratan sistem"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`border-b-2 pb-3 transition ${tab === id ? "border-[#704cff] font-semibold text-[#282943]" : "border-transparent text-[#70758a] hover:text-[#282943]"}`}>{label}</button>
          ))}
        </div>

        {tab === "tentang" && (
          <>
            <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="relative flex aspect-[2.15/1] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#211a39] via-[#34265e] to-[#7965ad]">
                  {game.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={game.imageUrl} alt={`${game.title} artwork ${item + 1}`} className="absolute inset-0 h-full w-full object-cover opacity-75" />
                  ) : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#a78bfa66,transparent_35%),linear-gradient(135deg,transparent_35%,#09081799)]" />}
                  {item === 0 && game.videoUrl && !putarVideo && (
                    <button
                      type="button"
                      onClick={() => setPutarVideo(true)}
                      aria-label="Putar video game"
                      className="z-10 flex size-11 items-center justify-center rounded-full bg-white/95 text-lg text-[#704cff] shadow-lg transition hover:scale-105"
                    >
                      ▶
                    </button>
                  )}
                  {item === 0 && game.videoUrl && putarVideo && (
                    <video
                      src={game.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="absolute inset-0 z-20 h-full w-full bg-black object-contain"
                    />
                  )}
                  {!game.imageUrl && <span className="z-10 px-4 text-center text-xs font-semibold text-white/80">{game.title}</span>}
                </div>
              ))}
            </section>
            <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_.9fr]">
              <article>
                <h2 className="text-[18px] font-semibold">{game.title}</h2>
                <p className="mt-3 whitespace-pre-line text-[12px] leading-6 text-[#73768b]">{game.description || "Belum ada deskripsi untuk game ini."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[game.genre].map((tag) => <span key={tag} className="rounded-md bg-white px-2.5 py-1.5 text-[10px] text-[#555970] shadow-sm">{tag}</span>)}
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[10px] sm:grid-cols-3">
                  <div><dt className="text-[#8a8da0]">Developer</dt><dd className="mt-1 font-medium">{developer}</dd></div>
                  <div><dt className="text-[#8a8da0]">Harga</dt><dd className="mt-1 font-medium">{game.price === 0 ? "Gratis" : formatHarga(game.price)}</dd></div>
                  <div><dt className="text-[#8a8da0]">Platform</dt><dd className="mt-1 font-medium">Windows</dd></div>
                </dl>
              </article>
              <aside className="rounded-xl border border-[#e3e5ef] bg-white p-4">
                <div className="flex items-center justify-between border-b border-[#ececf2] pb-3">
                  <div>
                    <strong className="text-2xl">{dataUlasan.ringkasan.jumlah === 0 ? "—" : dataUlasan.ringkasan.rata.toFixed(1)}</strong>
                    <p className="text-[9px] text-[#85889a]">{dataUlasan.ringkasan.jumlah === 0 ? "Belum ada rating" : `${dataUlasan.ringkasan.jumlah} ulasan`}</p>
                  </div>
                  <button onClick={() => setTab("ulasan")} className="text-[9px] text-[#6d4aff] hover:underline">Lihat ulasan ↗</button>
                </div>
                {dataUlasan.ulasan[0] ? (
                  <p className="line-clamp-4 py-4 text-[11px] leading-5 text-[#73768b]">&ldquo;{dataUlasan.ulasan[0].content}&rdquo; <span className="text-[#9a9db0]">— {dataUlasan.ulasan[0].user.name}</span></p>
                ) : (
                  <p className="py-4 text-[11px] leading-5 text-[#73768b]">Belum ada ulasan untuk game ini. Jadilah pemain pertama yang memberikan ulasan.</p>
                )}
                <button onClick={() => setTab("ulasan")} className="rounded-md bg-[#f0ecff] px-3 py-2 text-[10px] font-semibold text-[#6743dc]">{dataUlasan.milikSaya ? "Lihat ulasan kamu" : "Tulis ulasan"}</button>
              </aside>
            </section>
          </>
        )}

        {tab === "ulasan" && (
          <PanelUlasan
            gameId={game.id}
            judul={game.title}
            userId={user?.id ?? null}
            peran={user?.role ?? null}
            data={{ ...dataUlasan, punyaGame: dataUlasan.punyaGame || sudahDimiliki }}
            gagalMuat={gagalUlasan}
            onUbah={() => void muatUlasan()}
            onLogin={() => router.push("/login")}
            onMiliki={() => void handleAksiUtama()}
          />
        )}
        {tab === "sistem" && (
          <section className="mt-5 rounded-xl border border-[#e3e5ef] bg-white p-6">
            <h2 className="text-lg font-semibold">Persyaratan sistem</h2>
            <p className="mt-2 text-sm text-[#73768b]">Informasi persyaratan sistem belum ditambahkan oleh developer.</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function formatHarga(harga: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(harga);
}
