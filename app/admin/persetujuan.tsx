// app/admin/persetujuan.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  DownloadIcon,
  SearchIcon,
  XIcon,
} from "@/app/store/icons";
import {
  Clock3Icon,
  ExternalLinkIcon,
  SortIcon,
  UserCheckIcon,
  UserXIcon,
} from "@/app/components/icons-extra";
import { useWorkspaceUser } from "@/app/workspace/client";
import {
  Avatar,
  Judul,
  Kartu,
  Metrik,
  Pager,
  Status,
  dua,
  formatTanggal,
  tombolMerah,
  tombolPutih,
  tombolUngu,
  unduhCsv,
} from "@/app/workspace/ui";

type Developer = {
  id: string;
  name: string | null;
  email: string;
  studioName: string | null;
  status: string; // PENDING | APPROVED | REJECTED
  createdAt: string;
  _count: { gamesDeveloper: number };
};

type TabStatus = "PENDING" | "APPROVED" | "REJECTED";

const TAB: { nilai: TabStatus; label: string }[] = [
  { nilai: "PENDING", label: "Menunggu" },
  { nilai: "APPROVED", label: "Disetujui" },
  { nilai: "REJECTED", label: "Ditolak" },
];
const PER_HALAMAN = 5;

const namaDev = (d: Developer) => d.studioName || d.name || "Tanpa nama";

export function Persetujuan() {
  const admin = useWorkspaceUser(["ADMIN"]);
  const [data, setData] = useState<Developer[] | null>(null);
  const [gagal, setGagal] = useState(false);
  const [tab, setTab] = useState<TabStatus>("PENDING");
  const [q, setQ] = useState("");
  const [terbaru, setTerbaru] = useState(true);
  const [halaman, setHalaman] = useState(1);
  const [pilihan, setPilihan] = useState<string | null>(null);
  const [proses, setProses] = useState(false);
  const [sekarang, setSekarang] = useState<number | null>(null);

  useEffect(() => {
    setSekarang(Date.now());
  }, []);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const d = (await res.json()) as { users: (Developer & { role: string })[] };
      setData(d.users.filter((u) => u.role === "DEVELOPER"));
      setGagal(false);
    } catch {
      setGagal(true);
    }
  }, []);

  useEffect(() => {
    if (admin) void muat();
  }, [admin, muat]);

  const hitung = useMemo(() => {
    const h = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    (data ?? []).forEach((d) => {
      if (d.status in h) h[d.status as TabStatus]++;
    });
    return h;
  }, [data]);

  const daftar = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return (data ?? [])
      .filter(
        (d) =>
          d.status === tab &&
          (!kata ||
            namaDev(d).toLowerCase().includes(kata) ||
            d.email.toLowerCase().includes(kata)),
      )
      .sort((a, b) =>
        terbaru
          ? +new Date(b.createdAt) - +new Date(a.createdAt)
          : +new Date(a.createdAt) - +new Date(b.createdAt),
      );
  }, [data, tab, q, terbaru]);

  const baris = daftar.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN);
  const terpilih = daftar.find((d) => d.id === pilihan) ?? baris[0] ?? null;

  // Waktu sekarang hanya dibaca di browser (setelah mount), supaya tidak
  // ikut dibekukan saat prerender.
  const hitungBaru = useMemo(() => {
    if (sekarang === null) return { hariIni: 0, bulanIni: 0 };
    const n = new Date(sekarang);
    let hariIni = 0;
    let bulanIni = 0;
    for (const d of data ?? []) {
      const t = new Date(d.createdAt);
      if (d.status === "PENDING" && t.toDateString() === n.toDateString()) hariIni++;
      if (
        d.status === "APPROVED" &&
        t.getMonth() === n.getMonth() &&
        t.getFullYear() === n.getFullYear()
      )
        bulanIni++;
    }
    return { hariIni, bulanIni };
  }, [data, sekarang]);
  const barubaruIni = hitungBaru.hariIni;
  const bulanIni = hitungBaru.bulanIni;

  const putuskan = async (dev: Developer, statusBaru: "APPROVED" | "REJECTED") => {
    const kata = statusBaru === "APPROVED" ? "menyetujui" : "menolak";
    if (proses || !confirm(`Yakin mau ${kata} ${namaDev(dev)}?`)) return;
    setProses(true);
    try {
      const res = await fetch("/api/admin/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerId: dev.id, statusBaru }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) alert(d.pesan || "Gagal memproses pengajuan.");
      else await muat();
    } catch {
      alert("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setProses(false);
    }
  };

  const ekspor = () =>
    unduhCsv("developer-game-orbit.csv", [
      ["Studio", "Email", "Diajukan", "Jumlah game", "Status"],
      ...(data ?? []).map((d) => [
        namaDev(d),
        d.email,
        formatTanggal(d.createdAt),
        d._count.gamesDeveloper,
        d.status,
      ]),
    ]);

  if (!admin) return <p className="text-[12px] text-[#70758a]">Memuat…</p>;

  return (
    <>
      <Judul
        eyebrow="KONTROL AKSES"
        title="Persetujuan developer"
        desc="Tinjau kreator baru sebelum mereka mulai menerbitkan game."
        aksi={
          <button type="button" onClick={ekspor} className={tombolPutih}>
            <DownloadIcon size={17} /> Ekspor data
          </button>
        }
      />

      {gagal && (
        <p className="text-[11px] text-[#b42318]">
          Data developer tidak bisa dimuat. Muat ulang halaman atau coba lagi nanti.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metrik
          warna="ungu"
          label="Menunggu persetujuan"
          nilai={dua(hitung.PENDING)}
          catatan={`${barubaruIni} pengajuan baru hari ini`}
          icon={<Clock3Icon size={18} />}
        />
        <Metrik
          warna="hijau"
          label="Developer disetujui"
          nilai={dua(hitung.APPROVED)}
          catatan={`+${bulanIni} developer bulan ini`}
          icon={<UserCheckIcon size={18} />}
        />
        <Metrik
          warna="oranye"
          label="Pengajuan ditolak"
          nilai={dua(hitung.REJECTED)}
          catatan="Total pengajuan ditolak"
          icon={<UserXIcon size={18} />}
        />
      </div>

      <div className="flex flex-col gap-[22px] xl:flex-row xl:items-start">
        {/* Daftar pengajuan */}
        <Kartu className="min-w-0 flex-1 overflow-hidden xl:max-w-[748px]">
          <div className="flex h-14 items-center gap-[25px] overflow-x-auto border-b border-[#e4e6f0] px-5 text-[12px]">
            {TAB.map((t) => (
              <button
                key={t.nilai}
                type="button"
                onClick={() => {
                  setTab(t.nilai);
                  setHalaman(1);
                  setPilihan(null);
                }}
                className={`whitespace-pre ${
                  tab === t.nilai ? "font-semibold text-[#6d4aff]" : ""
                }`}
              >
                {`${t.label}  ${hitung[t.nilai]}`}
              </button>
            ))}
          </div>

          <div className="flex gap-3 p-4">
            <label className="flex h-[35px] min-w-0 flex-1 items-center gap-[10px] rounded-[7px] bg-[#f5f6fa] px-3">
              <SearchIcon size={16} className="shrink-0" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setHalaman(1);
                }}
                placeholder="Cari nama studio atau email..."
                className="min-w-0 flex-1 bg-transparent text-[11px] focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setTerbaru((v) => !v)}
              className={tombolPutih}
            >
              <SortIcon size={17} />
              {terbaru ? "Terbaru" : "Terlama"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid h-9 grid-cols-[minmax(0,1fr)_110px_90px_64px] items-center bg-[#f5f6fa] px-5 text-[10px] font-semibold">
                <span>STUDIO / EMAIL</span>
                <span className="text-[#70758a]">DIAJUKAN</span>
                <span>PORTOFOLIO</span>
                <span>AKSI</span>
              </div>
              {data === null && !gagal && (
                <p className="px-5 py-8 text-[11px] text-[#70758a]">Memuat…</p>
              )}
              {data !== null && baris.length === 0 && (
                <p className="px-5 py-8 text-[11px] text-[#70758a]">
                  Tidak ada pengajuan di tab ini.
                </p>
              )}
              {baris.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setPilihan(d.id)}
                  className={`grid h-[68px] cursor-pointer grid-cols-[minmax(0,1fr)_110px_90px_64px] items-center border-b border-[#e4e6f0] px-5 hover:bg-[#fafaff] ${
                    terpilih?.id === d.id ? "bg-[#faf9ff]" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-[11px]">
                    <Avatar nama={namaDev(d)} />
                    <div className="flex min-w-0 flex-col gap-[5px]">
                      <span className="truncate text-[12px] font-semibold">
                        {namaDev(d)}
                      </span>
                      <span className="truncate text-[10px]">{d.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#70758a]">
                    {formatTanggal(d.createdAt)}
                  </span>
                  <span className="text-[11px]">{d._count.gamesDeveloper} game</span>
                  <div className="flex gap-[13px]">
                    {d.status !== "APPROVED" && (
                      <button
                        type="button"
                        aria-label="Setujui"
                        disabled={proses}
                        onClick={(e) => {
                          e.stopPropagation();
                          void putuskan(d, "APPROVED");
                        }}
                        className="hover:text-[#168355]"
                      >
                        <CheckIcon size={17} />
                      </button>
                    )}
                    {d.status !== "REJECTED" && (
                      <button
                        type="button"
                        aria-label="Tolak"
                        disabled={proses}
                        onClick={(e) => {
                          e.stopPropagation();
                          void putuskan(d, "REJECTED");
                        }}
                        className="hover:text-[#c3475a]"
                      >
                        <XIcon size={17} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pager
            halaman={halaman}
            total={daftar.length}
            perHalaman={PER_HALAMAN}
            satuan="pengajuan"
            onGanti={setHalaman}
          />
        </Kartu>

        {/* Detail pengajuan */}
        <Kartu className="flex flex-col gap-5 p-[22px] xl:min-w-[300px] xl:flex-1">
          <div className="flex items-start justify-between">
            <p className="text-[14px]">Tinjau pengajuan</p>
            <ExternalLinkIcon size={16} />
          </div>
          {!terpilih ? (
            <p className="text-[12px] text-[#70758a]">
              Pilih pengajuan di daftar untuk melihat detailnya.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-[13px]">
                <Avatar nama={namaDev(terpilih)} size={46} />
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <p className="truncate text-[18px]">{namaDev(terpilih)}</p>
                  <div>
                    <Status
                      warna={
                        terpilih.status === "APPROVED"
                          ? "hijau"
                          : terpilih.status === "REJECTED"
                            ? "merah"
                            : "kuning"
                      }
                    >
                      {terpilih.status === "APPROVED"
                        ? "Disetujui"
                        : terpilih.status === "REJECTED"
                          ? "Ditolak"
                          : "Menunggu"}
                    </Status>
                  </div>
                </div>
              </div>

              <dl className="flex flex-col gap-4">
                {[
                  ["Email", terpilih.email],
                  ["Nama studio", terpilih.studioName || "-"],
                  ["Diajukan", formatTanggal(terpilih.createdAt)],
                  ["Jumlah game", `${terpilih._count.gamesDeveloper} game`],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-[5px]">
                    <dt className="text-[10px]">{k}</dt>
                    <dd className="break-all text-[12px]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="h-px bg-[#e9eaf2]" />
              <p className="text-[10px] leading-[1.6]">
                Persetujuan membuka akses untuk mengunggah dan mengelola game.
                Developer yang ditolak tidak bisa masuk ke akunnya.
              </p>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  disabled={proses || terpilih.status === "REJECTED"}
                  onClick={() => putuskan(terpilih, "REJECTED")}
                  className={tombolMerah}
                >
                  <XIcon size={17} /> Tolak
                </button>
                <button
                  type="button"
                  disabled={proses || terpilih.status === "APPROVED"}
                  onClick={() => putuskan(terpilih, "APPROVED")}
                  className={`${tombolUngu} flex-1`}
                >
                  <CheckIcon size={17} /> Setujui
                </button>
              </div>
            </>
          )}
        </Kartu>
      </div>
    </>
  );
}
