// app/api/koleksi/route.ts
// Daftar game yang sudah dibeli (transaksi SUCCESS) oleh user.
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const me = new URL(request.url).searchParams.get("me");
    if (!me) {
      return NextResponse.json({ pesan: "Parameter me wajib diisi" }, { status: 400 });
    }

    const transaksi = await prisma.transaction.findMany({
      where: { userId: me, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        game: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            imageUrl: true,
            developer: { select: { name: true, studioName: true } },
          },
        },
      },
    });

    // Satu game cukup tampil sekali (ambil pembelian terbaru)
    const sudah = new Set<string>();
    const games = [];
    for (const t of transaksi) {
      if (sudah.has(t.game.id)) continue;
      sudah.add(t.game.id);
      games.push({
        id: t.game.id,
        title: t.game.title,
        description: t.game.description,
        price: t.game.price,
        imageUrl: t.game.imageUrl,
        developer: t.game.developer?.studioName || t.game.developer?.name || "Developer",
        diperolehPada: t.createdAt.toISOString(),
      });
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error("ERROR_GET_KOLEKSI", error);
    return NextResponse.json({ pesan: "Gagal memuat koleksi" }, { status: 500 });
  }
}
