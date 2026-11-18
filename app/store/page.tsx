// app/store/page.tsx
// Beranda + hasil pencarian user (setelah login) — mengikuti frame Figma
// "User · Beranda" dan "User · Hasil pencarian game".
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleCheckIcon,
  DownloadIcon,
  SparklesIcon,
  XIcon,
} from "./icons";
import { SortMenu, UserGreeting } from "./client-parts";
import { AppShell } from "./shell";

type SearchParamsInput = {
  q?: string;
  harga?: string;
  urut?: string;
  jelajahi?: string; // "1" = tampilkan semua game (menu Jelajahi)
};

type StorePageProps = {
  searchParams: Promise<SearchParamsInput>;
};

type GameItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  developer: { name: string | null; studioName: string | null };
};

type GameRow = GameItem & {
  createdAt: Date;
  _count: { transactions: number };
};

const insensitive = "insensitive" as const;

const URUTAN = [
  { value: "relevan", label: "Paling relevan" },
  { value: "terbaru", label: "Terbaru" },
  { value: "populer", label: "Terpopuler" },
  { value: "termurah", label: "Harga terendah" },
  { value: "termahal", label: "Harga tertinggi" },
] as const;

type Urut = (typeof URUTAN)[number]["value"];
type Harga = "gratis" | "berbayar";

function formatHarga(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function namaDeveloper(game: GameItem) {
  return game.developer.studioName || game.developer.name || "Developer";
}

// Gambar game dari database; kalau kosong pakai gradasi ungu + huruf pertama judul
function Artwork({ game, className }: { game: GameItem; className?: string }) {
  if (game.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={game.imageUrl}
        alt={game.title}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#6d4aff] via-[#4f46e5] to-[#38bdf8] font-bold text-white/90 ${className ?? ""}`}
    >
      <span className="text-3xl">{game.title.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ==========================================================
// Halaman: sidebar + bilah atas ada di AppShell (shell.tsx). Bagian yang
// butuh data dibungkus <Suspense> karena cacheComponents aktif.
// ==========================================================
export default function StorePage({ searchParams }: StorePageProps) {
  return (
    <AppShell>
      <Suspense fallback={<StoreSkeleton />}>
        <StoreContent searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}

// ==========================================================
// Bagian dinamis: baca ?q= (+ filter & urutan) dan ambil game
// ==========================================================
async function StoreContent({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";
  const harga: Harga | undefined =
    params.harga === "gratis" || params.harga === "berbayar"
      ? params.harga
      : undefined;
  const urut: Urut =
    URUTAN.find((u) => u.value === params.urut)?.value ?? "relevan";
  const jelajahi = params.jelajahi === "1";

  const games: GameRow[] = await prisma.game.findMany({
    where: keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: insensitive } },
            { developer: { name: { contains: keyword, mode: insensitive } } },
            {
              developer: {
                studioName: { contains: keyword, mode: insensitive },
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      createdAt: true,
      developer: { select: { name: true, studioName: true } },
      // jumlah pembelian sukses -> dipakai untuk "Sedang populer"
      _count: {
        select: { transactions: { where: { status: "SUCCESS" } } },
      },
    },
  });

  // ---------- Mode pencarian / jelajahi semua game ----------
  if (keyword || jelajahi) {
    return (
      <SearchResults
        games={games}
        keyword={keyword}
        jelajahi={jelajahi}
        harga={harga}
        urut={urut}
      />
    );
  }

  // ---------- Mode beranda ----------
  if (games.length === 0) {
    return (
      <>
        <UserGreeting />
        <div className="rounded-[14px] border border-dashed border-[#e4e6f0] bg-white p-10 text-center text-[13px] text-[#70758a]">
          Belum ada game yang dijual di toko ini.
        </div>
      </>
    );
  }

  const featured = games[0]; // game terbaru
  const populer = [...games]
    .sort((a, b) => b._count.transactions - a._count.transactions)
    .slice(0, 4);
  const idPopuler = new Set(populer.map((g) => g.id));
  const rekomendasi = games.filter((g) => !idPopuler.has(g.id)).slice(0, 3);

  return (
    <>
      <UserGreeting />

      {/* ===== Game pilihan (hero) ===== */}
      <section className="relative flex min-h-[280px] items-center overflow-hidden rounded-[18px] bg-[#120d30] p-6 sm:p-[30px]">
        <Artwork game={featured} className="absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(18,13,48,0.86)] via-[rgba(18,13,48,0.25)] via-55% to-[rgba(18,13,48,0)]" />

        <div className="relative flex max-w-[525px] flex-col gap-[15px] text-white">
          <div className="flex items-center gap-[7px]">
            <SparklesIcon size={14} />
            <span className="text-[10px] font-bold">GAME TERBARU</span>
          </div>
          <h2 className="text-[32px] font-bold leading-tight sm:text-[43px]">
            {featured.title}
          </h2>
          <p className="line-clamp-2 max-w-[420px] text-[13px] leading-[1.65]">
            {featured.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/game/${featured.id}`}
              className="flex h-[42px] items-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-[#6d4aff] px-[17px] text-[13px] font-semibold hover:bg-[#5b3be6]"
            >
              <ArrowRightIcon size={17} />
              Jelajahi game
            </Link>
            <span className="text-[11px]">
              {namaDeveloper(featured)} • {formatHarga(featured.price)}
            </span>
          </div>
        </div>
      </section>

      {/* ===== Kategori (belum ada kolom genre di database -> tampilan saja) ===== */}
      <div className="flex gap-[10px] overflow-x-auto">
        {[
          "Untukmu",
          "Aksi",
          "RPG",
          "Petualangan",
          "Simulasi",
          "Balapan",
          "Strategi",
          "Santai",
        ].map((kategori, i) => (
          <span
            key={kategori}
            className={`shrink-0 rounded-[8px] border border-[#e4e6f0] px-[18px] py-[10px] text-[11px] ${
              i === 0 ? "bg-[#6d4aff] font-semibold text-white" : "bg-white"
            }`}
          >
            {kategori}
          </span>
        ))}
      </div>

      {/* ===== Sedang populer ===== */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="Sedang populer" linkLabel="Lihat semua" />
        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {populer.map((game) => (
            <GameCard key={game.id} game={game} badge="Populer" />
          ))}
        </div>
      </section>

      {/* ===== Dipilih untukmu ===== */}
      {rekomendasi.length > 0 && (
        <section className="flex flex-col gap-[14px]">
          <SectionTitle title="Dipilih untukmu" linkLabel="Jelajahi rekomendasi" />
          <div className="grid gap-[18px] md:grid-cols-3">
            {rekomendasi.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="flex items-center gap-3 rounded-[14px] bg-white p-[11px] hover:shadow-md"
              >
                <Artwork
                  game={game}
                  className="h-[51px] w-[68px] shrink-0 rounded-[7px]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                  <span className="truncate text-[12px] font-semibold">
                    {game.title}
                  </span>
                  <span className="truncate text-[10px] text-[#70758a]">
                    {namaDeveloper(game)} • {formatHarga(game.price)}
                  </span>
                </div>
                <DownloadIcon size={17} className="shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ==========================================================
// Halaman hasil pencarian
// ==========================================================
function buildHref(state: {
  q: string;
  jelajahi?: boolean;
  harga?: Harga;
  urut?: Urut;
}) {
  const sp = new URLSearchParams();
  if (state.q) sp.set("q", state.q);
  else if (state.jelajahi) sp.set("jelajahi", "1");
  if (state.harga) sp.set("harga", state.harga);
  if (state.urut && state.urut !== "relevan") sp.set("urut", state.urut);
  const s = sp.toString();
  return s ? `/store?${s}` : "/store";
}

function urutkan(games: GameRow[], urut: Urut, keyword: string) {
  const arr = [...games];
  const kw = keyword.toLowerCase();
  const terbaru = (a: GameRow, b: GameRow) =>
    b.createdAt.getTime() - a.createdAt.getTime();

  switch (urut) {
    case "terbaru":
      return arr.sort(terbaru);
    case "populer":
      return arr.sort(
        (a, b) => b._count.transactions - a._count.transactions || terbaru(a, b),
      );
    case "termurah":
      return arr.sort((a, b) => a.price - b.price || terbaru(a, b));
    case "termahal":
      return arr.sort((a, b) => b.price - a.price || terbaru(a, b));
    default: {
      // relevan: judul diawali kata kunci > judul memuat kata kunci > cocok developer
      const skor = (g: GameRow) => {
        const t = g.title.toLowerCase();
        return t.startsWith(kw) ? 3 : t.includes(kw) ? 2 : 1;
      };
      return arr.sort((a, b) => skor(b) - skor(a) || terbaru(a, b));
    }
  }
}

function SearchResults({
  games,
  keyword,
  jelajahi,
  harga,
  urut,
}: {
  games: GameRow[];
  keyword: string;
  jelajahi: boolean;
  harga?: Harga;
  urut: Urut;
}) {
  const link = (patch: { harga?: Harga; urut?: Urut }) =>
    buildHref({ q: keyword, jelajahi, harga, urut, ...patch });

  const jumlahGratis = games.filter((g) => g.price === 0).length;
  const jumlahBerbayar = games.length - jumlahGratis;

  const disaring = games.filter((g) =>
    harga === "gratis" ? g.price === 0 : harga === "berbayar" ? g.price > 0 : true,
  );
  const hasil = urutkan(disaring, urut, keyword);

  // Label kecil di sampul: game terlaris -> "Populer", game paling baru -> "Baru"
  const maxTransaksi = Math.max(0, ...hasil.map((g) => g._count.transactions));
  const idTerbaru = [...hasil].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )[0]?.id;
  const badgeUntuk = (g: GameRow) =>
    maxTransaksi > 0 && g._count.transactions === maxTransaksi
      ? "Populer"
      : g.id === idTerbaru
        ? "Baru"
        : undefined;

  return (
    <>
      {/* ===== Judul halaman ===== */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#6d4aff]">TEMUKAN GAME</p>
        <h1 className="text-[24px] font-bold leading-tight sm:text-[30px]">
          {keyword ? <>Hasil pencarian “{keyword}”</> : "Jelajahi semua game"}
        </h1>
        <p className="text-[13px] text-[#70758a]">
          {hasil.length > 0
            ? `${hasil.length} game ditemukan. Petualangan berikutnya hanya sejauh satu klik.`
            : "Belum ada game yang cocok dengan pencarianmu."}
        </p>
      </div>

      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        {/* ===== Filter ===== */}
        <aside className="flex w-full shrink-0 flex-col gap-6 rounded-[14px] border border-[#e4e6f0] bg-white p-5 lg:w-[230px]">
          <div className="flex items-start justify-between">
            <p className="text-[15px]">Filter</p>
            <Link
              href={buildHref({ q: keyword, jelajahi })}
              className="text-[11px] hover:text-[#6d4aff]"
            >
              Reset
            </Link>
          </div>

          {/* Filter genre / rating / platform belum ada datanya di database,
              jadi yang tersedia baru filter harga. */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold">Harga</p>
            <FilterOption
              href={link({ harga: harga === "gratis" ? undefined : "gratis" })}
              label="Gratis"
              count={jumlahGratis}
              checked={harga === "gratis"}
            />
            <FilterOption
              href={link({
                harga: harga === "berbayar" ? undefined : "berbayar",
              })}
              label="Berbayar"
              count={jumlahBerbayar}
              checked={harga === "berbayar"}
            />
          </div>
        </aside>

        {/* ===== Daftar hasil ===== */}
        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-[10px]">
              {keyword && <Chip label={keyword} removeHref="/store" />}
              {harga && (
                <Chip
                  label={harga === "gratis" ? "Gratis" : "Berbayar"}
                  removeHref={link({ harga: undefined })}
                />
              )}
              <span className="text-[11px]">{hasil.length} hasil</span>
            </div>

            <SortMenu
              label={URUTAN.find((u) => u.value === urut)!.label}
              options={URUTAN.map((u) => ({
                label: u.label,
                href: link({ urut: u.value }),
                active: u.value === urut,
              }))}
            />
          </div>

          {hasil.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#e4e6f0] bg-white p-10 text-center text-[13px] text-[#70758a]">
              Tidak ada game yang cocok.
              <div className="mt-3">
                <Link
                  href={buildHref({ q: keyword, jelajahi })}
                  className="font-semibold text-[#6d4aff]"
                >
                  Hapus filter
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {hasil.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="group flex flex-col gap-3 rounded-[14px] border border-[#e4e6f0] bg-white p-[14px] hover:shadow-md"
                  >
                    <div className="relative h-[156px] overflow-hidden rounded-[12px]">
                      <Artwork
                        game={game}
                        className="size-full transition group-hover:scale-105"
                      />
                      {badgeUntuk(game) && (
                        <span className="absolute left-[10px] top-[10px] rounded-[5px] bg-white px-2 py-[5px] text-[9px] font-semibold">
                          {badgeUntuk(game)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <span className="truncate text-[14px] font-semibold">
                        {game.title}
                      </span>
                      <span className="truncate text-[11px]">
                        {namaDeveloper(game)}
                      </span>
                      <span className="text-[11px] font-semibold">
                        {formatHarga(game.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex items-start justify-center gap-2 text-center text-[11px]">
                <CircleCheckIcon size={14} className="mt-px shrink-0" />
                Kamu sudah melihat semua hasil. Coba kata kunci lain untuk lebih
                banyak game.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function FilterOption({
  href,
  label,
  count,
  checked,
}: {
  href: string;
  label: string;
  count: number;
  checked: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-[10px]">
      <span className="flex size-[15px] shrink-0 items-center justify-center rounded-[4px] border border-[#e4e6f0] bg-white text-[#6d4aff]">
        {checked && <CheckIcon size={11} />}
      </span>
      <span className="flex-1 text-[12px]">{label}</span>
      <span className="text-[10px]">{count}</span>
    </Link>
  );
}

function Chip({ label, removeHref }: { label: string; removeHref: string }) {
  return (
    <span className="flex items-center gap-[13px] rounded-[7px] bg-white px-3 py-[9px] text-[11px]">
      {label}
      <Link href={removeHref} aria-label={`Hapus filter ${label}`}>
        <XIcon size={13} />
      </Link>
    </span>
  );
}

// ==========================================================
// Potongan yang dipakai bersama
// ==========================================================
function SectionTitle({
  title,
  linkLabel,
}: {
  title: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[21px] font-semibold">{title}</h2>
      <Link
        href="/store?jelajahi=1"
        className="flex items-center gap-2 text-[12px] font-semibold text-[#6d4aff]"
      >
        {linkLabel}
        <ArrowRightIcon size={15} />
      </Link>
    </div>
  );
}

function GameCard({ game, badge }: { game: GameItem; badge?: string }) {
  return (
    <Link href={`/game/${game.id}`} className="group flex flex-col gap-3">
      <div className="relative h-[132px] overflow-hidden rounded-[12px]">
        <Artwork
          game={game}
          className="size-full transition group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-[10px] top-[10px] rounded-[5px] bg-white px-2 py-[5px] text-[9px] font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">
        <span className="truncate text-[14px] font-semibold">{game.title}</span>
        <span className="truncate text-[11px]">{namaDeveloper(game)}</span>
        <span className="text-[11px] font-semibold">
          {formatHarga(game.price)}
        </span>
      </div>
    </Link>
  );
}

// Tampilan sementara selagi data game dimuat
function StoreSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-[26px]">
      <div className="h-[280px] rounded-[18px] bg-[#e9eaf2]" />
      <div className="h-8 w-2/3 rounded bg-[#e9eaf2]" />
      <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[200px] rounded-[12px] bg-[#e9eaf2]" />
        ))}
      </div>
    </div>
  );
}
