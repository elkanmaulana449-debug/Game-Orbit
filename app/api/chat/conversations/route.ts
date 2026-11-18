// app/api/chat/conversations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { formatUser, userPublik } from "@/app/lib/chat";

// ==========================================
// GET: daftar percakapan personal milik user
//   /api/chat/conversations?me=<id user>
// Percakapan baru muncul setelah ada pesan pertama.
// ==========================================
export async function GET(req: Request) {
  try {
    const me = new URL(req.url).searchParams.get("me");
    if (!me) {
      return NextResponse.json({ pesan: "Parameter 'me' wajib diisi!" }, { status: 400 });
    }

    // Semua pesan personal yang melibatkan user ini, terbaru dulu.
    // (Cukup untuk skala kecil; kalau pesan sudah sangat banyak, ganti dengan query SQL terkelompok.)
    const rows = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: me, receiverId: { not: null } }, { receiverId: me }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        content: true,
        createdAt: true,
        isRead: true,
        senderId: true,
        receiverId: true,
        sender: { select: userPublik },
        receiver: { select: userPublik },
      },
    });

    const percakapan = new Map<
      string,
      {
        user: ReturnType<typeof formatUser>;
        lastMessage: { content: string; createdAt: Date; dariSaya: boolean };
        unread: number;
      }
    >();

    for (const m of rows) {
      const dariSaya = m.senderId === me;
      const lawan = dariSaya ? m.receiver : m.sender;
      if (!lawan) continue;

      let item = percakapan.get(lawan.id);
      if (!item) {
        // pesan pertama yang ditemui = pesan terbaru (karena urut desc)
        item = {
          user: formatUser(lawan),
          lastMessage: { content: m.content, createdAt: m.createdAt, dariSaya },
          unread: 0,
        };
        percakapan.set(lawan.id, item);
      }
      if (!dariSaya && !m.isRead) item.unread += 1;
    }

    const conversations = [...percakapan.values()];
    const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);

    return NextResponse.json({ conversations, totalUnread }, { status: 200 });
  } catch (error) {
    console.error("ERROR_DAFTAR_PERCAKAPAN", error);
    return NextResponse.json({ pesan: "Gagal mengambil percakapan" }, { status: 500 });
  }
}
