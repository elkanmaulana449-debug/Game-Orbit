// app/store/client-parts.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CompassIcon,
  HouseIcon,
  LibraryBigIcon,
  MessagesSquareIcon,
  SearchIcon,
} from "./icons";

// Data user disimpan di localStorage oleh halaman login: { id, name, role, studioName }
export type StoreUser = {
  id: string;
  name: string | null;
  role: string;
  studioName: string | null;
};

// undefined = masih membaca localStorage, null = belum login
export function useStoreUser() {
  const [user, setUser] = useState<StoreUser | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null); // data rusak -> anggap belum login
    }
  }, []);

  return user;
}

// Jumlah pesan personal yang belum dibaca (untuk angka di menu Chat)
function useUnread() {
  const user = useStoreUser();
  const [jumlah, setJumlah] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let batal = false;
    const muat = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(
          `/api/chat/conversations?me=${encodeURIComponent(userId)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!batal) setJumlah(data.totalUnread ?? 0);
      } catch {
        // abaikan, coba lagi di putaran berikutnya
      }
    };
    muat();
    const id = setInterval(muat, 15000);
    return () => {
      batal = true;
      clearInterval(id);
    };
  }, [userId]);

  return jumlah;
}

export function inisial(name?: string | null) {
  const kata = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "GO";
  return (kata[0][0] + (kata[1]?.[0] ?? "")).toUpperCase();
}

function labelRole(role?: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "DEVELOPER") return "Developer";
  return "Akun gamer";
}

// ---------- Sapaan di atas beranda ----------
export function UserGreeting() {
  const user = useStoreUser();
  const namaDepan = user?.name?.trim().split(/\s+/)[0] || "Gamer";

  return (
    <div className="flex flex-col gap-[7px]">
      <h1 className="text-[22px] font-bold leading-tight sm:text-[27px]">
        Petualangan apa hari ini, {namaDepan}?
      </h1>
      <p className="text-[12px]">
        Dunia baru, cerita baru. Temukan game favoritmu berikutnya.
      </p>
    </div>
  );
}

// ---------- Avatar bulat di bilah atas ----------
export function UserAvatar() {
  const user = useStoreUser();
  return (
    <Link
      href="/profil"
      aria-label="Buka profil"
      className="flex size-[34px] items-center justify-center rounded-full border border-[#e4e6f0] bg-[#ede8ff] text-[11px] font-bold hover:border-[#6d4aff]"
    >
      {inisial(user?.name)}
    </Link>
  );
}

// ---------- Profil di bawah sidebar: klik langsung ke halaman profil ----------
export function UserMenu() {
  const user = useStoreUser();

  return (
    <Link
      href="/profil"
      className="flex w-full items-center gap-[10px] rounded-[8px] text-left hover:opacity-80"
    >
      <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[#e4e6f0] bg-[#ede8ff] text-[11px] font-bold">
        {inisial(user?.name)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[12px] font-semibold">
          {user?.name || "Tamu"}
        </span>
        <span className="text-[10px] text-[#70758a]">{labelRole(user?.role)}</span>
      </div>
      <ChevronsUpDownIcon size={14} className="shrink-0" />
    </Link>
  );
}

// ---------- Menu navigasi sidebar ----------
// "Jelajahi" menyala saat sedang mencari (ada ?q=), selain itu "Beranda".
function NavItem({
  href,
  label,
  icon,
  active = false,
  badge = 0,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex h-11 items-center gap-3 rounded-[8px] px-3 text-[12px] ${
        active
          ? "bg-[#ede8ff] font-semibold text-[#6643d7]"
          : "bg-white hover:bg-[#f5f6fa]"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="text-[10px] font-normal">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

type MenuAktif = "beranda" | "jelajahi" | "koleksi" | "chat" | "none";

function NavList({ active }: { active: MenuAktif }) {
  const unread = useUnread();

  return (
    <nav className="flex flex-col gap-[7px]">
      <p className="text-[10px] font-semibold text-[#70758a]">TEMUKAN DUNIAMU</p>
      <div className="h-2" />
      <NavItem
        href="/store"
        label="Beranda"
        active={active === "beranda"}
        icon={<HouseIcon size={19} />}
      />
      <NavItem
        href="/store?jelajahi=1"
        label="Jelajahi"
        active={active === "jelajahi"}
        icon={<CompassIcon size={19} />}
      />
      <NavItem
        href="/koleksi"
        label="Koleksi saya"
        active={active === "koleksi"}
        icon={<LibraryBigIcon size={19} />}
      />
      <NavItem
        href="/chat"
        label="Chat"
        active={active === "chat"}
        badge={unread}
        icon={<MessagesSquareIcon size={19} />}
      />
    </nav>
  );
}

function NavByRoute() {
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q")?.trim();
  const jelajahi = params.get("jelajahi") === "1";

  if (pathname.startsWith("/chat")) return <NavList active="chat" />;
  if (pathname.startsWith("/koleksi")) return <NavList active="koleksi" />;
  if (pathname.startsWith("/profil")) return <NavList active="none" />;
  return <NavList active={q || jelajahi ? "jelajahi" : "beranda"} />;
}

export function SidebarNav() {
  // usePathname / useSearchParams hanya boleh dibaca di dalam <Suspense>.
  return (
    <Suspense fallback={<NavList active="none" />}>
      <NavByRoute />
    </Suspense>
  );
}

// ---------- Kolom pencarian (tekan Ctrl/Cmd + K untuk fokus) ----------
function SearchInput() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <input
      key={q}
      ref={ref}
      type="search"
      name="q"
      defaultValue={q}
      placeholder="Cari game, genre, atau developer"
      className="min-w-0 flex-1 bg-transparent text-[12px] placeholder:text-[#22243a] focus:outline-none"
    />
  );
}

export function SearchBox() {
  return (
    <Form
      action="/store"
      className="flex h-[42px] w-full max-w-[520px] items-center gap-3 rounded-[8px] bg-[#f5f6fa] px-[15px]"
    >
      <SearchIcon size={18} className="shrink-0" />
      <Suspense
        fallback={
          <input
            type="search"
            name="q"
            placeholder="Cari game, genre, atau developer"
            className="min-w-0 flex-1 bg-transparent text-[12px] placeholder:text-[#22243a] focus:outline-none"
          />
        }
      >
        <SearchInput />
      </Suspense>
      <span className="hidden shrink-0 text-[10px] text-[#70758a] sm:block">
        Ctrl K
      </span>
    </Form>
  );
}

// ---------- Tombol "Urutkan: ..." di halaman hasil pencarian ----------
export function SortMenu({
  label,
  options,
}: {
  label: string;
  options: { label: string; href: string; active: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tutupBilaKlikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", tutupBilaKlikLuar);
    return () => document.removeEventListener("mousedown", tutupBilaKlikLuar);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-white px-[17px] text-[13px] font-semibold"
      >
        <ChevronDownIcon size={17} />
        Urutkan: {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-full min-w-[220px] overflow-hidden rounded-[10px] border border-[#e4e6f0] bg-white text-[12px] shadow-lg">
          {options.map((opt) => (
            <Link
              key={opt.label}
              href={opt.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 hover:bg-[#f5f6fa] ${
                opt.active ? "font-semibold text-[#6643d7]" : ""
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
