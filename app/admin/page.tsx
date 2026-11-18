// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");
  
  const [games, setGames] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);

  const ambilData = async () => {
    try {
      const resGame = await fetch("/api/games");
      const dataGame = await resGame.json();
      if (resGame.ok) setGames(dataGame.games);

      const resUser = await fetch("/api/admin/users");
      const dataUser = await resUser.json();
      if (resUser.ok) setUsers(dataUser.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Kamu harus login dulu!");
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "ADMIN") {
      alert("Halaman ini khusus untuk Admin!");
      router.push("/store");
      return;
    }
    setUser(parsedUser);
    ambilData().finally(() => setLoading(false));
  }, [router]);

  const handleVerifikasi = async (developerId: string, statusBaru: string) => {
    const konfirmasi = confirm(`Yakin mau ${statusBaru === "APPROVED" ? "menyetujui" : "menolak"} developer ini?`);
    if (!konfirmasi) return;

    const res = await fetch("/api/admin/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developerId, statusBaru }),
    });

    const data = await res.json();
    alert(data.pesan);
    if (res.ok) ambilData();
  };

  const handleHapusGame = async (game: { id: string; title: string }) => {
    if (!user?.id) return;
    if (!confirm(`Hapus game “${game.title}”? Transaksi dan kepemilikan game ini juga akan dihapus.`)) return;

    setDeletingGameId(game.id);
    try {
      const response = await fetch(`/api/games/${game.id}?adminId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.pesan || "Game gagal dihapus.");
        return;
      }
      setGames((current) => current.filter((item) => item.id !== game.id));
      alert(data.pesan || "Game berhasil dihapus.");
    } catch (error) {
      console.error("ERROR_ADMIN_HAPUS_GAME", error);
      alert("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setDeletingGameId(null);
    }
  };

  if (loading || !user) return <p style={{ padding: "20px" }}>Memuat dashboard Admin...</p>;

  const boxStyle = { 
    backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", 
    border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#111", marginBottom: "20px" 
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f3f4f6" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "250px", backgroundColor: "#1e293b", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>ADMIN PANEL</p>
          <h2 style={{ margin: "5px 0 0 0" }}>GameOrbit</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div onClick={() => setActiveTab("ringkasan")} style={{ backgroundColor: activeTab === "ringkasan" ? "#334155" : "transparent", padding: "10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>📊 Ringkasan</div>
          <div onClick={() => setActiveTab("developer")} style={{ backgroundColor: activeTab === "developer" ? "#334155" : "transparent", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>👨‍💻 Persetujuan Developer</div>
          <div onClick={() => setActiveTab("games")} style={{ backgroundColor: activeTab === "games" ? "#334155" : "transparent", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>🎮 Data Game</div>
          <div onClick={() => setActiveTab("users")} style={{ backgroundColor: activeTab === "users" ? "#334155" : "transparent", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>👥 Data User</div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <Link href="/store" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px" }}>← Kembali ke Toko</Link>
        </div>
      </div>

      {/* KONTEN */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#111" }}>Dashboard Admin</h1>
        <p style={{ margin: "5px 0 20px 0", color: "#666" }}>Selamat datang, {user.name}. Kelola ekosistem GameOrbit.</p>

        {/* TAB RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <div style={{ ...boxStyle, flex: 1 }}><p style={{ margin: 0, color: "#555" }}>Total Game</p><h2 style={{ margin: "10px 0", fontSize: "32px" }}>{games.length}</h2></div>
              <div style={{ ...boxStyle, flex: 1 }}><p style={{ margin: 0, color: "#555" }}>Total User</p><h2 style={{ margin: "10px 0", fontSize: "32px" }}>{users.filter(u => u.role === "USER").length}</h2></div>
              <div style={{ ...boxStyle, flex: 1 }}><p style={{ margin: 0, color: "#555" }}>Total Developer</p><h2 style={{ margin: "10px 0", fontSize: "32px" }}>{users.filter(u => u.role === "DEVELOPER").length}</h2></div>
            </div>
            <div style={boxStyle}><h3 style={{ marginTop: 0 }}>Selamat datang di Panel Admin</h3><p style={{ color: "#555" }}>Gunakan menu di sebelah kiri untuk mengelola persetujuan developer, memantau game, dan melihat pengguna.</p></div>
          </div>
        )}

        {/* TAB PERSETUJUAN DEVELOPER */}
        {activeTab === "developer" && (
          <div style={boxStyle}>
            <h3 style={{ marginTop: 0 }}>Persetujuan Developer</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "15px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", color: "#333" }}>
                  <th style={{ padding: "10px" }}>NAMA STUDIO</th>
                  <th style={{ padding: "10px" }}>EMAIL</th>
                  <th style={{ padding: "10px" }}>STATUS</th>
                  <th style={{ padding: "10px" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === "DEVELOPER").length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#888" }}>Belum ada pendaftar developer.</td></tr>
                ) : (
                  users.filter(u => u.role === "DEVELOPER").map((dev) => (
                    <tr key={dev.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>{dev.studioName || "-"}</td>
                      <td style={{ padding: "10px" }}>{dev.email}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ 
                          backgroundColor: dev.status === "APPROVED" ? "#065f46" : dev.status === "PENDING" ? "#eab308" : "#ef4444", 
                          color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" 
                        }}>
                          {dev.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", display: "flex", gap: "5px" }}>
                        {dev.status === "PENDING" ? (
                          <>
                            <button onClick={() => handleVerifikasi(dev.id, "APPROVED")} style={{ padding: "5px 10px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Approve</button>
                            <button onClick={() => handleVerifikasi(dev.id, "REJECTED")} style={{ padding: "5px 10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Reject</button>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#888" }}>Sudah diproses</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB DATA GAME */}
        {activeTab === "games" && (
          <div style={boxStyle}>
            <h3 style={{ marginTop: 0 }}>Data Semua Game</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "15px" }}>
              <thead><tr style={{ backgroundColor: "#f1f5f9", color: "#333" }}><th style={{ padding: "10px" }}>JUDUL GAME</th><th style={{ padding: "10px" }}>HARGA</th><th style={{ padding: "10px" }}>AKSI</th></tr></thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>{game.title}</td>
                    <td style={{ padding: "10px" }}>Rp {game.price}</td>
                    <td style={{ padding: "10px" }}><button onClick={() => handleHapusGame(game)} disabled={deletingGameId === game.id} style={{ padding: "5px 10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: deletingGameId === game.id ? "wait" : "pointer", opacity: deletingGameId === game.id ? 0.65 : 1 }}>{deletingGameId === game.id ? "Menghapus..." : "Hapus"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB DATA USER */}
        {activeTab === "users" && (
          <div style={boxStyle}>
            <h3 style={{ marginTop: 0 }}>Data Semua User</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "15px" }}>
              <thead><tr style={{ backgroundColor: "#f1f5f9", color: "#333" }}><th style={{ padding: "10px" }}>NAMA</th><th style={{ padding: "10px" }}>EMAIL</th><th style={{ padding: "10px" }}>ROLE</th></tr></thead>
              <tbody>
                {users.filter(u => u.role === "USER").map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>{u.name || "-"}</td>
                    <td style={{ padding: "10px" }}>{u.email}</td>
                    <td style={{ padding: "10px" }}><span style={{ backgroundColor: "#3b82f6", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>USER</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
