"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      alert("Login Berhasil! Selamat datang.");
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/store");
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
        onSubmit={handleLogin}
        className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur"
      >
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-3xl font-extrabold text-transparent">
            GameOrbit
          </h1>
          <p className="mt-1 text-sm text-slate-400">Masuk untuk lanjut main 🎮</p>
        </div>

        <div className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-cyan-400 hover:underline">
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}