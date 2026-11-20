// app/page.tsx — Halaman awal (sebelum login)
import Link from "next/link";
import { Inter } from "next/font/google";
import { TombolToko } from "@/app/tombol-toko";
import { ArrowRightIcon, LogoMark, MessagesSquareIcon, LibraryBigIcon, CompassIcon } from "@/app/store/icons";

const inter = Inter({ subsets: ["latin"] });

const FITUR = [
  {
    icon: <CompassIcon size={22} />,
    judul: "Temukan game indie",
    teks: "Jelajahi katalog game dari developer independen, cari berdasarkan genre, harga, atau nama studio.",
  },
  {
    icon: <LibraryBigIcon size={22} />,
    judul: "Koleksi milikmu",
    teks: "Game yang kamu beli atau tambahkan tersimpan rapi di koleksi, siap dibuka kapan saja.",
  },
  {
    icon: <MessagesSquareIcon size={22} />,
    judul: "Komunitas pemain",
    teks: "Ngobrol di chat global atau kirim pesan langsung ke pemain dan developer lain.",
  },
];

export default function LandingPage() {
  return (
    <div className={`${inter.className} flex min-h-screen flex-col bg-[#f7f8fc] text-[#22243a]`}>
      <header className="flex h-[88px] items-center justify-between border-b border-[#e4e6f0] bg-white px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-[9px]">
          <LogoMark size={34} />
          <span className="text-[20px] font-bold tracking-[-0.6px] text-[#26233d]">Game Orbit</span>
        </Link>
        <nav className="flex items-center gap-3 text-[13px] font-semibold">
          <Link href="/login" className="rounded-[8px] px-4 py-2.5 hover:bg-[#f5f6fa]">
            Masuk
          </Link>
          <Link href="/register" className="rounded-[8px] bg-[#6d4aff] px-4 py-2.5 text-white hover:bg-[#5b3be6]">
            Daftar
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center gap-6 bg-[#f0ecff] px-6 py-20 text-center sm:py-28">
          <p className="text-[10px] font-bold tracking-wide text-[#6d4aff]">PLATFORM GAME INDIE</p>
          <h1 className="max-w-[760px] text-[36px] font-bold leading-[1.1] sm:text-[56px]">
            Temukan game impianmu, atau jual karyamu sendiri.
          </h1>
          <p className="max-w-[560px] text-[14px] leading-[1.7] text-[#70758a]">
            Game Orbit mempertemukan pemain dengan developer indie. Jelajahi dunia baru, kumpulkan
            game favorit, dan bagikan karyamu ke lebih banyak orang.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <TombolToko className="flex h-[50px] items-center gap-2 rounded-[10px] bg-[#6d4aff] px-6 text-[14px] font-bold text-white hover:bg-[#5b3be6]">
              Jelajahi toko <ArrowRightIcon size={16} />
            </TombolToko>
            <Link
              href="/register"
              className="flex h-[50px] items-center rounded-[10px] border border-[#e4e6f0] bg-white px-6 text-[14px] font-bold hover:bg-[#f5f6fa]"
            >
              Buat akun gratis
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1100px] gap-5 px-6 py-16 sm:grid-cols-3">
          {FITUR.map((f) => (
            <div key={f.judul} className="flex flex-col gap-3 rounded-[14px] border border-[#e4e6f0] bg-white p-6">
              <span className="flex size-11 items-center justify-center rounded-[12px] bg-[#ede8ff] text-[#6d4aff]">
                {f.icon}
              </span>
              <h2 className="text-[16px] font-semibold">{f.judul}</h2>
              <p className="text-[12px] leading-[1.7] text-[#70758a]">{f.teks}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#e4e6f0] bg-white px-6 py-6 text-center text-[11px] text-[#70758a] sm:px-12">
        <div className="mb-2 flex justify-center gap-6">
          <Link href="/bantuan" className="hover:text-[#6d4aff]">Pusat bantuan</Link>
          <Link href="/privasi" className="hover:text-[#6d4aff]">Kebijakan privasi</Link>
          <Link href="/syarat" className="hover:text-[#6d4aff]">Syarat layanan</Link>
        </div>
        Game Orbit • Dibuat untuk para pemain.
      </footer>
    </div>
  );
}
