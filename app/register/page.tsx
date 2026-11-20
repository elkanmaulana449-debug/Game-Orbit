// app/register/page.tsx — Registrasi user dan developer
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@/app/store/icons";
import {
  Clock3Icon,
  Code2Icon,
  Gamepad2Icon,
  MailIcon,
  UserRoundIcon,
} from "@/app/components/icons-extra";
import { AuthLayout } from "@/app/auth/auth-layout";
import { Isian, IsianSandi } from "@/app/auth/fields";
import { useHeroAuth } from "@/app/auth/use-hero";

type Peran = "USER" | "DEVELOPER";

export default function Register() {
  const [role, setRole] = useState<Peran>("DEVELOPER");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [loading, setLoading] = useState(false);
  const [galat, setGalat] = useState("");
  const gambarHero = useHeroAuth("register", "/auth/register-hero.jpg");
  const [selesai, setSelesai] = useState("");

  const handleDaftar = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setGalat("");

    if (password !== konfirmasi) {
      setGalat("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!setuju) {
      setGalat("Setujui Syarat Layanan dan Kebijakan Privasi dulu ya.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: nama,
          studioName: role === "DEVELOPER" ? nama : null,
          email,
          password,
          role,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setGalat(data.pesan || "Pendaftaran gagal. Coba lagi.");
        return;
      }
      setSelesai(data.pesan || "Berhasil daftar!");
    } catch (error) {
      console.error("ERROR_REGISTER", error);
      setGalat("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const peranKartu: { nilai: Peran; judul: string; desc: string; icon: React.ReactNode }[] = [
    { nilai: "USER", judul: "User", desc: "Temukan & mainkan game", icon: <Gamepad2Icon size={20} /> },
    { nilai: "DEVELOPER", judul: "Developer", desc: "Ciptakan & bagikan game", icon: <Code2Icon size={20} /> },
  ];

  return (
    <AuthLayout
      gambar={gambarHero}
      judul={
        <>
          Jadilah bagian dari
          <br />
          cerita berikutnya.
        </>
      }
      teks="“Ready to explore the unknown? Create your Orbit account and get ready to embark on an exciting journey across the universe"
    >
      <div className="flex items-start justify-between text-[12px]">
        <span>Sudah punya akun?</span>
        <Link href="/login" className="font-semibold text-[#6d4aff]">
          Masuk ↗
        </Link>
      </div>

      {selesai ? (
        <div className="mx-auto flex w-full max-w-[512px] flex-1 flex-col justify-center gap-5 py-10">
          <span className="flex size-12 items-center justify-center rounded-[12px] bg-[#e6f7ee] text-[#168355]">
            <CheckIcon size={24} />
          </span>
          <h1 className="text-[28px] font-bold leading-tight">Pendaftaran berhasil</h1>
          <p className="text-[13px] leading-[1.7] text-[#70758a]">{selesai}</p>
          <Link
            href="/login"
            className="flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] bg-[#6d4aff] text-[13px] font-semibold text-white hover:bg-[#5b3be6]"
          >
            Ke halaman masuk <ArrowRightIcon size={16} />
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleDaftar}
          className="mx-auto flex w-full max-w-[512px] flex-1 flex-col justify-center gap-[21px] py-8"
        >
          <div className="flex flex-col gap-[11px]">
            <p className="text-[10px] font-bold text-[#6d4aff]">MULAI PERJALANANMU</p>
            <h1 className="text-[28px] font-bold leading-tight sm:text-[34px]">
              Your Adventure Begins Here!
            </h1>
            <p className="text-[13px] text-[#70758a]">
              Pilih caramu menjadi bagian dari permainan.
            </p>
          </div>

          <div className="flex gap-3" role="radiogroup" aria-label="Pilih peran">
            {peranKartu.map((p) => (
              <button
                key={p.nilai}
                type="button"
                role="radio"
                aria-checked={role === p.nilai}
                onClick={() => setRole(p.nilai)}
                className={`flex h-[76px] min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-[#e4e6f0] p-[14px] text-left ${
                  role === p.nilai ? "bg-[#ede8ff]" : "bg-white hover:bg-[#faf9ff]"
                }`}
              >
                <span className="shrink-0">{p.icon}</span>
                <span className="flex min-w-0 flex-col gap-[5px]">
                  <span className="text-[13px] font-semibold">{p.judul}</span>
                  <span className="truncate text-[9px] text-[#70758a]">{p.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <Isian
            label="Nama studio / nama lengkap"
            icon={<UserRoundIcon size={18} />}
            value={nama}
            onChange={setNama}
            placeholder={role === "DEVELOPER" ? "Nama studio kamu" : "Nama lengkap kamu"}
            autoComplete="name"
          />
          <Isian
            label="Alamat email"
            icon={<MailIcon size={18} />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nama@email.com"
            autoComplete="email"
          />
          <div className="flex flex-col gap-[14px] sm:flex-row">
            <IsianSandi
              label="Kata sandi"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />
            <IsianSandi
              label="Konfirmasi kata sandi"
              value={konfirmasi}
              onChange={setKonfirmasi}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />
          </div>

          {role === "DEVELOPER" && (
            <div className="flex items-start gap-[11px] rounded-[14px] bg-[#f1eeff] p-[15px]">
              <Clock3Icon size={18} className="mt-px shrink-0" />
              <div className="flex min-w-0 flex-col gap-[6px]">
                <p className="text-[12px] font-semibold">Akun developer perlu persetujuan admin</p>
                <p className="text-[11px] leading-[1.6] text-[#70758a]">
                  Setelah mendaftar, status akunmu Menunggu persetujuan. Kamu baru bisa masuk
                  setelah admin menyetujui pengajuanmu.
                </p>
              </div>
            </div>
          )}

          <label className="flex items-center gap-[10px] text-[11px] leading-[1.7]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              className="size-4 shrink-0 accent-[#6d4aff]"
            />
            <span>Saya menyetujui <Link href="/syarat" target="_blank" className="text-[#6d4aff] underline">Syarat Layanan</Link> dan <Link href="/privasi" target="_blank" className="text-[#6d4aff] underline">Kebijakan Privasi</Link> Game Orbit.</span>
          </label>

          {galat && (
            <p role="alert" className="rounded-[8px] bg-[#fff0f1] px-3 py-2.5 text-[12px] text-[#c3475a]">
              {galat}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-[#6d4aff] px-[17px] text-[13px] font-semibold text-white hover:bg-[#5b3be6] disabled:opacity-60"
          >
            <ArrowRightIcon size={17} />
            {loading
              ? "Memproses..."
              : role === "DEVELOPER"
                ? "Daftar sebagai developer"
                : "Daftar sebagai user"}
          </button>

          {role === "DEVELOPER" && (
            <div className="flex items-start justify-between pt-1 text-[10px]">
              <span className="font-semibold text-[#6d4aff]">01  Buat akun</span>
              <span>02  Verifikasi admin</span>
              <span>03  Mulai berkarya</span>
            </div>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
