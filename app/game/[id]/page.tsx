// app/game/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetailGame() {
  const params = useParams();
  const router = useRouter();
  const idGame = params.id; // Ambil ID game dari URL

  const [game, setGame] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    // 1. Ambil data user dari localStorage (buat ngecek udah login atau belum)
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 2. Ambil data detail game dari API
    const ambilGame = async () => {
      try {
        const res = await fetch(`/api/games/${idGame}`);
        const data = await res.json();
        if (res.ok) {
          setGame(data.game);
        } else {
          setPesan(data.pesan);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    ambilGame();
  }, [idGame]);

  const handleBeli = async () => {
    if (!user) {
      alert("Kamu harus login dulu untuk membeli game!");
      router.push("/login");
      return;
    }

    const konfirmasi = confirm(`Yakin mau beli ${game.title} seharga Rp ${game.price}?`);
    if (!konfirmasi) return;

    // Tembak API buat bikin transaksi
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        gameId: game.id,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Pembelian Berhasil! Game masuk ke Library kamu.");
      router.push("/library"); // Nanti kita bikin halaman library
    } else {
      alert(data.pesan);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Memuat data game...</p>;
  if (!game) return <p style={{ padding: "20px" }}>{pesan || "Game tidak ditemukan."}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <button onClick={() => router.back()} style={{ marginBottom: "20px", cursor: "pointer" }}>
        &larr; Kembali
      </button>

      <h1>{game.title}</h1>
      <p style={{ fontSize: "18px", color: "#555", maxWidth: "600px" }}>{game.description}</p>
      
      <h2 style={{ color: "#2563eb" }}>Rp {game.price}</h2>

      {/* Tampilkan tombol beli hanya kalau dia bukan Developer pembuat game ini */}
      {user?.role === "DEVELOPER" ? (
        <p style={{ color: "red" }}>*Kamu adalah Developer, kamu tidak bisa membeli game sendiri.</p>
      ) : (
        <button 
          onClick={handleBeli}
          style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
        >
          Beli Sekarang
        </button>
      )}
    </div>
  );
}