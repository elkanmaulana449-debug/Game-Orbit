// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { formatUser, userPublik } from "@/app/lib/chat";

// ==========================================
// GET: data singkat satu user (buat kartu profil di global chat)
//   -> nama, role, nama studio, status online/offline
// ==========================================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: userPublik,
    });

    if (!user) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user: formatUser(user) }, { status: 200 });
  } catch (error) {
    console.error("ERROR_PROFIL_USER", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}
