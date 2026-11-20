// app/workspace/ui.tsx
// Potongan tampilan yang dipakai bersama halaman admin dan developer.
import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/app/store/icons";

export const tombolPutih =
  "flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-white px-[17px] text-[13px] font-semibold hover:bg-[#f5f6fa]";
export const tombolUngu =
  "flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-[#6d4aff] px-[17px] text-[13px] font-semibold text-white hover:bg-[#5b3be6] disabled:opacity-60";
export const tombolMerah =
  "flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-[#fff0f1] px-[17px] text-[13px] font-semibold text-[#c3475a] hover:bg-[#ffe3e6] disabled:opacity-60";

export function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRupiah(n: number) {
  return n === 0
    ? "Gratis"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);
}

export function dua(n: number) {
  return String(n).padStart(2, "0");
}

export function Judul({
  eyebrow,
  title,
  desc,
  aksi,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-[10px] font-bold text-[#6d4aff]">{eyebrow}</p>
        <h1 className="text-[26px] font-bold leading-tight sm:text-[30px]">
          {title}
        </h1>
        <p className="text-[13px] text-[#70758a]">{desc}</p>
      </div>
      {aksi}
    </div>
  );
}

const WARNA_METRIK = {
  ungu: "bg-[#f0ecff]",
  hijau: "bg-[#ecf8f3]",
  oranye: "bg-[#fff2e9]",
  biru: "bg-[#edf3ff]",
} as const;

export function Metrik({
  label,
  nilai,
  catatan,
  warna,
  icon,
}: {
  label: string;
  nilai: string;
  catatan: string;
  warna: keyof typeof WARNA_METRIK;
  icon: ReactNode;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-3 rounded-[14px] border border-[#e4e6f0] p-5 ${WARNA_METRIK[warna]}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[12px]">{label}</p>
        {icon}
      </div>
      <p className="text-[30px] font-semibold leading-none">{nilai}</p>
      <p className="text-[11px] text-[#70758a]">{catatan}</p>
    </div>
  );
}

const WARNA_STATUS = {
  hijau: { bg: "bg-[#e6f7ee]", titik: "bg-[#19a877]", teks: "text-[#168355]" },
  kuning: { bg: "bg-[#fff4d9]", titik: "bg-[#6d4aff]", teks: "text-[#91670e]" },
  abu: { bg: "bg-[#eef0f6]", titik: "bg-[#9aa0b5]", teks: "text-[#555a70]" },
  merah: { bg: "bg-[#fff0f1]", titik: "bg-[#c3475a]", teks: "text-[#c3475a]" },
} as const;

export function Status({
  warna,
  children,
}: {
  warna: keyof typeof WARNA_STATUS;
  children: ReactNode;
}) {
  const w = WARNA_STATUS[warna];
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-[6px] px-[10px] py-[6px] text-[11px] font-semibold ${w.bg} ${w.teks}`}
    >
      <span className={`size-[5px] rounded-[3px] ${w.titik}`} />
      {children}
    </span>
  );
}

export function Kartu({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#e4e6f0] bg-white ${className}`}
    >
      {children}
    </section>
  );
}

export function Avatar({ nama, size = 33 }: { nama: string; size?: number }) {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  const inisial = (
    (kata[0]?.[0] ?? "G") + (kata[1]?.[0] ?? kata[0]?.[1] ?? "")
  ).toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-[#e4e6f0] bg-[#ede8ff] font-bold"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.33) }}
    >
      {inisial}
    </span>
  );
}

export function Pager({
  halaman,
  total,
  perHalaman,
  satuan,
  onGanti,
}: {
  halaman: number;
  total: number;
  perHalaman: number;
  satuan: string;
  onGanti: (h: number) => void;
}) {
  const jumlah = Math.max(1, Math.ceil(total / perHalaman));
  const awal = total === 0 ? 0 : (halaman - 1) * perHalaman + 1;
  const akhir = Math.min(total, halaman * perHalaman);
  return (
    <div className="flex items-center justify-between px-5 py-[17px] text-[11px]">
      <p>
        {total === 0
          ? `Belum ada ${satuan}`
          : `Menampilkan ${awal}–${akhir} dari ${total} ${satuan}`}
      </p>
      <div className="flex items-center gap-[9px]">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={halaman <= 1}
          onClick={() => onGanti(halaman - 1)}
          className="disabled:opacity-30"
        >
          <ChevronLeftIcon size={15} />
        </button>
        {Array.from({ length: jumlah }, (_, i) => i + 1)
          .slice(Math.max(0, halaman - 3), Math.max(0, halaman - 3) + 5)
          .map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onGanti(n)}
              className={`flex size-[28px] items-center justify-center rounded-[6px] text-[11px] ${
                n === halaman ? "bg-[#6d4aff] text-white" : "hover:bg-[#f5f6fa]"
              }`}
            >
              {n}
            </button>
          ))}
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={halaman >= jumlah}
          onClick={() => onGanti(halaman + 1)}
          className="disabled:opacity-30"
        >
          <ChevronRightIcon size={15} />
        </button>
      </div>
    </div>
  );
}

// Unduh data sebagai file CSV (dipakai tombol "Ekspor ...")
export function unduhCsv(nama: string, baris: (string | number)[][]) {
  const isi = baris
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob(["﻿" + isi], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}
