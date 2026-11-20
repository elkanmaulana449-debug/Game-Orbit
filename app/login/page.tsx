// app/login/page.tsx — Login bersama (user, developer, admin)
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, LockKeyholeIcon } from "@/app/store/icons";
import { MailIcon } from "@/app/components/icons-extra";
import { AuthLayout } from "@/app/auth/auth-layout";
import { Isian, IsianSandi } from "@/app/auth/fields";
import { useHeroAuth } from "@/app/auth/use-hero";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [galat, setGalat] = useState("");
  const [ingat, setIngat] = useState(false);
  const gambarHero = useHeroAuth("login", "/auth/login-hero.jpg");

  // "Ingat saya": isi email otomatis dari login sebelumnya.
  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("game-orbit-email");
      if (tersimpan) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(tersimpan);
        setIngat(true);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setGalat("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setGalat(data.pesan || "Login gagal. Periksa koneksi dan coba lagi.");
        return;
      }
      if (!data.user?.id || !data.user?.role) {
        setGalat("Data akun dari server tidak lengkap. Coba login kembali.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      if (ingat) localStorage.setItem("game-orbit-email", email.trim());
      else localStorage.removeItem("game-orbit-email");
      const tujuan =
        data.user.role === "DEVELOPER"
          ? "/dashboard"
          : data.user.role === "ADMIN"
            ? "/admin"
            : "/store";
      window.location.assign(tujuan);
    } catch (error) {
      console.error("ERROR_LOGIN", error);
      setGalat("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      gambar={gambarHero}
      judul="Siap Menjelajahi Dunia Bersama Teman-Teman?"
      teks="Your journey through the universe starts here. Log in to continue your adventure and explore the endless possibilities of Orbit"
      keterangan={
        <p className="flex items-center gap-[10px] text-[#e8e2fa]">
          <span className="text-[12px] font-semibold">Kelompok 5</span>
          <span className="text-[11px]">bersama Pak Raffy</span>
        </p>
      }
    >
      <div className="flex items-center justify-between text-[12px]">
        <span>Belum punya akun?</span>
        <Link href="/register" className="font-semibold">
          Register ↗
        </Link>
      </div>

      <form
        onSubmit={handleLogin}
        className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center gap-7 py-10"
      >
        <div className="flex flex-col gap-[13px]">
          <p className="text-[10px] font-bold text-[#6d4aff]">
            Welcome back our gamers &lt;33
          </p>
          <h1 className="text-[32px] font-bold leading-tight sm:text-[37px]">
            Welcome Back, Explorer !
          </h1>
          <p className="text-[13px] leading-[1.7] text-[#70758a]">Mari jelajahi dunia!</p>
        </div>

        <div className="flex flex-col gap-[21px]">
          <Isian
            label="Alamat email"
            icon={<MailIcon size={18} />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nama@email.com"
            autoComplete="email"
          />
          <div className="flex">
            <IsianSandi
              label="Kata sandi"
              icon={<LockKeyholeIcon size={18} />}
              value={password}
              onChange={setPassword}
              placeholder="Shhttt...."
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ingat} onChange={(e) => setIngat(e.target.checked)} className="size-[15px] accent-[#6d4aff]" />
              Ingat saya
            </label>
            <Link href="/lupa-sandi" className="text-[#6d4aff]">
              Lupa kata sandi?
            </Link>
          </div>
        </div>

        {galat && (
          <p role="alert" className="rounded-[8px] bg-[#fff0f1] px-3 py-2.5 text-[12px] text-[#c3475a]">
            {galat}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-[50px] items-center justify-center gap-2 rounded-[10px] bg-[#6d4aff] text-[14px] font-bold text-white hover:bg-[#5b3be6] disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk ke Game Orbit"}
          {!loading && <ArrowRightIcon size={16} />}
        </button>
      </form>

      <div className="flex items-center justify-between text-[10px] text-[#70758a]">
        <Link href="/privasi">Kebijakan privasi</Link>
        <Link href="/bantuan">Butuh bantuan? Hubungi kami</Link>
      </div>
    </AuthLayout>
  );
}
