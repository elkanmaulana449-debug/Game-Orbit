// app/tombol-toko.tsx
// Tombol "Jelajahi toko" di halaman awal: harus login dulu.
// Kalau sudah login langsung ke toko, kalau belum diarahkan ke halaman login.
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TombolToko({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Link
      href="/login"
      className={className}
      onClick={(e) => {
        try {
          if (localStorage.getItem("user")) {
            e.preventDefault();
            router.push("/store");
          }
        } catch {
          // localStorage tidak bisa dibaca -> lanjut ke /login
        }
      }}
    >
      {children}
    </Link>
  );
}
