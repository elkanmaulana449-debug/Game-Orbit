// app/api/chat/[userId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  bacaSetelah,
  bersihkanPesan,
  formatUser,
  userPublik,
} from "@/app/lib/chat";

type Ctx = { params: Promise<{ userId: string }> };

const BATAS_AWAL = 100;

// ==========================================
// GET: pesan personal antara "me" dan userId
//   /api/chat/<userId>?me=<id user>
//   /api/chat/<userId>?me=<id user>&setelah=<tanggal ISO>  (polling)
// Pesan dari lawan bicara otomatis ditandai sudah dibaca.
// ==========================================
export async function GET(req: Request, { params }: Ctx) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const me = searchParams.get("me");
    const setelah = bacaSetelah(searchParams.get("setelah"));

    if (!me) {
      return NextResponse.json({ pesan: "Parameter 'me' wajib diisi!" }, { status: 400 });
    }
    if (me === userId) {
      return NextResponse.json({ pesan: "Tidak bisa chat dengan diri sendiri" }, { status: 400 });
    }

    const lawan = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublik,
    });
    if (!lawan) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    const antaraKami = {
      OR: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    };
    const pilih = {
      id: true,
      content: true,
      createdAt: true,
      isRead: true,
      senderId: true,
    } as const;

    const messages = setelah
      ? await prisma.chatMessage.findMany({
          where: { ...antaraKami, createdAt: { gt: setelah } },
          orderBy: { createdAt: "asc" },
          take: 100,
          select: pilih,
        })
      : (
          await prisma.chatMessage.findMany({
            where: antaraKami,
            orderBy: { createdAt: "desc" },
            take: BATAS_AWAL,
            select: pilih,
          })
        ).reverse();

    // Tandai pesan dari lawan bicara sebagai sudah dibaca
    await prisma.chatMessage.updateMany({
      where: { senderId: userId, receiverId: me, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ user: formatUser(lawan), messages }, { status: 200 });
  } catch (error) {
    console.error("ERROR_PERSONAL_CHAT_GET", error);
    return NextResponse.json({ pesan: "Gagal mengambil percakapan" }, { status: 500 });
  }
}

// ==========================================
// POST: kirim pesan personal ke userId
//   body: { senderId, content }
// Percakapan otomatis "terbentuk" saat pesan pertama terkirim.
// ==========================================
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { userId: receiverId } = await params;
    const body = await req.json();
    const { senderId } = body;
    const content = bersihkanPesan(body.content);

    if (!senderId || !content) {
      return NextResponse.json(
        { pesan: "Pesan kosong atau terlalu panjang (maks 1000 karakter)!" },
        { status: 400 },
      );
    }
    if (senderId === receiverId) {
      return NextResponse.json({ pesan: "Tidak bisa chat dengan diri sendiri" }, { status: 400 });
    }

    const [pengirim, penerima] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } }),
    ]);
    if (!pengirim || !penerima) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    const pesanBaru = await prisma.chatMessage.create({
      data: { content, senderId, receiverId },
      select: { id: true, content: true, createdAt: true, isRead: true, senderId: true },
    });

    return NextResponse.json({ message: pesanBaru }, { status: 201 });
  } catch (error) {
    console.error("ERROR_PERSONAL_CHAT_POST", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}
