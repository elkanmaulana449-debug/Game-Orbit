// app/api/games/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// ==========================================
// 1. FUNGSI POST (Buat Nambah Game Baru)
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, price, developerId } = body;

    if (!title || !price || !developerId) {
      return NextResponse.json({ pesan: "Judul, Harga, dan ID Developer wajib diisi!" }, { status: 400 });
    }

    // Simpan game baru ke database
    const gameBaru = await prisma.game.create({
      data: {
        title: title,
        description: description || "Tidak ada deskripsi.",
        price: parseInt(price), // Pastiin harganya jadi angka (integer)
        developerId: developerId,
      },
    });

    return NextResponse.json({ pesan: "Game berhasil ditambahkan!", game: gameBaru }, { status: 201 });
  } catch (error) {
    console.error("ERROR_TAMBAH_GAME", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ==========================================
// 2. FUNGSI GET (Buat Ambil Semua Game)
// ==========================================
export async function GET() {
  try {
    const games = await prisma.game.findMany();
    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ pesan: "Gagal ambil data game" }, { status: 500 });
  }
}