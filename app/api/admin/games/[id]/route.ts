// app/api/admin/games/[id]/route.ts
// Admin mengubah status publikasi game: PUBLISHED, REVIEW, atau INACTIVE.
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const STATUS_VALID = ["PUBLISHED", "REVIEW", "INACTIVE"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { adminId, status } = await req.json();

    if (typeof adminId !== "string" || !STATUS_VALID.includes(status)) {
      return NextResponse.json({ pesan: "Data tidak valid!" }, { status: 400 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ pesan: "Hanya admin yang boleh mengubah status game." }, { status: 403 });
    }

    const game = await prisma.game.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ pesan: "Status game diperbarui.", game });
  } catch (error) {
    console.error("ERROR_STATUS_GAME", error);
    return NextResponse.json({ pesan: "Gagal mengubah status game." }, { status: 500 });
  }
}
