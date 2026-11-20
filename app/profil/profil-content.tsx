// app/profil/profil-content.tsx
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inisial, useStoreUser } from "@/app/store/client-parts";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellIcon,
  ChevronRightIcon,
  EyeIcon,
  GlobeIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MonitorIcon,
  PencilIcon,
} from "@/app/store/icons";

type Profil = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    studioName: string | null;
    createdAt: string;
  };
  jumlahKoleksi: number;
  jumlahUlasan: number;
  terbaru: { id: string; title: string; imageUrl: string | null; diperolehPada: string }[];
};

function labelRole(role?: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "DEVELOPER") return "Developer";
  return "Gamer";
}

function bulanTahun(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function Kartu({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[14px] border border-[#e4e6f0] bg-white ${className}`}>
      {children}
    </section>
  );
}

function Isian({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
      <span className="text-[13px] font-medium text-[#70758a]">{label}</span>
      <div className="flex h-[49px] items-center rounded-[8px] border border-[#e4e6f0] bg-[#f5f6fa] px-[15px] text-[14px]">
        <span className="truncate">{nilai}</span>
      </div>
    </div>
  );
}

function BarisPengaturan({
  icon, label, nilai, onClick, nonaktif,
}: {
  icon: ReactNode;
  label: string;
  nilai: string;
  onClick?: () => void;
  nonaktif?: boolean;
}) {
  const isi = (
    <>
      {icon}
      <span className="flex-1 text-left text-[12px]">{label}</span>
      <span className="text-[10px]">{nilai}</span>
      {onClick && <ChevronRightIcon size={13} />}
    </>
  );
  if (!onClick) return <div className={`flex items-center gap-[10px] ${nonaktif ? "opacity-60" : ""}`}>{isi}</div>;
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-[10px] rounded-md hover:bg-[#f5f6fa]">
      {isi}
    </button>
  );
}

function FormSandi({ userId, tutup }: { userId: string; tutup: () => void }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [pesan, setPesan] = useState("");
  const [ok, setOk] = useState(false);
  const [proses, setProses] = useState(false);

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesan("");
    if (baru !== ulang) return setPesan("Konfirmasi kata sandi tidak sama.");
    setProses(true);
    try {
      const res = await fetch(`/api/users/${userId}/sandi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ me: userId, passwordLama: lama, passwordBaru: baru }),
      });
      const d = await res.json().catch(() => ({}));
      setOk(res.ok);
      setPesan(d.pesan || (res.ok ? "Berhasil." : "Gagal."));
      if (res.ok) setTimeout(tutup, 1200);
    } catch {
      setPesan("Tidak dapat terhubung ke server.");
    } finally {
      setProses(false);
    }
  };

  const kelas = "h-10 w-full rounded-[8px] border border-[#e4e6f0] px-3 text-[13px] outline-none focus:border-[#6d4aff]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Ubah kata sandi">
      <form onSubmit={kirim} className="flex w-full max-w-[380px] flex-col gap-3 rounded-[14px] bg-white p-6">
        <h2 className="text-[17px] font-semibold">Ubah kata sandi</h2>
        <input type="password" required placeholder="Kata sandi lama" value={lama} onChange={(e) => setLama(e.target.value)} className={kelas} autoComplete="current-password" />
        <input type="password" required minLength={6} placeholder="Kata sandi baru (min. 6 karakter)" value={baru} onChange={(e) => setBaru(e.target.value)} className={kelas} autoComplete="new-password" />
        <input type="password" required placeholder="Ulangi kata sandi baru" value={ulang} onChange={(e) => setUlang(e.target.value)} className={kelas} autoComplete="new-password" />
        {pesan && <p role="status" className={`text-[12px] ${ok ? "text-[#168355]" : "text-[#c3475a]"}`}>{pesan}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={tutup} className="h-10 rounded-[8px] px-4 text-[13px] hover:bg-[#f5f6fa]">Batal</button>
          <button disabled={proses} className="h-10 rounded-[8px] bg-[#6d4aff] px-4 text-[13px] font-semibold text-white disabled:opacity-60">{proses ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </div>
  );
}

export function ProfilContent() {
  const router = useRouter();
  const user = useStoreUser();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [gagal, setGagal] = useState(false);
  const [mengedit, setMengedit] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const [studioBaru, setStudioBaru] = useState("");
  const [galatEdit, setGalatEdit] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [bukaSandi, setBukaSandi] = useState(false);
  const [notifAktif, setNotifAktif] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifAktif(localStorage.getItem("game-orbit-notif") !== "off");
    } catch {
      /* abaikan */
    }
  }, []);

  const ubahNotif = () => {
    const berikutnya = !notifAktif;
    setNotifAktif(berikutnya);
    try {
      localStorage.setItem("game-orbit-notif", berikutnya ? "on" : "off");
    } catch {
      /* abaikan */
    }
  };

  // Belum login -> ke halaman login
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user?.id) return;
    let batal = false;
    fetch(`/api/users/${user.id}/profil?me=${encodeURIComponent(user.id)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Profil) => !batal && setProfil(d))
      .catch(() => !batal && setGagal(true));
    return () => {
      batal = true;
    };
  }, [user?.id]);

  const keluar = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const mulaiEdit = () => {
    setNamaBaru(profil?.user.name ?? user?.name ?? "");
    setStudioBaru(profil?.user.studioName ?? user?.studioName ?? "");
    setGalatEdit("");
    setMengedit(true);
  };

  const simpanEdit = async () => {
    if (!user) return;
    setMenyimpan(true);
    setGalatEdit("");
    try {
      const res = await fetch(`/api/users/${user.id}/profil`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ me: user.id, name: namaBaru, studioName: studioBaru }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return setGalatEdit(d.pesan || "Gagal menyimpan.");
      localStorage.setItem("user", JSON.stringify({ ...user, name: d.user.name, studioName: d.user.studioName }));
      window.location.reload();
    } catch {
      setGalatEdit("Tidak dapat terhubung ke server.");
    } finally {
      setMenyimpan(false);
    }
  };

  if (user === undefined) return null;
  if (user === null) return null;

  const nama = profil?.user.name ?? user.name ?? "Pengguna";
  const role = profil?.user.role ?? user.role;
  const isDevOrAdmin = role === "DEVELOPER" || role === "ADMIN";

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#6d4aff]">AKUN Game Orbit</p>
        <h1 className="text-[30px] font-bold leading-tight">Profil pengguna</h1>
        <p className="text-[13px] text-[#70758a]">
          Ruang personal untuk identitas, preferensi, dan perjalanan bermainmu.
        </p>
      </div>

      {/* Ringkasan profil */}
      <div className="flex flex-col gap-6 rounded-[14px] border border-[#e4e6f0] bg-[#f0ecff] p-7 sm:flex-row sm:items-center sm:gap-[22px]">
        <div className="flex size-[86px] shrink-0 items-center justify-center rounded-[14px] border border-[#e4e6f0] bg-[#ede8ff] text-[28px] font-bold">
          {inisial(nama)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[26px] font-bold leading-tight">{nama}</h2>
            <span className="flex items-center gap-[5px] rounded-[6px] bg-[#ede8ff] px-[10px] py-[6px] text-[11px] font-semibold text-[#6643d7]">
              <span className="size-[5px] rounded-[3px] bg-[#6d4aff]" />
              {labelRole(role)}
            </span>
          </div>
          {role !== "USER" && user.studioName && (
            <p className="text-[12px]">{user.studioName}</p>
          )}
          <p className="text-[11px] text-[#70758a]">
            {profil ? `Bergabung sejak ${bulanTahun(profil.user.createdAt)}` : " "}
          </p>
        </div>
        <div className="flex gap-9">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[25px]">{profil ? profil.jumlahKoleksi : "–"}</span>
            <span className="text-[10px]">Game dikoleksi</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[25px]">{profil ? profil.jumlahUlasan : "–"}</span>
            <span className="text-[10px]">Ulasan ditulis</span>
          </div>
        </div>
      </div>

      {gagal && (
        <p className="text-[11px] text-[#b42318]">
          Data profil tidak bisa dimuat. Muat ulang halaman atau coba lagi nanti.
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Kolom kiri */}
        <div className="flex min-w-0 flex-col gap-6 lg:w-[726px] lg:shrink-0">
          <Kartu className="flex flex-col gap-[22px] p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-[17px]">Informasi pribadi</h2>
              {mengedit ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMengedit(false)} className="h-[42px] rounded-[8px] px-4 text-[13px] hover:bg-[#f5f6fa]">Batal</button>
                  <button type="button" onClick={simpanEdit} disabled={menyimpan} className="h-[42px] rounded-[8px] bg-[#6d4aff] px-[17px] text-[13px] font-semibold text-white disabled:opacity-60">{menyimpan ? "Menyimpan..." : "Simpan"}</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={mulaiEdit}
                  className="flex h-[42px] items-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-white px-[17px] text-[13px] font-semibold hover:bg-[#f5f6fa]"
                >
                  <PencilIcon size={17} />
                  Edit profil
                </button>
              )}
            </div>
            {mengedit ? (
              <div className="flex flex-col gap-[18px] sm:flex-row">
                <label className="flex min-w-0 flex-1 flex-col gap-[9px] text-[13px] font-medium text-[#70758a]">
                  Nama lengkap
                  <input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} maxLength={60} className="h-[49px] rounded-[8px] border border-[#6d4aff] px-[15px] text-[14px] font-normal text-[#22243a] outline-none" />
                </label>
                {role !== "USER" && (
                  <label className="flex min-w-0 flex-1 flex-col gap-[9px] text-[13px] font-medium text-[#70758a]">
                    Nama studio
                    <input value={studioBaru} onChange={(e) => setStudioBaru(e.target.value)} maxLength={60} className="h-[49px] rounded-[8px] border border-[#6d4aff] px-[15px] text-[14px] font-normal text-[#22243a] outline-none" />
                  </label>
                )}
              </div>
            ) : null}
            {galatEdit && <p role="alert" className="text-[12px] text-[#c3475a]">{galatEdit}</p>}
            <div className="flex flex-col gap-[18px] sm:flex-row">
              {!mengedit && <Isian label="Nama lengkap" nilai={nama} />}
              <Isian label="Peran" nilai={labelRole(role)} />
            </div>
            <div className="flex flex-col gap-[18px] sm:flex-row">
              <Isian label="Alamat email" nilai={profil?.user.email ?? "…"} />
              {(role === "USER" || !mengedit) && (
                <Isian
                  label={role === "USER" ? "Status akun" : "Nama studio"}
                  nilai={role === "USER" ? "Aktif" : user.studioName || "-"}
                />
              )}
            </div>
            <p className="flex flex-wrap items-center gap-[7px] text-[10px]">
              <BadgeCheckIcon size={15} className="text-[#168355]" />
              <span className="text-[#168355]">Akun terdaftar</span>
              <span>•  Informasi kontakmu tidak ditampilkan ke publik.</span>
            </p>
          </Kartu>

          <Kartu className="flex flex-col gap-[15px] p-[22px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[21px] font-semibold">Koleksi terbaru</h2>
              <Link
                href="/koleksi"
                className="flex items-center gap-2 text-[12px] font-semibold text-[#6d4aff]"
              >
                Koleksi saya <ArrowRightIcon size={15} />
              </Link>
            </div>
            {!profil ? (
              <p className="text-[11px] text-[#70758a]">{gagal ? "—" : "Memuat..."}</p>
            ) : profil.terbaru.length === 0 ? (
              <p className="text-[11px] text-[#70758a]">
                Belum ada game di koleksimu.{" "}
                <Link href="/store?jelajahi=1" className="font-semibold text-[#6d4aff]">
                  Jelajahi game
                </Link>
              </p>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row">
                {profil.terbaru.map((g) => (
                  <Link
                    key={g.id}
                    href={`/game/${g.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="h-[66px] w-[80px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br from-[#6d4aff] to-[#b9a6ff]">
                      {g.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[20px] font-bold text-white">
                          {g.title[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-[7px]">
                      <span className="truncate text-[12px] font-semibold">{g.title}</span>
                      <span className="text-[10px]">
                        Dimiliki sejak {bulanTahun(g.diperolehPada)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Kartu>
        </div>

        {/* Kolom kanan */}
        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
          <Kartu className="flex flex-col gap-[21px] p-6">
            <h2 className="text-[17px]">Preferensi &amp; keamanan</h2>
            <BarisPengaturan icon={<BellIcon size={17} />} label="Notifikasi" nilai={notifAktif ? "Aktif" : "Nonaktif"} onClick={ubahNotif} />
            <BarisPengaturan icon={<GlobeIcon size={17} />} label="Bahasa aplikasi" nilai="Indonesia (lainnya segera)" nonaktif />
            <BarisPengaturan icon={<LockKeyholeIcon size={17} />} label="Kata sandi" nilai="Ubah" onClick={() => setBukaSandi(true)} />
            <BarisPengaturan icon={<EyeIcon size={17} />} label="Visibilitas profil" nilai="Publik" nonaktif />
          </Kartu>

          {isDevOrAdmin && (
            <Kartu className="flex flex-col gap-1 p-3 text-[12px]">
              <Link href="/dashboard" className="rounded-[8px] px-3 py-2.5 hover:bg-[#f5f6fa]">
                Dashboard developer
              </Link>
              {role === "ADMIN" && (
                <Link href="/admin" className="rounded-[8px] px-3 py-2.5 hover:bg-[#f5f6fa]">
                  Panel admin
                </Link>
              )}
            </Kartu>
          )}

          <Kartu className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-[11px]">
              <MonitorIcon size={20} />
              <div className="flex flex-col gap-[5px]">
                <span className="text-[12px] font-semibold">Perangkat ini</span>
                <span className="text-[10px] text-[#70758a]">Sesi aktif saat ini</span>
              </div>
            </div>
            <p className="text-[11px] leading-[1.7] text-[#70758a]">
              Keluar dari akun di perangkat ini. Koleksi dan progresmu tetap tersimpan.
            </p>
            <button
              type="button"
              onClick={keluar}
              className="flex h-[42px] items-center justify-center gap-[9px] rounded-[8px] border border-[#e4e6f0] bg-[#fff0f1] px-[17px] text-[13px] font-semibold text-[#c3475a] hover:bg-[#ffe3e6]"
            >
              <LogOutIcon size={17} />
              Keluar dari akun
            </button>
          </Kartu>

          <p className="text-center text-[10px] text-[#70758a]">
            Game Orbit  •  Dibuat untuk para pemain.
          </p>
        </div>
      </div>
    {bukaSandi && <FormSandi userId={user.id} tutup={() => setBukaSandi(false)} />}
    </>
  );
}
