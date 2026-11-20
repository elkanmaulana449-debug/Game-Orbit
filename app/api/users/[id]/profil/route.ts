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
    const [jumlahKoleksi, jumlahUlasan, terbaru] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.review.count({ where: { userId: id } }),
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
      jumlahUlasan,
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

// Ubah nama (dan nama studio untuk developer/admin).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (typeof body.me !== "string" || body.me !== id) {
      return NextResponse.json({ pesan: "Tidak diizinkan" }, { status: 403 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ pesan: "Nama harus 2–60 karakter." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!user) return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });

    const data: { name: string; studioName?: string } = { name };
    if (user.role !== "USER" && typeof body.studioName === "string" && body.studioName.trim()) {
      data.studioName = body.studioName.trim().slice(0, 60);
    }
    const baru = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, role: true, studioName: true },
    });
    return NextResponse.json({ pesan: "Profil diperbarui.", user: baru });
  } catch (error) {
    console.error("ERROR_UBAH_PROFIL", error);
    return NextResponse.json({ pesan: "Gagal memperbarui profil" }, { status: 500 });
  }
}
