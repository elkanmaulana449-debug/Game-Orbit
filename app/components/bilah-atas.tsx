"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@/app/store/icons";

type Item = { id: string; judul: string; isi: string; href: string; waktu: string };

function useTutupLuar(tutup: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const klik = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) tutup();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && tutup();
    document.addEventListener("mousedown", klik);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", klik);
      document.removeEventListener("keydown", esc);
    };
  }, [tutup]);
  return ref;
}

function lalu(iso: string) {
  const menit = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  if (menit < 1440) return `${Math.floor(menit / 60)} jam lalu`;
  return `${Math.floor(menit / 1440)} hari lalu`;
}

export function LoncengNotifikasi() {
  const [buka, setBuka] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [muat, setMuat] = useState(false);
  const [dilihat, setDilihat] = useState<string[]>([]);
  const [aktif, setAktif] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const ref = useTutupLuar(() => setBuka(false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      /* eslint-disable react-hooks/set-state-in-effect */
      if (raw) setUserId(JSON.parse(raw).id ?? null);
      setAktif(localStorage.getItem("game-orbit-notif") !== "off");
      setDilihat(JSON.parse(localStorage.getItem("game-orbit-notif-dilihat") || "[]"));
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    if (!userId || !aktif) return;
    let batal = false;
    const ambil = () => {
      setMuat(true);
      fetch(`/api/notifikasi?me=${encodeURIComponent(userId)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => !batal && setItems(d.items ?? []))
        .catch(() => undefined)
        .finally(() => !batal && setMuat(false));
    };
    ambil();
    const timer = setInterval(ambil, 60000);
    return () => {
      batal = true;
      clearInterval(timer);
    };
  }, [userId, aktif]);

  const belumDilihat = items.filter((i) => !dilihat.includes(i.id));

  const tandai = () => {
    const semua = items.map((i) => i.id);
    setDilihat(semua);
    try {
      localStorage.setItem("game-orbit-notif-dilihat", JSON.stringify(semua));
    } catch {
      /* abaikan */
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Notifikasi" aria-expanded={buka} onClick={() => setBuka((v) => !v)} className="relative">
        <BellIcon size={20} />
        {aktif && belumDilihat.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-[#e5484d] text-[9px] font-bold text-white">
            {belumDilihat.length > 9 ? "9+" : belumDilihat.length}
          </span>
        )}
      </button>
      {buka && (
        <div className="absolute right-0 top-9 z-40 w-[320px] overflow-hidden rounded-xl border border-[#e4e6f0] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#eef0f6] px-4 py-3">
            <span className="text-[13px] font-semibold">Notifikasi</span>
            {aktif && items.length > 0 && <button onClick={tandai} className="text-[11px] text-[#6d4aff] hover:underline">Tandai dibaca</button>}
          </div>
          <div className="max-h-[340px] overflow-y-auto">
            {!userId ? (
              <p className="p-4 text-[12px] text-[#70758a]">Masuk untuk melihat notifikasi.</p>
            ) : !aktif ? (
              <p className="p-4 text-[12px] text-[#70758a]">Notifikasi dimatikan. Aktifkan lagi di <Link href="/profil" className="text-[#6d4aff]">Profil</Link>.</p>
            ) : muat && items.length === 0 ? (
              <p className="p-4 text-[12px] text-[#70758a]">Memuat...</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-[12px] text-[#70758a]">Belum ada notifikasi baru.</p>
            ) : (
              items.map((i) => (
                <Link key={i.id} href={i.href} onClick={() => setBuka(false)} className={`block border-b border-[#f1f2f7] px-4 py-3 hover:bg-[#f8f7ff] ${dilihat.includes(i.id) ? "" : "bg-[#fbfaff]"}`}>
                  <p className="text-[12px] font-semibold">{i.judul}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#70758a]">{i.isi}</p>
                  <p className="mt-1 text-[10px] text-[#9a9db0]">{lalu(i.waktu)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PilihBahasa() {
  const [buka, setBuka] = useState(false);
  const ref = useTutupLuar(() => setBuka(false));
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button type="button" onClick={() => setBuka((v) => !v)} aria-expanded={buka} className="text-[11px] text-[#70758a] hover:text-[#22243a]">
        ID ⌄
      </button>
      {buka && (
        <div className="absolute right-0 top-7 z-40 w-[190px] rounded-xl border border-[#e4e6f0] bg-white p-1.5 text-[12px] shadow-xl">
          <button onClick={() => setBuka(false)} className="flex w-full items-center justify-between rounded-lg bg-[#f0ecff] px-3 py-2 font-semibold text-[#6743dc]">
            Indonesia <span>✓</span>
          </button>
          <p className="px-3 py-2 text-[#9a9db0]">English — segera hadir</p>
        </div>
      )}
    </div>
  );
}
