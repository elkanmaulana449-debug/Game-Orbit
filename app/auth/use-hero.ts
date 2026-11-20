"use client";

import { useEffect, useState } from "react";

// Mengembalikan gambar hero dari game terbaru; sebelum data datang / kalau belum ada game, pakai file bawaan.
export function useHeroAuth(halaman: "login" | "register", bawaan: string) {
  const [gambar, setGambar] = useState(bawaan);
  useEffect(() => {
    let batal = false;
    fetch("/api/auth-hero", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!batal && typeof d[halaman] === "string" && d[halaman]) setGambar(d[halaman]);
      })
      .catch(() => undefined);
    return () => {
      batal = true;
    };
  }, [halaman]);
  return gambar;
}
