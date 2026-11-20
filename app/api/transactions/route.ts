// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, gameId } = body;

    if (!userId || !gameId) {
      return NextResponse.json({ pesan: "Data tidak lengkap!" }, { status: 400 });
    }

    // Game nonaktif tidak bisa dibeli / diunduh
    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { status: true } });
    if (!game) {
      return NextResponse.json({ pesan: "Game tidak ditemukan!" }, { status: 404 });
    }
    if (game.status === "INACTIVE") {
      return NextResponse.json({ pesan: "Game ini sedang tidak tersedia." }, { status: 400 });
    }

    // Cek apakah user udah pernah beli game ini sebelumnya
    const cekTransaksi = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        gameId: gameId,
        status: "SUCCESS", // Anggap aja kalau udah ada yang sukses, gabisa beli lagi
      },
    });

    if (cekTransaksi) {
      return NextResponse.json({ pesan: "Kamu sudah memiliki game ini!" }, { status: 400 });
    }

    // Simpan transaksi baru (anggep aja langsung SUCCESS biar gampang, nanti bisa dikembangin pakai payment gateway)
    const transaksiBaru = await prisma.transaction.create({
      data: {
        userId: userId,
        gameId: gameId,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ pesan: "Transaksi berhasil!", transaksi: transaksiBaru }, { status: 201 });
  } catch (error) {
    console.error("ERROR_TRANSAKSI", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}