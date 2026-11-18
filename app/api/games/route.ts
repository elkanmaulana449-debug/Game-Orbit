import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { isGameGenre } from "@/app/lib/game-genres";

export async function GET(request: Request) {
  try {
    const developerId = new URL(request.url).searchParams.get("developerId");
    if (developerId) {
      const developer = await prisma.user.findUnique({
        where: { id: developerId },
        select: { role: true },
      });
      if (!developer || (developer.role !== "DEVELOPER" && developer.role !== "ADMIN")) {
        return NextResponse.json({ pesan: "Akun developer tidak ditemukan." }, { status: 403 });
      }
    }

    const games = await prisma.game.findMany({
      where: developerId ? { developerId } : undefined,
      include: { developer: { select: { id: true, name: true, studioName: true } } },
      orderBy: { createdAt: "desc" },
    });
    const gameIds = games.map((game) => game.id);
    const transaksiSukses = gameIds.length === 0 ? [] : await prisma.transaction.groupBy({
      by: ["gameId"],
      where: { gameId: { in: gameIds }, status: "SUCCESS" },
      _count: { _all: true },
    });
    const jumlahPerGame = new Map(transaksiSukses.map((row) => [row.gameId, row._count._all]));
    return NextResponse.json({
      games: games.map((game) => ({ ...game, downloadCount: jumlahPerGame.get(game.id) ?? 0 })),
    }, { status: 200 });
  } catch (error) {
    console.error("ERROR_DAFTAR_GAME", error);
    return NextResponse.json({ pesan: "Gagal memuat daftar game" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const genre = body.genre;
    const price = Number(body.price);
    const developerId = typeof body.developerId === "string" ? body.developerId : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl : null;

    if (!title || !description || !isGameGenre(genre) || !developerId || !Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json(
        { pesan: "Judul, deskripsi, genre, developer, dan harga valid wajib diisi." },
        { status: 400 },
      );
    }

    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      select: { role: true, status: true },
    });
    if (!developer || developer.role !== "DEVELOPER" || developer.status !== "APPROVED") {
      return NextResponse.json({ pesan: "Akun developer belum disetujui atau tidak valid." }, { status: 403 });
    }

    const game = await prisma.game.create({
      data: { title, description, genre, price, developerId, imageUrl, videoUrl },
    });
    return NextResponse.json({ pesan: "Game berhasil ditambahkan!", game: { ...game, downloadCount: 0 } }, { status: 201 });
  } catch (error) {
    console.error("ERROR_TAMBAH_GAME", error);
    const detail = error instanceof Error ? error.message : "Penyebab tidak diketahui.";
    return NextResponse.json({
      pesan: process.env.NODE_ENV === "development"
        ? `Gagal menambahkan game: ${detail}`
        : "Gagal menambahkan game.",
    }, { status: 500 });
  }
}
