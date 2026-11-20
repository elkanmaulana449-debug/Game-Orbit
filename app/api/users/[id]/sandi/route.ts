import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const me = typeof body.me === "string" ? body.me : "";
    const lama = typeof body.passwordLama === "string" ? body.passwordLama : "";
    const baru = typeof body.passwordBaru === "string" ? body.passwordBaru : "";

    if (!me || me !== id) return NextResponse.json({ pesan: "Tidak diizinkan" }, { status: 403 });
    if (baru.length < 6) {
      return NextResponse.json({ pesan: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id }, select: { password: true } });
    if (!user) return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    if (!(await bcrypt.compare(lama, user.password))) {
      return NextResponse.json({ pesan: "Kata sandi lama salah." }, { status: 400 });
    }
    await prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(baru, 10) } });
    return NextResponse.json({ pesan: "Kata sandi berhasil diubah." });
  } catch (error) {
    console.error("ERROR_UBAH_SANDI", error);
    return NextResponse.json({ pesan: "Gagal mengubah kata sandi" }, { status: 500 });
  }
}
