// app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f3f4f6",
      color: "#333"
    }}>
      
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
        Selamat Datang di GameOrbit
      </h1>
      
      <p style={{ fontSize: "18px", marginBottom: "30px", textAlign: "center", maxWidth: "600px" }}>
        Platform jual beli game indie terbaik. Temukan game impianmu, atau jual karyamu sendiri ke seluruh dunia.
      </p>

      <div style={{ display: "flex", gap: "15px" }}>
        <Link href="/store" style={{
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px"
        }}>
          Masuk ke Toko
        </Link>
        
        <Link href="/login" style={{
          padding: "10px 20px",
          backgroundColor: "#10b981",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px"
        }}>
          Login / Daftar
        </Link>
      </div>

      <p style={{ marginTop: "50px", fontSize: "12px", color: "#888" }}>
        &copy; 2024 GameOrbit. Dibuat untuk Tugas Sekolah.
      </p>
    </div>
  );
}