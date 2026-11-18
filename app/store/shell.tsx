// app/store/shell.tsx
// Kerangka halaman user (sidebar kiri + bilah atas) yang dipakai bersama
// oleh halaman store dan halaman chat.
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { BellIcon, CircleHelpIcon, LogoMark, RadioIcon } from "./icons";
import { SearchBox, SidebarNav, UserAvatar, UserMenu } from "./client-parts";

const inter = Inter({ subsets: ["latin"] });

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} flex min-h-screen bg-[#f7f8fc] text-[#22243a]`}
    >
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===== Bilah atas ===== */}
        <header className="flex h-[88px] shrink-0 items-center justify-between gap-4 border-b border-[#e4e6f0] bg-white px-4 sm:px-9">
          <SearchBox />
          <div className="flex shrink-0 items-center gap-[22px]">
            <span className="hidden text-[11px] text-[#70758a] sm:block">
              ID ⌄
            </span>
            <button type="button" aria-label="Notifikasi">
              <BellIcon size={20} />
            </button>
            <div className="hidden h-[25px] w-px bg-[#e9eaf2] sm:block" />
            <UserAvatar />
          </div>
        </header>

        {/* ===== Konten ===== */}
        <main className="flex flex-1 flex-col gap-[26px] p-4 sm:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}

// ---------- Sidebar kiri ----------
function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[216px] shrink-0 flex-col gap-[30px] overflow-hidden border-r border-[#e4e6f0] bg-white px-5 pb-6 pt-[29px] lg:flex">
      <Link href="/store" className="flex h-[34px] items-center gap-[9px]">
        <LogoMark size={34} />
        <span className="text-[20px] font-bold tracking-[-0.6px] text-[#26233d]">
          Game Orbit
        </span>
      </Link>

      <SidebarNav />

      <div className="flex flex-col gap-3 rounded-[14px] bg-[#f0ecff] p-[15px]">
        <RadioIcon size={20} />
        <p className="text-[13px] font-semibold">Main bareng, lebih seru.</p>
        <p className="text-[11px] leading-[1.6]">
          Temukan teman baru di komunitas Game Orbit.
        </p>
        <Link href="/chat" className="text-[11px] font-semibold text-[#6d4aff]">
          Buka chat global ↗
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-[17px]">
        <Link href="#" className="flex items-center gap-3 text-[12px]">
          <CircleHelpIcon size={18} />
          Pusat bantuan
        </Link>
        <div className="h-px bg-[#e9eaf2]" />
        <UserMenu />
      </div>
    </aside>
  );
}
