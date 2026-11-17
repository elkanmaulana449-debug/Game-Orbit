// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardDeveloper() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Kamu harus login dulu!");
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "DEVELOPER" && parsedUser.role !== "ADMIN") {
      alert("Halaman ini khusus untuk Developer atau Admin!");
      router.push("/store");
      return;
    }
    setUser(parsedUser);

    const ambilGame = async () => {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        if (res.ok) {
          const gameMilikDia = data.games.filter((g: any) => g.developerId === parsedUser.id);
          setGames(gameMilikDia);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    ambilGame();
  }, [router]);

  const handleTambahGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price, developerId: user.id }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.pesan);
      window.location.reload(); 
    } else {
      alert(data.pesan);
    }
  };

  if (loading || !user) return <p style={{ padding: "20px" }}>Memuat dashboard...</p>;

  // --- LOGIKA STATISTIK DINAMIS ---
  // Karena belum ada tabel unduhan/rating, kita set 0 dulu
  const totalUnduhan = 0; 
  const ratingRataRata = "0.0";
  
  // Warna tema biar gak nyatu
  const boxStyle = { 
    backgroundColor: "#ffffff", // Putih bersih
    padding: "20px", 
    borderRadius: "8px", 
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Kasih bayangan tipis
    color: "#111" 
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f3f4f6" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "250px", backgroundColor: "#d97706", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>DEVELOPER HUB</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ backgroundColor: "#f59e0b", padding: "10px", borderRadius: "5px", fontWeight: "bold" }}>📊 Ringkasan</div>
          <div style={{ padding: "10px", cursor: "pointer", opacity: 0.8 }}>🎮 Game saya</div>
          <div style={{ padding: "10px", cursor: "pointer", opacity: 0.8 }}>📈 Analitik</div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: "30px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>DEVELOPER HUB</p>
            <h1 style={{ margin: 0, fontSize: "28px", color: "#111" }}>Selamat datang, {user.studioName || user.name}.</h1>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>Kelola karya, pantau performa, dan bawa dunia buatanmu ke lebih banyak pemain.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "10px 20px", backgroundColor: "#eab308", color: "#333", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
          >
            + Tambah game
          </button>
        </div>

        {/* Notifikasi */}
        <div style={{ backgroundColor: "#065f46", color: "white", padding: "15px", borderRadius: "5px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Akun developer disetujui!</strong>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Studio kamu sudah terverifikasi. Kamu dapat mengunggah dan mengelola game.</p>
          </div>
          <span style={{ fontSize: "12px" }}>Disetujui 12 Sep 2026</span>
        </div>

        {/* CARD STATISTIK (Sekarang Dinamis) */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ ...boxStyle, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Game saya</p>
            <h2 style={{ margin: "10px 0", fontSize: "32px", color: "#111" }}>{games.length.toString().padStart(2, '0')}</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{games.length} game terdaftar</p>
          </div>
          <div style={{ ...boxStyle, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Total unduhan</p>
            <h2 style={{ margin: "10px 0", fontSize: "32px", color: "#111" }}>{totalUnduhan}</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Belum ada data unduhan</p>
          </div>
          <div style={{ ...boxStyle, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Rating rata-rata</p>
            <h2 style={{ margin: "10px 0", fontSize: "32px", color: "#111" }}>{ratingRataRata} / 5</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Belum ada ulasan</p>
          </div>
        </div>

        {/* Form Tambah Game */}
        {showForm && (
          <div style={{ ...boxStyle, marginBottom: "20px" }}>
            <h3 style={{ marginTop: 0 }}>Tambah Game Baru</h3>
            <form onSubmit={handleTambahGame} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
              <input type="text" placeholder="Judul Game" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
              <textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
              <input type="number" placeholder="Harga (cth: 50000)" required value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
              <button type="submit" style={{ padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Simpan Game</button>
            </form>
          </div>
        )}

        {/* Tabel List Game */}
        <div style={{ ...boxStyle, marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Game saya</h3>
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#fcd34d", color: "#333" }}>
                <th style={{ padding: "10px" }}>GAME</th>
                <th style={{ padding: "10px" }}>STATUS</th>
                <th style={{ padding: "10px" }}>UNDUHAN</th>
                <th style={{ padding: "10px" }}>RATING</th>
                <th style={{ padding: "10px" }}>HARGA</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#888" }}>Belum ada game. Klik "Tambah game" untuk mulai.</td></tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>
                      <div style={{ fontWeight: "bold" }}>{game.title}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Versi 1.0</div>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ backgroundColor: "#065f46", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>● Diterbitkan</span>
                    </td>
                    <td style={{ padding: "10px" }}>0</td> {/* Dummy sementara */}
                    <td style={{ padding: "10px" }}>★ 0.0</td> {/* Dummy sementara */}
                    <td style={{ padding: "10px" }}>{game.price === 0 ? "Gratis" : `Rp ${game.price}`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Grafik & Aktivitas */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ ...boxStyle, flex: 2 }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Unduhan 7 hari terakhir</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#666" }}>0 unduhan</p>
            
            {games.length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px", fontStyle: "italic" }}>Belum ada data unduhan karena game belum dipublikasikan.</p>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "150px" }}>
                {/* Grafik palsu pakai div */}
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#f59e0b", height: "0%" }}></div>
                <div style={{ flex: 1, backgroundColor: "#eab308", height: "0%" }}></div>
              </div>
            )}
          </div>

          <div style={{ ...boxStyle, flex: 1 }}>
            <h3 style={{ margin: "0 0 15px 0" }}>Aktivitas terbaru</h3>
            {games.length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px", fontStyle: "italic" }}>Belum ada aktivitas. Mulai dengan menambahkan game pertamamu!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <li>
                  <span style={{ color: "#065f46", fontWeight: "bold" }}>●</span> Game berhasil ditambahkan<br/>
                  <span style={{ fontSize: "12px", color: "#666" }}>Baru saja</span>
                </li>
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}