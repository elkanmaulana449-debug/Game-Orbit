// app/lib/chat.ts
// Helper bersama untuk semua API chat.

// User dianggap ONLINE kalau terlihat aktif dalam 2 menit terakhir
// (halaman chat mengirim "heartbeat" ke /api/presence secara berkala).
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

// Batas panjang satu pesan
export const MAX_PESAN = 1000;

export function isOnline(lastSeenAt: Date | null | undefined) {
  if (!lastSeenAt) return false;
  return Date.now() - lastSeenAt.getTime() < ONLINE_WINDOW_MS;
}

// Kolom user yang aman ditampilkan ke user lain (tanpa email & password)
export const userPublik = {
  id: true,
  name: true,
  role: true,
  studioName: true,
  lastSeenAt: true,
} as const;

type UserPublik = {
  id: string;
  name: string | null;
  role: string;
  studioName: string | null;
  lastSeenAt: Date | null;
};

export function formatUser(u: UserPublik) {
  return {
    id: u.id,
    name: u.name ?? "Pengguna",
    role: u.role,
    studioName: u.studioName,
    online: isOnline(u.lastSeenAt),
    lastSeenAt: u.lastSeenAt,
  };
}

// Rapikan isi pesan; kembalikan null kalau kosong / kepanjangan / bukan teks
export function bersihkanPesan(content: unknown): string | null {
  if (typeof content !== "string") return null;
  const teks = content.trim();
  if (!teks || teks.length > MAX_PESAN) return null;
  return teks;
}

// Baca ?setelah=<tanggal ISO> (dipakai polling supaya hanya pesan baru yang diambil)
export function bacaSetelah(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
