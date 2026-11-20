import { HalamanInfo, Bagian } from "@/app/components/halaman-info";

export const metadata = { title: "Syarat Layanan — Game Orbit" };

export default function Syarat() {
  return (
    <HalamanInfo judul="Syarat layanan" deskripsi="Aturan singkat memakai Game Orbit.">
      <Bagian judul="Akun">
        <p>Kamu bertanggung jawab atas keamanan akun dan kata sandimu. Satu orang satu akun, dengan data yang benar.</p>
      </Bagian>
      <Bagian judul="Pemain">
        <p>Game yang sudah dimiliki muncul di Koleksi. Ulasan hanya bisa ditulis oleh pemain yang memiliki game tersebut dan harus sopan, jujur, serta bebas dari ujaran kebencian.</p>
      </Bagian>
      <Bagian judul="Developer">
        <p>Akun developer perlu disetujui admin. Game yang diunggah harus milikmu atau kamu punya izin untuk mendistribusikannya, dan tidak memuat malware atau konten terlarang.</p>
      </Bagian>
      <Bagian judul="Moderasi">
        <p>Admin dapat menonaktifkan game atau akun yang melanggar aturan.</p>
      </Bagian>
    </HalamanInfo>
  );
}
