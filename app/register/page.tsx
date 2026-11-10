// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  // State untuk nyimpen inputan
  const [role, setRole] = useState("USER"); // Default-nya User
  const [name, setName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cek konfirmasi password untuk SEMUA role (User & Developer)
    if (password !== konfirmasiPassword) {
      alert("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    // Tembak ke API
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        name: role === "DEVELOPER" ? studioName : name, 
        studioName: role === "DEVELOPER" ? studioName : null,
        email: email,
        password: password,
        role: role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.pesan);
      router.push("/login");
    } else {
      alert(data.pesan);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Glow background */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <form
        onSubmit={handleDaftar}
        className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur"
      >
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-3xl font-extrabold text-transparent">
            GameOrbit
          </h1>
          <p className="mt-1 text-sm text-slate-400">Buat akun baru</p>
        </div>

        <div className="space-y-4">
          {/* Pilihan Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="USER">User (Pembeli)</option>
            <option value="DEVELOPER">Penjual (Developer)</option>
          </select>

          {/* KONDISIONAL: Kalau Developer, minta Nama Studio. Kalau User, minta Nama Lengkap */}
          {role === "DEVELOPER" ? (
            <input
              type="text"
              placeholder="Nama Studio / Pengembang"
              required
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            />
          ) : (
            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />
          
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />

          {/* KONFIRMASI PASSWORD (Sekarang muncul untuk User & Developer) */}
          <input
            type="password"
            placeholder="Konfirmasi Password"
            required
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-90"
          >
            Daftar Sekarang
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Udah punya akun?{" "}
          <Link href="/login" className="font-medium text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}