import Link from "next/link";
import { HalamanInfo } from "@/app/components/halaman-info";

export const metadata = { title: "Lupa Kata Sandi — Game Orbit" };

export default function LupaSandi() {
  return (
    <HalamanInfo judul="Lupa kata sandi" deskripsi="Reset otomatis lewat email belum tersedia, tapi admin bisa membantu.">
      <ol className="list-decimal space-y-3 pl-5 text-[13px] leading-7 text-[#555970]">
        <li>Buka <Link href="/bantuan" className="font-semibold text-[#6d4aff]">Pusat bantuan</Link> dan kirim pesan ke admin (tulis email akun kamu).</li>
        <li>Admin akan memverifikasi dan membantu mengatur ulang akun.</li>
        <li>Setelah bisa masuk, ganti kata sandi sendiri di halaman Profil.</li>
      </ol>
      <Link href="/login" className="mt-8 inline-block rounded-[10px] bg-[#6d4aff] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#5b3be6]">Kembali ke halaman masuk</Link>
    </HalamanInfo>
  );
}
