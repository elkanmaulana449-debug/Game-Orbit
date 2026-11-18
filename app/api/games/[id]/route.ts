// app/api/games/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { isGameGenre } from "@/app/lib/game-genres";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({
      where: { id },
      include: { developer: { select: { name: true, studioName: true } } },
    });

    if (!game) {
      return NextResponse.json({ pesan: "Game tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    console.error("ERROR_DETAIL_GAME", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const developerId = typeof body.developerId === "string" ? body.developerId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const genre = body.genre;
    const price = Number(body.price);

    if (!developerId || !title || !description || !isGameGenre(genre) || !Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json({ pesan: "Data game belum lengkap, genre tidak valid, atau harga tidak valid." }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      select: { developerId: true, developer: { select: { role: true, status: true } } },
    });
    if (!game || game.developerId !== developerId || game.developer.role !== "DEVELOPER" || game.developer.status !== "APPROVED") {
      return NextResponse.json({ pesan: "Game tidak ditemukan atau bukan milik developer ini." }, { status: 404 });
    }

    const updates: {
      title: string;
      description: string;
      genre: string;
      price: number;
      imageUrl?: string | null;
      videoUrl?: string | null;
    } = { title, description, genre, price };
    if (typeof body.imageUrl === "string" || body.removeImage === true) {
      updates.imageUrl = body.removeImage === true ? null : body.imageUrl;
    }
    if (typeof body.videoUrl === "string" || body.removeVideo === true) {
      updates.videoUrl = body.removeVideo === true ? null : body.videoUrl;
    }

    const updated = await prisma.game.update({ where: { id }, data: updates });
    const downloadCount = await prisma.transaction.count({ where: { gameId: id, status: "SUCCESS" } });
    return NextResponse.json({ pesan: "Game berhasil diperbarui.", game: { ...updated, downloadCount } });
  } catch (error) {
    console.error("ERROR_UPDATE_GAME", error);
    const detail = error instanceof Error ? error.message : "Penyebab tidak diketahui.";
    return NextResponse.json({
      pesan: process.env.NODE_ENV === "development"
        ? `Gagal memperbarui game: ${detail}`
        : "Gagal memperbarui game.",
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const searchParams = new URL(req.url).searchParams;
    const developerId = searchParams.get("developerId");
    const adminId = searchParams.get("adminId");
    if (!developerId && !adminId) return NextResponse.json({ pesan: "Akun penghapus tidak valid." }, { status: 400 });

    const game = await prisma.game.findUnique({
      where: { id },
      select: { developerId: true, developer: { select: { role: true, status: true } } },
    });
    if (!game) return NextResponse.json({ pesan: "Game tidak ditemukan." }, { status: 404 });

    if (adminId) {
      const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
      if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json({ pesan: "Hanya admin yang dapat menghapus game ini." }, { status: 403 });
      }
    } else if (
      game.developerId !== developerId ||
      game.developer.role !== "DEVELOPER" ||
      game.developer.status !== "APPROVED"
    ) {
      return NextResponse.json({ pesan: "Game bukan milik developer ini atau akun belum disetujui." }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { gameId: id } }),
      prisma.game.delete({ where: { id } }),
    ]);
    return NextResponse.json({ pesan: "Game dan data kepemilikan terkait berhasil dihapus." });
  } catch (error) {
    console.error("ERROR_HAPUS_GAME", error);
    return NextResponse.json({ pesan: "Gagal menghapus game." }, { status: 500 });
  }
}
