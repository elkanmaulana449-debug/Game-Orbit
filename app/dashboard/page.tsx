"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GAME_GENRES } from "@/app/lib/game-genres";

type DeveloperUser = { id: string; name: string | null; studioName: string | null; role: string };
type DeveloperGame = {
  id: string;
  title: string;
  description: string;
  genre: string;
  price: number;
  imageUrl: string | null;
  videoUrl: string | null;
  developerId: string;
  downloadCount: number;
};
type TabDashboard = "ringkasan" | "games" | "analitik";

const boxStyle = {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgba(0,0,0,.08)",
  color: "#111827",
};

export default function DashboardDeveloper() {
  const router = useRouter();
  const [user, setUser] = useState<DeveloperUser | null>(null);
  const [games, setGames] = useState<DeveloperGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabDashboard>("ringkasan");
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<DeveloperGame | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string>("Lainnya");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let aktif = true;
    let parsedUser: DeveloperUser | null = null;
    try {
      const raw = localStorage.getItem("user");
      parsedUser = raw ? JSON.parse(raw) as DeveloperUser : null;
    } catch {
      localStorage.removeItem("user");
    }
    if (!parsedUser) {
      router.replace("/login");
      return;
    }
    if (parsedUser.role !== "DEVELOPER" && parsedUser.role !== "ADMIN") {
      router.replace("/store");
      return;
    }
    // localStorage hanya tersedia di browser; sinkronkan sesi setelah halaman mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser);

    fetch(`/api/games?developerId=${encodeURIComponent(parsedUser.id)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.pesan || "Gagal memuat game.");
        if (aktif) setGames(data.games ?? []);
      })
      .catch((error) => { console.error("ERROR_DASHBOARD_GAMES", error); if (aktif) alert(error.message || "Gagal memuat game."); })
      .finally(() => { if (aktif) setLoading(false); });

    return () => { aktif = false; };
  }, [router]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setGenre("Lainnya"); setPrice(""); setImageFile(null); setVideoFile(null);
    setRemoveImage(false); setRemoveVideo(false); setEditingGame(null); setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setTab("games");
    setShowForm(true);
  };

  const startEdit = (game: DeveloperGame) => {
    setEditingGame(game); setTitle(game.title); setDescription(game.description); setGenre(game.genre || "Lainnya"); setPrice(String(game.price));
    setImageFile(null); setVideoFile(null); setRemoveImage(false); setRemoveVideo(false);
    setTab("games"); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadMedia = async (file: File) => {
    if (!user) throw new Error("Sesi developer tidak ditemukan.");
    const form = new FormData();
    form.set("file", file);
    form.set("developerId", user.id);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.pesan || "Gagal mengunggah media.");
    return data.url as string;
  };

  const saveGame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    try {
      let imageUrl = editingGame?.imageUrl ?? null;
      let videoUrl = editingGame?.videoUrl ?? null;
      if (imageFile) imageUrl = await uploadMedia(imageFile);
      else if (removeImage) imageUrl = null;
      if (videoFile) videoUrl = await uploadMedia(videoFile);
      else if (removeVideo) videoUrl = null;

      const res = await fetch(editingGame ? `/api/games/${editingGame.id}` : "/api/games", {
        method: editingGame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, genre, price, developerId: user.id, imageUrl, videoUrl, removeImage, removeVideo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.pesan || "Gagal menyimpan game.");
      setGames((current) => editingGame
        ? current.map((game) => game.id === editingGame.id ? data.game : game)
        : [data.game, ...current]);
      alert(data.pesan || "Game berhasil disimpan.");
      resetForm();
    } catch (error) {
      console.error("ERROR_SIMPAN_GAME", error);
      alert(error instanceof Error ? error.message : "Gagal menyimpan game.");
    } finally {
      setSaving(false);
    }
  };

  const deleteGame = async (game: DeveloperGame) => {
    if (!user || !confirm(`Hapus “${game.title}”? Transaksi dan kepemilikan game ini juga akan dihapus.`)) return;
    try {
      const res = await fetch(`/api/games/${game.id}?developerId=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.pesan || "Game gagal dihapus.");
      setGames((current) => current.filter((item) => item.id !== game.id));
      alert(data.pesan || "Game berhasil dihapus.");
    } catch (error) {
      console.error("ERROR_HAPUS_GAME", error);
      alert(error instanceof Error ? error.message : "Game gagal dihapus.");
    }
  };

  if (loading || !user) return <p style={{ padding: 20 }}>Memuat dashboard...</p>;

  const tabs: [TabDashboard, string][] = [["ringkasan", "📊 Ringkasan"], ["games", "🎮 Game saya"], ["analitik", "📈 Analitik"]];
  const rupiah = (value: number) => value === 0 ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  const totalUnduhan = games.reduce((total, game) => total + game.downloadCount, 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", background: "#f3f4f6", color: "#111827" }}>
      <aside style={{ width: 250, flexShrink: 0, background: "#d97706", color: "white", padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
        <strong style={{ fontSize: 13, letterSpacing: 1 }}>DEVELOPER HUB</strong>
        <nav style={{ display: "grid", gap: 8 }}>
          {tabs.map(([id, label]) => <button key={id} onClick={() => { setTab(id); setShowForm(false); }} style={{ padding: 12, border: 0, borderRadius: 6, textAlign: "left", background: tab === id ? "#f59e0b" : "transparent", color: "white", fontWeight: tab === id ? 700 : 400, cursor: "pointer" }}>{label}</button>)}
        </nav>
        <div style={{ marginTop: "auto", fontSize: 13, opacity: .9 }}>{user.studioName || user.name}</div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: 30 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 22 }}>
          <div>
            <p style={{ margin: "0 0 5px", color: "#6b7280", fontSize: 13 }}>DEVELOPER HUB / {tabs.find(([id]) => id === tab)?.[1].replace(/^\S+\s/, "").toUpperCase()}</p>
            <h1 style={{ margin: 0, fontSize: 28 }}>Selamat datang, {user.studioName || user.name}.</h1>
            <p style={{ margin: "7px 0 0", color: "#6b7280" }}>Kelola karya dan pantau performa game kamu.</p>
          </div>
          <button onClick={startCreate} style={{ padding: "12px 18px", border: 0, borderRadius: 6, background: "#eab308", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Tambah game</button>
        </header>

        {tab === "ringkasan" && <>
          <section style={{ background: "#065f46", color: "white", padding: 16, borderRadius: 7, marginBottom: 20 }}>
            <strong>Akun developer disetujui</strong>
            <p style={{ margin: "5px 0 0", fontSize: 14 }}>Studio kamu sudah terverifikasi. Kamu dapat mengunggah dan mengelola game.</p>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginBottom: 20 }}>
            {[["Game saya", String(games.length).padStart(2, "0"), `${games.length} game terdaftar`], ["Pembelian / unduhan", String(totalUnduhan), "Total transaksi berhasil"], ["Rating rata-rata", "— / 5", "Belum ada ulasan"]].map(([label, value, note]) => <div key={label} style={boxStyle}><p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>{label}</p><strong style={{ display: "block", margin: "12px 0", fontSize: 30 }}>{value}</strong><span style={{ color: "#6b7280", fontSize: 12 }}>{note}</span></div>)}
          </section>
        </>}

        {tab === "analitik" && <section style={{ ...boxStyle, marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>Analitik game</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}><span style={{ color: "#6b7280", fontSize: 13 }}>Pembelian / unduhan</span><h3 style={{ marginBottom: 4 }}>{totalUnduhan}</h3><small>Dari transaksi yang berhasil</small></div>
            <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}><span style={{ color: "#6b7280", fontSize: 13 }}>Transaksi berhasil</span><h3 style={{ marginBottom: 4 }}>Belum tersedia</h3><small>Ringkasan transaksi belum dibuat</small></div>
            <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}><span style={{ color: "#6b7280", fontSize: 13 }}>Rating</span><h3 style={{ marginBottom: 4 }}>Belum ada</h3><small>Belum ada ulasan pemain</small></div>
          </div>
          <p style={{ marginBottom: 0, color: "#6b7280", fontSize: 13 }}>Grafik analitik akan terisi setelah data unduhan dan ulasan tersedia.</p>
        </section>}

        {tab === "games" && showForm && <section style={{ ...boxStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ marginTop: 0 }}>{editingGame ? "Ubah game" : "Tambah game baru"}</h2>
            <button type="button" onClick={resetForm} aria-label="Tutup form" style={{ border: 0, background: "transparent", fontSize: 24, cursor: "pointer" }}>×</button>
          </div>
          <form onSubmit={saveGame} style={{ display: "grid", gap: 14, maxWidth: 720 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Judul game<input required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} /></label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Deskripsi<textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} /></label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Genre
              <select required value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle}>
                {GAME_GENRES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Harga dalam rupiah<input required type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} /></label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Gambar sampul (JPG, PNG, WEBP, GIF; maksimal 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); setRemoveImage(false); }} /></label>
            {editingGame?.imageUrl && <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}><img src={editingGame.imageUrl} alt="Gambar game saat ini" style={{ width: 100, height: 60, borderRadius: 5, objectFit: "cover" }} /><a href={editingGame.imageUrl} target="_blank" rel="noreferrer">Lihat gambar saat ini</a><label><input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Hapus gambar</label></div>}
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Video game (MP4, WEBM; maksimal 100 MB)<input type="file" accept="video/mp4,video/webm" onChange={(e) => { setVideoFile(e.target.files?.[0] ?? null); setRemoveVideo(false); }} /></label>
            {editingGame?.videoUrl && <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}><video src={editingGame.videoUrl} controls style={{ width: 150, maxHeight: 85, borderRadius: 5 }} /><label><input type="checkbox" checked={removeVideo} onChange={(e) => setRemoveVideo(e.target.checked)} /> Hapus video</label></div>}
            <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>File baru akan menggantikan file lama setelah disimpan.</p>
            <div style={{ display: "flex", gap: 8 }}><button disabled={saving} type="submit" style={{ ...primaryButton, opacity: saving ? .7 : 1 }}>{saving ? "Mengunggah dan menyimpan..." : editingGame ? "Simpan perubahan" : "Simpan game"}</button><button type="button" onClick={resetForm} style={secondaryButton}>Batal</button></div>
          </form>
        </section>}

        {(tab === "ringkasan" || tab === "games") && <section style={boxStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{tab === "ringkasan" ? "Game terbaru" : "Game saya"}</h2>
            {tab === "games" && !showForm && <button onClick={startCreate} style={primaryButton}>+ Tambah game</button>}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: tab === "games" ? 760 : 600 }}>
              <thead><tr style={{ background: "#fcd34d" }}>{["GAME", "STATUS", "UNDUHAN", "RATING", "HARGA", ...(tab === "games" ? ["AKSI"] : [])].map((head) => <th key={head} style={thStyle}>{head}</th>)}</tr></thead>
              <tbody>
                {games.length === 0 ? <tr><td colSpan={tab === "games" ? 6 : 5} style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>Belum ada game. Tambahkan game pertamamu.</td></tr> : games.slice(0, tab === "ringkasan" ? 5 : undefined).map((game) => <tr key={game.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}><div style={{ display: "flex", gap: 10, alignItems: "center" }}>{game.imageUrl ? <img src={game.imageUrl} alt="" style={{ width: 54, height: 38, borderRadius: 4, objectFit: "cover" }} /> : <div style={{ width: 54, height: 38, borderRadius: 4, background: "#ede9fe" }} />}<div><strong>{game.title}</strong><div style={{ fontSize: 11, color: "#6b7280" }}>{game.videoUrl ? "Gambar + video" : game.imageUrl ? "Dengan gambar" : "Versi 1.0"}</div></div></div></td>
                  <td style={tdStyle}><span style={{ borderRadius: 20, background: "#065f46", color: "white", padding: "4px 8px", fontSize: 11 }}>● Diterbitkan</span></td>
                  <td style={tdStyle}>{game.downloadCount}</td><td style={tdStyle}>—</td><td style={tdStyle}>{rupiah(game.price)}</td>
                  {tab === "games" && <td style={tdStyle}><div style={{ display: "flex", gap: 6 }}><button onClick={() => startEdit(game)} style={secondaryButton}>Ubah</button><button onClick={() => deleteGame(game)} style={deleteButton}>Hapus</button></div></td>}
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>}
      </main>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, font: "inherit" };
const thStyle = { padding: 11, fontSize: 12, whiteSpace: "nowrap" as const };
const tdStyle = { padding: 11, fontSize: 13, verticalAlign: "middle" as const };
const primaryButton = { padding: "9px 13px", border: 0, borderRadius: 5, background: "#eab308", color: "#111827", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: "white", color: "#111827", cursor: "pointer" };
const deleteButton = { padding: "7px 10px", border: "1px solid #fecaca", borderRadius: 5, background: "#fff1f2", color: "#b91c1c", cursor: "pointer" };
