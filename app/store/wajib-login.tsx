// app/store/wajib-login.tsx
// Halaman user (toko, chat, profil, koleksi, detail game) hanya untuk yang sudah login.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoreUser } from "./client-parts";

export function WajibLogin() {
  const router = useRouter();
  const user = useStoreUser();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  return null;
}
