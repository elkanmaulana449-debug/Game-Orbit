// app/api/admin/verifikasi/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { developerId, statusBaru } = body;

    if (!developerId || !statusBaru) {
      return NextResponse.json({ pesan: "Data tidak lengkap!" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: developerId },
      data: { status: statusBaru },
    });

    return NextResponse.json({ pesan: `Developer berhasil di-${statusBaru}!` }, { status: 200 });
  } catch (error) {
    console.error("ERROR_VERIFIKASI", error);
    return NextResponse.json({ pesan: "Gagal verifikasi developer" }, { status: 500 });
  }
}