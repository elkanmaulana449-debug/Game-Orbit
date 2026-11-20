import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Item = { id: string; judul: string; isi: string; href: string; waktu: string };

// GET /api/notifikasi?me=<id>  — isi tergantung peran:
//  USER: pesan chat belum dibaca · DEVELOPER: pembelian & ulasan baru · ADMIN: developer menunggu + pesan belum dibaca
export async function GET(request: Request) {
  try {
    const me = new URL(request.url).searchParams.get("me");
    if (!me) return NextResponse.json({ pesan: "Parameter 'me' wajib diisi!" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: me }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });

    const items: Item[] = [];

    const pesanBaru = await prisma.chatMessage.findMany({
      where: { receiverId: me, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, content: true, createdAt: true, sender: { select: { name: true } } },
    });
    for (const m of pesanBaru) {
      items.push({
        id: `chat-${m.id}`,
        judul: `Pesan dari ${m.sender.name || "Pengguna"}`,
        isi: m.content.slice(0, 80),
        href: "/chat",
        waktu: m.createdAt.toISOString(),
      });
    }

    if (user.role === "DEVELOPER") {
      const [beli, ulasan] = await Promise.all([
        prisma.transaction.findMany({
          where: { status: "SUCCESS", game: { developerId: me } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, createdAt: true, user: { select: { name: true } }, game: { select: { title: true } } },
        }),
        prisma.review.findMany({
          where: { game: { developerId: me } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, rating: true, createdAt: true, gameId: true, user: { select: { name: true } }, game: { select: { title: true } } },
        }),
      ]);
      for (const t of beli) {
        items.push({ id: `trx-${t.id}`, judul: `${t.user.name || "Pemain"} mendapatkan ${t.game.title}`, isi: "Unduhan/pembelian baru", href: "/dashboard/analitik", waktu: t.createdAt.toISOString() });
      }
      for (const r of ulasan) {
        items.push({ id: `rev-${r.id}`, judul: `Ulasan baru ${r.rating}★ untuk ${r.game.title}`, isi: `Dari ${r.user.name || "Pemain"}`, href: `/game/${r.gameId}`, waktu: r.createdAt.toISOString() });
      }
    }

    if (user.role === "ADMIN") {
      const menunggu = await prisma.user.findMany({
        where: { role: "DEVELOPER", status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, studioName: true, createdAt: true },
      });
      for (const d of menunggu) {
        items.push({ id: `dev-${d.id}`, judul: "Developer menunggu persetujuan", isi: d.studioName || d.name || "Developer baru", href: "/admin", waktu: d.createdAt.toISOString() });
      }
    }

    items.sort((a, b) => b.waktu.localeCompare(a.waktu));
    return NextResponse.json({ items: items.slice(0, 10), jumlah: items.length });
  } catch (error) {
    console.error("ERROR_NOTIFIKASI", error);
    return NextResponse.json({ pesan: "Gagal memuat notifikasi" }, { status: 500 });
  }
}
