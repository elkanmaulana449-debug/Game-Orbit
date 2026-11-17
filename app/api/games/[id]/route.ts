// app/api/games/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const game = await prisma.game.findUnique({
      where: { id: params.id },
    });

    if (!game) {
      return NextResponse.json({ pesan: "Game tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}