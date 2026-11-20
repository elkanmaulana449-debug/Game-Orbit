"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const FAQ = [
  { t: "Bagaimana cara mendapatkan game?", j: "Buka halaman game, lalu klik “Beli Sekarang” atau “Tambahkan Game ke Library” untuk game gratis. Game yang berhasil didapat muncul di menu Koleksi saya." },
  { t: "Kenapa saya tidak bisa menulis ulasan?", j: "Ulasan dan rating hanya bisa ditulis oleh pemain yang sudah memiliki game tersebut. Dapatkan game dulu, lalu buka tab “Rating & ulasan”." },
  { t: "Bagaimana cara menjadi developer?", j: "Daftar dengan peran Developer dan isi nama studio. Akun akan ditinjau admin; setelah disetujui kamu bisa mengunggah game dari dashboard." },
  { t: "Akun developer saya masih menunggu persetujuan.", j: "Admin meninjau pendaftaran secara berkala. Jika terlalu lama, kirim pesan lewat formulir di bawah." },
  { t: "Bagaimana mengubah nama atau kata sandi?", j: "Masuk, buka Profil, lalu pakai tombol Edit profil atau Ubah di baris Kata sandi." },
  { t: "Saya lupa kata sandi.", j: "Lihat halaman Lupa kata sandi atau kirim pesan ke admin lewat formulir di bawah." },
  { t: "Game tidak muncul di toko.", j: "Game yang dinonaktifkan admin tidak ditampilkan. Developer dapat melihat status game di dashboard dan menghubungi admin bila perlu." },
];

export function BantuanKonten() {
  const [cari, setCari] = useState("");
  const [buka, setBuka] = useState<number | null>(0);
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [pesan, setPesan] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; teks: string } | null>(null);
  const [kirim, setKirim] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* abaikan */
    }
  }, []);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return q ? FAQ.filter((f) => `${f.t} ${f.j}`.toLowerCase().includes(q)) : FAQ;
  }, [cari]);

  const kirimPesan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setKirim(true);
    setStatus(null);
    try {
      const res = await fetch("/api/bantuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: pesan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPesan("");
        setStatus({ ok: true, teks: "Pesan terkirim. Balasan admin akan muncul di menu Chat." });
      } else {
        setStatus({ ok: false, teks: data.pesan || "Gagal mengirim pesan." });
      }
    } catch (error) {
      console.error("ERROR_KIRIM_BANTUAN", error);
      setStatus({ ok: false, teks: "Tidak dapat terhubung ke server." });
    } finally {
      setKirim(false);
    }
  };

  return (
    <>
      <input
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        placeholder="Cari pertanyaan..."
        className="h-11 w-full rounded-[10px] border border-[#dfe1ec] bg-white px-4 text-[13px] outline-none focus:border-[#6d4aff]"
      />
      <div className="mt-4 divide-y divide-[#e8eaf2] rounded-xl border border-[#e3e5ef] bg-white">
        {hasil.length === 0 && <p className="p-5 text-[13px] text-[#70758a]">Tidak ada hasil. Coba kata lain atau kirim pesan ke admin.</p>}
        {hasil.map((f, i) => (
          <div key={f.t}>
            <button
              onClick={() => setBuka(buka === i ? null : i)}
              aria-expanded={buka === i}
              className="flex w-full items-center justify-between gap-4 p-4 text-left text-[13px] font-semibold hover:bg-[#fafaff]"
            >
              {f.t}<span className="text-[#6d4aff]">{buka === i ? "−" : "+"}</span>
            </button>
            {buka === i && <p className="px-4 pb-4 text-[13px] leading-6 text-[#555970]">{f.j}</p>}
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-[#e3e5ef] bg-white p-5">
        <h2 className="text-[16px] font-bold">Masih butuh bantuan?</h2>
        {user ? (
          <form onSubmit={kirimPesan} className="mt-3">
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              rows={4}
              maxLength={1000}
              required
              placeholder="Jelaskan masalahmu..."
              className="w-full rounded-lg border border-[#dfe1ec] p-3 text-[13px] outline-none focus:border-[#6d4aff]"
            />
            {status && <p role="status" className={`mt-2 text-[12px] ${status.ok ? "text-[#1e8e57]" : "text-[#c3475a]"}`}>{status.teks}</p>}
            <div className="mt-3 flex items-center gap-3">
              <button disabled={kirim} className="rounded-lg bg-[#6d4aff] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#5b3be6] disabled:opacity-60">
                {kirim ? "Mengirim..." : "Kirim pesan ke admin"}
              </button>
              <Link href="/chat" className="text-[12px] text-[#6d4aff] hover:underline">Buka chat</Link>
            </div>
          </form>
        ) : (
          <p className="mt-2 text-[13px] text-[#70758a]">
            <Link href="/login" className="font-semibold text-[#6d4aff]">Masuk</Link> untuk mengirim pesan langsung ke admin.
          </p>
        )}
      </section>
    </>
  );
}
