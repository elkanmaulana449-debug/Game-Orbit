// app/api/developer/analitik/route.ts
// Ringkasan unduhan milik developer: grafik harian, perbandingan bulan lalu,
// pendapatan, dan aktivitas pembelian terbaru. Data dari transaksi SUCCESS.
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const HARI = 24 * 60 * 60 * 1000;

function kunciHari(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export async function GET(request: Request) {
  try {
    const developerId = new URL(request.url).searchParams.get("developerId");
    if (!developerId) {
      return NextResponse.json({ pesan: "developerId wajib diisi" }, { status: 400 });
    }

    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      select: { role: true },
    });
    if (!developer || developer.role !== "DEVELOPER") {
      return NextResponse.json({ pesan: "Akun developer tidak valid" }, { status: 403 });
    }

    const sekarang = new Date();
    const awalHariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
    const batas = new Date(awalHariIni.getTime() - 59 * HARI); // 60 hari terakhir

    const transaksi = await prisma.transaction.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: batas },
        game: { developerId },
      },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        user: { select: { name: true } },
        game: { select: { id: true, title: true, price: true } },
      },
    });

    // 30 hari terakhir per hari
    const harian: { tanggal: string; jumlah: number }[] = [];
    const peta = new Map<string, number>();
    for (const t of transaksi) {
      const k = kunciHari(t.createdAt);
      peta.set(k, (peta.get(k) ?? 0) + 1);
    }
    for (let i = 29; i >= 0; i--) {
      const d = new Date(awalHariIni.getTime() - i * HARI);
      harian.push({ tanggal: d.toISOString(), jumlah: peta.get(kunciHari(d)) ?? 0 });
    }

    const batas30 = awalHariIni.getTime() - 29 * HARI;
    const bulanIni = transaksi.filter((t) => t.createdAt.getTime() >= batas30);
    const bulanLalu = transaksi.length - bulanIni.length;
    const pendapatan30 = bulanIni.reduce((n, t) => n + t.game.price, 0);

    return NextResponse.json({
      harian,
      unduhan30Hari: bulanIni.length,
      unduhan30HariSebelumnya: bulanLalu,
      pendapatan30Hari: pendapatan30,
      aktivitas: transaksi.slice(0, 5).map((t) => ({
        pembeli: t.user.name || "Pemain",
        game: t.game.title,
        waktu: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("ERROR_ANALITIK_DEVELOPER", error);
    return NextResponse.json({ pesan: "Gagal memuat analitik" }, { status: 500 });
  }
}
