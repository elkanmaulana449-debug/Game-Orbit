import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Gambar panel kiri halaman login & register, diambil dari cover game.
// login    = game paling baru
// register = satu game sebelum yang paling baru (kalau baru ada 1 game, sama dengan login)
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { imageUrl: { not: null }, status: { not: "INACTIVE" } },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { imageUrl: true },
    });
    const login = games[0]?.imageUrl ?? null;
    const register = games[1]?.imageUrl ?? login;
    return NextResponse.json({ login, register });
  } catch (error) {
    console.error("ERROR_AUTH_HERO", error);
    return NextResponse.json({ login: null, register: null });
  }
}
