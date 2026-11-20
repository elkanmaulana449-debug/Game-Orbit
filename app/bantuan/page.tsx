import { HalamanInfo } from "@/app/components/halaman-info";
import { BantuanKonten } from "./bantuan-konten";

export const metadata = { title: "Pusat Bantuan — Game Orbit" };

export default function Bantuan() {
  return (
    <HalamanInfo judul="Pusat bantuan" deskripsi="Jawaban cepat untuk pertanyaan yang sering diajukan, atau kirim pesan langsung ke admin.">
      <BantuanKonten />
    </HalamanInfo>
  );
}
