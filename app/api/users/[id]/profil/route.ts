// app/api/users/[id]/profil/route.ts
// Data profil milik sendiri: email, tanggal bergabung, jumlah & daftar game koleksi.
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const me = new URL(request.url).searchParams.get("me");

    // Email bersifat pribadi: hanya boleh dilihat pemilik akun.
    // (Catatan: `me` dikirim dari client, sama seperti API chat. Untuk keamanan
    // sungguhan perlu session server-side, mis. next-auth.)
    if (!me || me !== id) {
      return NextResponse.json({ pesan: "Tidak diizinkan" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, studioName: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    const where = { userId: id, status: "SUCCESS" };
    const [jumlahKoleksi, terbaru] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          createdAt: true,
          game: { select: { id: true, title: true, imageUrl: true } },
        },
      }),
    ]);

    return NextResponse.json({
      user: { ...user, createdAt: user.createdAt.toISOString() },
      jumlahKoleksi,
      terbaru: terbaru.map((t) => ({
        id: t.game.id,
        title: t.game.title,
        imageUrl: t.game.imageUrl,
        diperolehPada: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("ERROR_GET_PROFIL", error);
    return NextResponse.json({ pesan: "Gagal memuat profil" }, { status: 500 });
  }
}
