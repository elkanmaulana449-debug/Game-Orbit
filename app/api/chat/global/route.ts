// app/api/chat/global/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  bacaSetelah,
  bersihkanPesan,
  formatUser,
  userPublik,
} from "@/app/lib/chat";

const BATAS_AWAL = 50; // jumlah pesan saat pertama kali membuka global chat

// ==========================================
// GET: ambil pesan global chat
//   /api/chat/global                      -> 50 pesan terbaru
//   /api/chat/global?setelah=<tanggal ISO> -> hanya pesan yang lebih baru (polling)
// ==========================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const setelah = bacaSetelah(searchParams.get("setelah"));

    const pilih = {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: userPublik },
    } as const;

    const rows = setelah
      ? await prisma.chatMessage.findMany({
          where: { receiverId: null, createdAt: { gt: setelah } },
          orderBy: { createdAt: "asc" },
          take: 100,
          select: pilih,
        })
      : (
          await prisma.chatMessage.findMany({
            where: { receiverId: null },
            orderBy: { createdAt: "desc" },
            take: BATAS_AWAL,
            select: pilih,
          })
        ).reverse();

    const messages = rows.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      sender: formatUser(m.sender),
    }));

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("ERROR_GLOBAL_CHAT_GET", error);
    return NextResponse.json({ pesan: "Gagal mengambil global chat" }, { status: 500 });
  }
}

// ==========================================
// POST: kirim pesan ke global chat
//   body: { senderId, content }
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderId } = body;
    const content = bersihkanPesan(body.content);

    if (!senderId || !content) {
      return NextResponse.json(
        { pesan: "Pesan kosong atau terlalu panjang (maks 1000 karakter)!" },
        { status: 400 },
      );
    }

    const pengirim = await prisma.user.findUnique({
      where: { id: senderId },
      select: userPublik,
    });
    if (!pengirim) {
      return NextResponse.json({ pesan: "Pengirim tidak ditemukan" }, { status: 404 });
    }

    const pesanBaru = await prisma.chatMessage.create({
      data: { content, senderId, receiverId: null },
      select: { id: true, content: true, createdAt: true },
    });

    return NextResponse.json(
      { message: { ...pesanBaru, sender: formatUser(pengirim) } },
      { status: 201 },
    );
  } catch (error) {
    console.error("ERROR_GLOBAL_CHAT_POST", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}
