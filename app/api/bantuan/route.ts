import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Pesan bantuan = chat personal ke admin pertama.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = typeof body.userId === "string" ? body.userId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!userId) return NextResponse.json({ pesan: "Silakan login dulu." }, { status: 401 });
    if (content.length < 5 || content.length > 1000) {
      return NextResponse.json({ pesan: "Pesan harus 5–1000 karakter." }, { status: 400 });
    }
    const [pengirim, admin] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
      prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } }),
    ]);
    if (!pengirim) return NextResponse.json({ pesan: "Akun tidak ditemukan." }, { status: 401 });
    if (!admin) return NextResponse.json({ pesan: "Admin belum tersedia saat ini." }, { status: 503 });
    if (admin.id === pengirim.id) return NextResponse.json({ pesan: "Kamu adalah admin." }, { status: 400 });

    await prisma.chatMessage.create({
      data: { content: `[Bantuan] ${content}`, senderId: pengirim.id, receiverId: admin.id },
    });
    return NextResponse.json({ pesan: "Terkirim." }, { status: 201 });
  } catch (error) {
    console.error("ERROR_BANTUAN", error);
    return NextResponse.json({ pesan: "Gagal mengirim pesan." }, { status: 500 });
  }
}
