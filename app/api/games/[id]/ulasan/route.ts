import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Konteks = { params: Promise<{ id: string }> };

async function punyaGame(userId: string, gameId: string) {
  const transaksi = await prisma.transaction.findFirst({
    where: { userId, gameId, status: "SUCCESS" },
    select: { id: true },
  });
  return Boolean(transaksi);
}

export async function GET(request: Request, { params }: Konteks) {
  try {
    const { id: gameId } = await params;
    const me = new URL(request.url).searchParams.get("me");

    const [ulasan, unduhan] = await Promise.all([
      prisma.review.findMany({
        where: { gameId },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.transaction.groupBy({
        by: ["userId"],
        where: { gameId, status: "SUCCESS" },
      }),
    ]);

    const distribusi = [0, 0, 0, 0, 0];
    let total = 0;
    for (const item of ulasan) {
      distribusi[item.rating - 1] += 1;
      total += item.rating;
    }
    const jumlah = ulasan.length;

    let milikSaya = null;
    let punya = false;
    if (me) {
      punya = await punyaGame(me, gameId);
      milikSaya = ulasan.find((item) => item.userId === me) ?? null;
    }

    return NextResponse.json({
      ringkasan: {
        rata: jumlah === 0 ? 0 : Math.round((total / jumlah) * 10) / 10,
        jumlah,
        distribusi, // indeks 0 = bintang 1
        unduhan: unduhan.length,
      },
      ulasan: ulasan.map((item) => ({
        id: item.id,
        rating: item.rating,
        content: item.content,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: { id: item.user.id, name: item.user.name || "Pemain" },
      })),
      punyaGame: punya,
      milikSaya: milikSaya
        ? { id: milikSaya.id, rating: milikSaya.rating, content: milikSaya.content }
        : null,
    });
  } catch (error) {
    console.error("ERROR_GET_ULASAN", error);
    return NextResponse.json({ pesan: "Gagal memuat ulasan." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Konteks) {
  try {
    const { id: gameId } = await params;
    const body = await request.json().catch(() => ({}));
    const userId = typeof body.userId === "string" ? body.userId : "";
    const rating = Number(body.rating);
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!userId) return NextResponse.json({ pesan: "Silakan login dulu." }, { status: 401 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ pesan: "Pilih rating 1 sampai 5 bintang." }, { status: 400 });
    }
    if (content.length < 5) {
      return NextResponse.json({ pesan: "Ulasan minimal 5 karakter." }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ pesan: "Ulasan maksimal 1000 karakter." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ pesan: "Akun tidak ditemukan." }, { status: 401 });

    if (!(await punyaGame(userId, gameId))) {
      return NextResponse.json(
        { pesan: "Kamu harus memiliki game ini (membeli atau mengunduh) sebelum memberi ulasan." },
        { status: 403 },
      );
    }

    const ulasan = await prisma.review.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: { userId, gameId, rating, content },
      update: { rating, content },
    });
    return NextResponse.json({ pesan: "Ulasan tersimpan.", ulasan }, { status: 200 });
  } catch (error) {
    console.error("ERROR_POST_ULASAN", error);
    return NextResponse.json({ pesan: "Gagal menyimpan ulasan." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Konteks) {
  try {
    const { id: gameId } = await params;
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) return NextResponse.json({ pesan: "Silakan login dulu." }, { status: 401 });
    await prisma.review.deleteMany({ where: { gameId, userId } });
    return NextResponse.json({ pesan: "Ulasan dihapus." });
  } catch (error) {
    console.error("ERROR_HAPUS_ULASAN", error);
    return NextResponse.json({ pesan: "Gagal menghapus ulasan." }, { status: 500 });
  }
}
