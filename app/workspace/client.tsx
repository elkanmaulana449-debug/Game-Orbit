// app/workspace/client.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoreUser } from "@/app/store/client-parts";
import { ChevronsUpDownIcon } from "@/app/store/icons";
import { Avatar } from "./ui";

// Pastikan yang membuka halaman ini punya peran yang sesuai.
// Mengembalikan data user kalau boleh, null selagi memeriksa / mengalihkan.
export function useWorkspaceUser(peran: string[]) {
  const router = useRouter();
  const user = useStoreUser();
  const boleh = !!user && peran.includes(user.role);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace("/login");
    else if (!boleh) {
      router.replace(
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "DEVELOPER"
            ? "/dashboard"
            : "/store",
      );
    }
  }, [user, boleh, router]);

  return boleh ? user : null;
}

function namaTampil(
  user: { name: string | null; studioName: string | null; role: string } | null | undefined,
) {
  if (!user) return "…";
  return user.role === "DEVELOPER"
    ? user.studioName || user.name || "Developer"
    : user.name || "Pengguna";
}

export function WorkspaceAvatar() {
  const user = useStoreUser();
  return <Avatar nama={namaTampil(user)} size={34} />;
}

// Profil di bawah sidebar: klik untuk buka menu (lihat toko / keluar)
export function WorkspaceUserMenu() {
  const router = useRouter();
  const user = useStoreUser();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setBuka(false);
    };
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  const keluar = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const peran =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "DEVELOPER"
        ? "Developer"
        : "Akun gamer";

  return (
    <div ref={ref} className="relative">
      {buka && (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-[10px] border border-[#e4e6f0] bg-white text-[12px] shadow-lg">
          <Link href="/store" className="block px-3 py-2.5 hover:bg-[#f5f6fa]">
            Lihat toko
          </Link>
          <button
            type="button"
            onClick={keluar}
            className="block w-full px-3 py-2.5 text-left text-[#c3475a] hover:bg-[#f5f6fa]"
          >
            Keluar
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={buka}
        className="flex w-full items-center gap-[10px] text-left"
      >
        <Avatar nama={namaTampil(user)} size={34} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[12px] font-semibold">
            {namaTampil(user)}
          </span>
          <span className="text-[10px] text-[#70758a]">{peran}</span>
        </div>
        <ChevronsUpDownIcon size={14} className="shrink-0" />
      </button>
    </div>
  );
}
