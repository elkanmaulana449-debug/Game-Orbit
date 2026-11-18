// app/chat/chat-parts.tsx
// Potongan kecil yang dipakai halaman chat: tipe data, fetch helper, avatar,
// balon pesan, kolom tulis pesan, dan kartu profil.
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { inisial } from "@/app/store/client-parts";
import {
  CheckCheckIcon,
  MessagesSquareIcon,
  SendIcon,
} from "@/app/store/icons";

// ---------- Tipe data (sesuai balasan API) ----------
export type UserLite = {
  id: string;
  name: string;
  role: string;
  studioName: string | null;
  online: boolean;
  lastSeenAt: string | null;
};

export type GlobalMsg = {
  id: string;
  content: string;
  createdAt: string;
  sender: UserLite;
};

export type PersonalMsg = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
};

export type Conversation = {
  user: UserLite;
  lastMessage: { content: string; createdAt: string; dariSaya: boolean } | null;
  unread: number;
};

// ---------- Fetch helper ----------
export async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Jalankan fungsi tiap `ms` milidetik (dilewati saat tab sedang tidak dilihat)
export function useInterval(cb: () => void, ms: number) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") ref.current();
    }, ms);
    return () => clearInterval(id);
  }, [ms]);
}

// Gulir otomatis ke pesan terbaru (kecuali user sedang membaca pesan lama)
export function useGulirKeBawah(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const dekat = useRef(true);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    dekat.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    const el = ref.current;
    if (el && dekat.current) el.scrollTop = el.scrollHeight;
  }, [dep]);

  return { ref, onScroll };
}

// ---------- Format waktu ----------
function samaHari(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function jam(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");
}

// Waktu singkat di daftar percakapan: jam / "Kemarin" / tanggal
export function waktuRingkas(iso: string) {
  const d = new Date(iso);
  const sekarang = new Date();
  if (samaHari(d, sekarang)) return jam(iso);
  const kemarin = new Date(sekarang);
  kemarin.setDate(kemarin.getDate() - 1);
  if (samaHari(d, kemarin)) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function labelHari(iso: string) {
  const d = new Date(iso);
  const sekarang = new Date();
  const tgl = d
    .toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
  if (samaHari(d, sekarang)) return `HARI INI, ${tgl}`;
  const kemarin = new Date(sekarang);
  kemarin.setDate(kemarin.getDate() - 1);
  if (samaHari(d, kemarin)) return `KEMARIN, ${tgl}`;
  return tgl;
}

// Kelompokkan pesan per hari supaya bisa diberi pemisah tanggal
export function kelompokkanHari<T extends { createdAt: string }>(items: T[]) {
  const hasil: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const label = labelHari(item.createdAt);
    const terakhir = hasil[hasil.length - 1];
    if (terakhir && terakhir.label === label) terakhir.items.push(item);
    else hasil.push({ label, items: [item] });
  }
  return hasil;
}

export function labelRole(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "DEVELOPER") return "Developer";
  return "Pemain";
}

// ---------- Tampilan kecil ----------
export function Avatar({
  nama,
  size = 36,
  online,
}: {
  nama: string;
  size?: number;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex size-full items-center justify-center rounded-full border border-[#e4e6f0] bg-[#ede8ff] font-bold"
        style={{ fontSize: Math.round(size * 0.33) }}
      >
        {inisial(nama)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 size-[9px] rounded-full border-2 border-white bg-[#19a877]" />
      )}
    </div>
  );
}

export function GalatMuat() {
  return (
    <p className="m-auto max-w-[320px] text-center text-[11px] text-[#b42318]">
      Pesan tidak bisa dimuat. Pastikan migrasi database sudah dijalankan dan
      server sudah dihidupkan ulang, lalu muat ulang halaman.
    </p>
  );
}

export function PemisahHari({ label }: { label: string }) {
  return <p className="text-center text-[9px] text-[#70758a]">{label}</p>;
}

export function Balon({
  mine,
  nama,
  teks,
  waktu,
  centang,
}: {
  mine: boolean;
  nama?: ReactNode;
  teks: string;
  waktu: string;
  centang?: "terkirim" | "dibaca";
}) {
  return (
    <div
      className={`flex max-w-[78%] flex-col gap-[7px] p-3 ${
        mine
          ? "rounded-bl-[10px] rounded-br-[2px] rounded-tl-[10px] rounded-tr-[10px] bg-[#6d4aff] text-white"
          : "rounded-bl-[10px] rounded-br-[10px] rounded-tl-[2px] rounded-tr-[10px] bg-[#f1f2f7] text-[#22243a]"
      }`}
    >
      {nama && <div className="text-[10px]">{nama}</div>}
      <p className="whitespace-pre-wrap break-words text-[12px] leading-[1.6]">
        {teks}
      </p>
      <div
        className={`flex items-center justify-end gap-[5px] text-[9px] ${
          mine ? "" : "text-[#70758a]"
        }`}
      >
        {waktu}
        {centang && (
          <CheckCheckIcon
            size={13}
            className={centang === "dibaca" ? "" : "opacity-50"}
          />
        )}
      </div>
    </div>
  );
}

// ---------- Kolom tulis pesan ----------
export function Composer({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (teks: string) => Promise<boolean>;
}) {
  const [teks, setTeks] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const bersih = teks.trim();
    if (!bersih || mengirim) return;
    setMengirim(true);
    const ok = await onSend(bersih);
    setMengirim(false);
    setGalat(!ok);
    if (ok) setTeks("");
  };

  return (
    <form
      onSubmit={kirim}
      className="relative flex h-[70px] shrink-0 items-center gap-3 border-t border-[#e4e6f0] px-4"
    >
      {galat && (
        <span className="absolute bottom-full left-4 pb-1 text-[10px] text-[#b42318]">
          Pesan gagal terkirim. Coba lagi.
        </span>
      )}
      <input
        value={teks}
        onChange={(e) => setTeks(e.target.value)}
        maxLength={1000}
        placeholder={placeholder}
        className="h-[37px] min-w-0 flex-1 rounded-[7px] bg-[#f5f6fa] px-[11px] text-[12px] placeholder:text-[#70758a] focus:outline-none"
      />
      <button
        type="submit"
        disabled={!teks.trim() || mengirim}
        aria-label="Kirim pesan"
        className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[#6d4aff] text-white disabled:opacity-50"
      >
        <SendIcon size={16} />
      </button>
    </form>
  );
}

// ---------- Kartu profil (muncul saat avatar / nama di global chat diklik) ----------
export function KartuProfil({
  userId,
  meId,
  onClose,
  onChat,
}: {
  userId: string;
  meId: string;
  onClose: () => void;
  onChat: (user: UserLite) => void;
}) {
  const [user, setUser] = useState<UserLite | null>(null);
  const [gagal, setGagal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Ambil data terbaru (supaya status online akurat)
  useEffect(() => {
    let batal = false;
    getJson<{ user: UserLite }>(`/api/users/${userId}`).then((d) => {
      if (batal) return;
      if (d) setUser(d.user);
      else setGagal(true);
    });
    return () => {
      batal = true;
    };
  }, [userId]);

  // Tutup saat klik di luar kartu atau tekan Esc
  useEffect(() => {
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-20 mt-1 w-[230px] rounded-[12px] border border-[#e4e6f0] bg-white p-4 text-[#22243a] shadow-lg"
    >
      {!user ? (
        <p className="text-[11px] text-[#70758a]">
          {gagal ? "Profil tidak bisa dimuat." : "Memuat..."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar nama={user.name} size={44} online={user.online} />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-[13px] font-semibold">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-[#70758a]">
                {labelRole(user.role)}
                {user.studioName ? ` • ${user.studioName}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span
              className={`size-[7px] rounded-full ${
                user.online ? "bg-[#19a877]" : "bg-[#b4b8c8]"
              }`}
            />
            <span className={user.online ? "text-[#168355]" : "text-[#70758a]"}>
              {user.online ? "Online" : "Offline"}
            </span>
          </div>

          {user.id === meId ? (
            <p className="text-[11px] text-[#70758a]">Ini kamu.</p>
          ) : (
            <button
              type="button"
              onClick={() => onChat(user)}
              className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-[#6d4aff] text-[12px] font-semibold text-white hover:bg-[#5b3be6]"
            >
              <MessagesSquareIcon size={15} />
              Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
