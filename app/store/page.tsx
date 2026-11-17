// app/store/page.tsx
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function StorePage() {
  // Ambil semua data game dari database
  const games = await prisma.game.findMany();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header sederhana */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>GameOrbit Store</h1>
        <Link href="/" style={{ color: "blue" }}>Kembali ke Beranda</Link>
      </div>

      {/* List Game */}
      {games.length === 0 ? (
        <p>Belum ada game yang dijual di toko ini. (Database kosong)</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          // Di dalam app/store/page.tsx, cari bagian games.map
{games.map((game) => (
  <div key={game.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "5px", width: "250px" }}>
    {/* Bungkus judul pakai Link biar bisa diklik */}
    <Link href={`/game/${game.id}`} style={{ textDecoration: "none", color: "#2563eb" }}>
      <h2 style={{ fontSize: "18px", margin: "0 0 10px 0" }}>{game.title}</h2>
    </Link>
    <p style={{ fontSize: "14px", color: "#555" }}>{game.description}</p>
    <p style={{ fontWeight: "bold", marginTop: "10px" }}>Rp {game.price}</p>
  </div>
))}
        </div>
      )}
    </div>
  );
}