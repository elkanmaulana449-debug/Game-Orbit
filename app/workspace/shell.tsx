// app/workspace/shell.tsx
// Kerangka halaman admin dan developer (sidebar kiri + bilah atas).
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { LoncengNotifikasi, PilihBahasa } from "@/app/components/bilah-atas";
import { CircleHelpIcon, LibraryBigIcon, LogoMark } from "@/app/store/icons";
import {
  ChartIcon,
  Gamepad2Icon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "@/app/components/icons-extra";
import { WorkspaceAvatar, WorkspaceUserMenu } from "./client";

const inter = Inter({ subsets: ["latin"] });

type Varian = "admin" | "developer";
type Ikon = (p: { size?: number; className?: string }) => ReactNode;

const MENU: Record<
  Varian,
  {
    judul: string;
    konteks: string;
    item: { kunci: string; href: string; label: string; icon: Ikon }[];
  }
> = {
  admin: {
    judul: "RUANG ADMIN",
    konteks: "Konsol admin",
    item: [
      { kunci: "persetujuan", href: "/admin", label: "Persetujuan developer", icon: UserCheckIcon },
      { kunci: "game", href: "/admin/game", label: "Data game", icon: LibraryBigIcon },
    ],
  },
  developer: {
    judul: "DEVELOPER HUB",
    konteks: "Portal developer",
    item: [
      { kunci: "ringkasan", href: "/dashboard", label: "Ringkasan", icon: LayoutDashboardIcon },
      { kunci: "game", href: "/dashboard/game", label: "Game saya", icon: Gamepad2Icon },
      { kunci: "analitik", href: "/dashboard/analitik", label: "Analitik", icon: ChartIcon },
    ],
  },
};

export function WorkspaceShell({
  varian,
  aktif,
  halaman,
  children,
}: {
  varian: Varian;
  aktif: string; // kunci menu yang sedang aktif
  halaman: string; // teks di jejak navigasi atas
  children: ReactNode;
}) {
  const menu = MENU[varian];
  return (
    <div className={`${inter.className} flex min-h-screen bg-[#f7f8fc] text-[#22243a]`}>
      <aside className="sticky top-0 hidden h-screen w-[216px] shrink-0 flex-col gap-[30px] overflow-hidden border-r border-[#e4e6f0] bg-white px-5 pb-6 pt-[29px] lg:flex">
        <Link href={varian === "admin" ? "/admin" : "/dashboard"} className="flex h-[34px] items-center gap-[9px]">
          <LogoMark size={34} />
          <span className="text-[20px] font-bold tracking-[-0.6px] text-[#26233d]">
            Game Orbit
          </span>
        </Link>

        <nav className="flex flex-col gap-[7px]">
          <p className="text-[10px] font-semibold text-[#70758a]">{menu.judul}</p>
          <div className="h-2" />
          {menu.item.map((m) => {
            const Ikon = m.icon;
            const nyala = m.kunci === aktif;
            return (
              <Link
                key={m.kunci}
                href={m.href}
                className={`flex min-h-11 items-center gap-3 rounded-[8px] px-3 py-1 text-[12px] ${
                  nyala
                    ? "bg-[#ede8ff] font-semibold text-[#6643d7]"
                    : "text-[#70758a] hover:bg-[#f5f6fa]"
                }`}
              >
                <Ikon size={19} className="shrink-0" />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-[17px]">
          <Link href="/bantuan" className="flex items-center gap-3 text-[12px]">
            <CircleHelpIcon size={18} />
            Pusat bantuan
          </Link>
          <div className="h-px bg-[#e9eaf2]" />
          <WorkspaceUserMenu />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[88px] shrink-0 items-center justify-between gap-4 border-b border-[#e4e6f0] bg-white px-4 sm:px-9">
          <div className="flex items-center gap-[9px] text-[12px]">
            <ShieldCheckIcon size={17} />
            <span>{menu.konteks}</span>
            <span>/</span>
            <span>{halaman}</span>
          </div>
          <div className="flex shrink-0 items-center gap-[22px]">
            <PilihBahasa />
            <LoncengNotifikasi />
            <div className="hidden h-[25px] w-px bg-[#e9eaf2] sm:block" />
            <WorkspaceAvatar />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-[26px] p-4 sm:p-9">{children}</main>
      </div>
    </div>
  );
}
