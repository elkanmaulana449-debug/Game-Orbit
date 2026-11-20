// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, studioName: true, status: true, createdAt: true,
        _count: { select: { gamesDeveloper: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ pesan: "Gagal ambil data user" }, { status: 500 });
  }
}