import { HalamanInfo, Bagian } from "@/app/components/halaman-info";

export const metadata = { title: "Kebijakan Privasi — Game Orbit" };

export default function Privasi() {
  return (
    <HalamanInfo judul="Kebijakan privasi" deskripsi="Bagaimana Game Orbit mengumpulkan dan memakai data kamu.">
      <Bagian judul="Data yang kami simpan">
        <p>Nama, email, kata sandi (disimpan dalam bentuk terenkripsi), peran akun, riwayat transaksi/koleksi game, ulasan, dan pesan chat yang kamu kirim.</p>
      </Bagian>
      <Bagian judul="Cara kami memakai data">
        <p>Data dipakai untuk menjalankan akun, menampilkan koleksi, memproses unduhan/pembelian, menampilkan ulasan, dan menghubungkan pemain dengan developer atau admin lewat chat.</p>
      </Bagian>
      <Bagian judul="Berbagi data">
        <p>Nama dan isi ulasan tampil publik di halaman game. Email dan kata sandi tidak pernah ditampilkan ke pengguna lain.</p>
      </Bagian>
      <Bagian judul="Hak kamu">
        <p>Kamu bisa mengubah nama dan kata sandi lewat halaman Profil, menghapus ulasanmu kapan saja, atau menghubungi admin lewat Pusat bantuan untuk permintaan penghapusan akun.</p>
      </Bagian>
    </HalamanInfo>
  );
}
