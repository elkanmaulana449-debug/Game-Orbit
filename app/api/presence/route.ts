// app/api/presence/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ONLINE_WINDOW_MS } from "@/app/lib/chat";

// ==========================================
// GET: jumlah user yang sedang online & total anggota
//   -> dipakai untuk "128 online • 2.408 anggota" di header global chat
// ==========================================
export async function GET() {
  try {
    const batas = new Date(Date.now() - ONLINE_WINDOW_MS);
    const [online, total] = await Promise.all([
      prisma.user.count({ where: { lastSeenAt: { gt: batas } } }),
      prisma.user.count(),
    ]);

    return NextResponse.json({ online, total }, { status: 200 });
  } catch (error) {
    console.error("ERROR_PRESENCE_GET", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ==========================================
// POST: "heartbeat" — tandai user sedang aktif sekarang
//   body: { userId }
// Dipanggil berkala (mis. tiap 60 detik) dari halaman chat.
// ==========================================
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ pesan: "userId wajib diisi!" }, { status: 400 });
    }

    const hasil = await prisma.user.updateMany({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });

    if (hasil.count === 0) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("ERROR_PRESENCE", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}
