// app/auth/fields.tsx
"use client";

import { useState, type ReactNode } from "react";
import { EyeIcon } from "@/app/store/icons";
import { EyeOffIcon } from "@/app/components/icons-extra";

export const labelKolom = "text-[13px] font-medium text-[#70758a]";

const kotak =
  "flex h-[49px] items-center gap-3 rounded-[8px] border border-[#e4e6f0] bg-[#f5f6fa] px-[15px] focus-within:border-[#6d4aff]";
const input =
  "min-w-0 flex-1 bg-transparent text-[14px] placeholder:text-[#70758a] focus:outline-none";

export function Isian({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  icon: ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-[9px]">
      <span className={labelKolom}>{label}</span>
      <span className={kotak}>
        <span className="shrink-0 text-[#22243a]">{icon}</span>
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={input}
        />
      </span>
    </label>
  );
}

export function IsianSandi({
  label,
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  icon?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [lihat, setLihat] = useState(false);
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-[9px]">
      <span className={labelKolom}>{label}</span>
      <span className={kotak}>
        {icon && <span className="shrink-0 text-[#22243a]">{icon}</span>}
        <input
          required
          type={lihat ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={input}
        />
        <button
          type="button"
          onClick={() => setLihat((v) => !v)}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="shrink-0 text-[#70758a]"
        >
          {lihat ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
      </span>
    </label>
  );
}
