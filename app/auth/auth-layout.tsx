// app/auth/auth-layout.tsx
// Kerangka halaman login & registrasi: panel cerita merek (kiri) + panel formulir (kanan).
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { LogoMark } from "@/app/store/icons";

const inter = Inter({ subsets: ["latin"] });

export function AuthLayout({
  gambar,
  judul,
  teks,
  keterangan,
  children,
}: {
  gambar: string; // contoh: "/auth/login-hero.jpg" (taruh file di folder public)
  judul: ReactNode;
  teks: string;
  keterangan?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${inter.className} flex min-h-screen bg-[#f7f8fc] text-[#22243a]`}>
      {/* Panel cerita merek */}
      <div
        className="relative hidden min-h-screen w-1/2 shrink-0 flex-col justify-end overflow-hidden p-14 lg:flex"
        style={{
          // Kalau file gambar belum ada, gradasi ungu di bawahnya yang tampil.
          backgroundImage: `url("${gambar}"), linear-gradient(135deg, #6d4aff 0%, #3b2a8f 55%, #211844 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(33,24,68,0)] via-[rgba(33,24,68,0.06)] to-[rgba(33,24,68,0.88)]" />
        <Link
          href="/"
          className="absolute left-12 top-11 flex h-[54px] items-center gap-[10px] rounded-[16px] bg-white pl-[14px] pr-5"
        >
          <LogoMark size={36} />
          <span className="text-[22px] font-bold text-[#26233d]">Game Orbit</span>
        </Link>
        <div className="relative flex max-w-[600px] flex-col gap-[22px] text-white">
          <h2 className="text-[49px] font-bold leading-[1.08]">{judul}</h2>
          <p className="max-w-[445px] text-[14px] leading-[1.7] text-[#e8e2fa]">{teks}</p>
          {keterangan}
        </div>
      </div>

      {/* Panel formulir */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white px-6 py-8 sm:px-16 lg:px-[104px]">
        {children}
      </div>
    </div>
  );
}
