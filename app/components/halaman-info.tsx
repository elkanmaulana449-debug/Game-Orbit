// Kerangka halaman publik (bantuan, privasi, syarat, lupa sandi) — bisa dibuka tanpa login.
import Link from "next/link";
import { Inter } from "next/font/google";
import { LogoMark } from "@/app/store/icons";

const inter = Inter({ subsets: ["latin"] });

export function HalamanInfo({
  judul, deskripsi, children,
}: { judul: string; deskripsi?: string; children: React.ReactNode }) {
  return (
    <div className={`${inter.className} flex min-h-screen flex-col bg-[#f7f8fc] text-[#22243a]`}>
      <header className="flex h-[72px] items-center justify-between border-b border-[#e4e6f0] bg-white px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-[9px]">
          <LogoMark size={30} />
          <span className="text-[18px] font-bold tracking-[-0.6px] text-[#26233d]">Game Orbit</span>
        </Link>
        <Link href="/login" className="rounded-[8px] px-4 py-2 text-[13px] font-semibold hover:bg-[#f5f6fa]">Masuk</Link>
      </header>
      <main className="mx-auto w-full max-w-[760px] flex-1 px-6 py-10">
        <h1 className="text-[28px] font-extrabold tracking-[-0.8px]">{judul}</h1>
        {deskripsi && <p className="mt-2 text-[13px] leading-6 text-[#70758a]">{deskripsi}</p>}
        <div className="mt-8">{children}</div>
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#e4e6f0] bg-white px-6 py-5 text-[11px] text-[#70758a]">
        <Link href="/bantuan" className="hover:text-[#6d4aff]">Pusat bantuan</Link>
        <Link href="/privasi" className="hover:text-[#6d4aff]">Kebijakan privasi</Link>
        <Link href="/syarat" className="hover:text-[#6d4aff]">Syarat layanan</Link>
        <span>Game Orbit • Dibuat untuk para pemain.</span>
      </footer>
    </div>
  );
}

export function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-[16px] font-bold">{judul}</h2>
      <div className="mt-2 space-y-2 text-[13px] leading-7 text-[#555970]">{children}</div>
    </section>
  );
}
