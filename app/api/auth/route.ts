// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Tambahkan studioName di sini
    const { action, name, email, password, role, studioName } = body;

    // 1. REGISTER
    if (action === "register") {
      if (!email || !password) {
        return NextResponse.json({ pesan: "Email dan password wajib diisi!" }, { status: 400 });
      }

      const cekUser = await prisma.user.findUnique({ where: { email } });
      if (cekUser) {
        return NextResponse.json({ pesan: "Email sudah dipakai!" }, { status: 400 });
      }

      const passwordAcak = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name: name || "User Baru",
          email: email,
          password: passwordAcak,
          role: role || "USER",
          studioName: studioName || null, // <-- TAMBAHKAN INI
        },
      });

      return NextResponse.json({ pesan: "Berhasil daftar!" }, { status: 201 });
    }

    // 2. LOGIN
    if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ pesan: "Email belum terdaftar!" }, { status: 401 });
      }

      const cocok = await bcrypt.compare(password, user.password);
      if (!cocok) {
        return NextResponse.json({ pesan: "Password salah!" }, { status: 401 });
      }

      return NextResponse.json({ 
        pesan: "Login berhasil!", 
        // Tambahkan studioName biar kebaca pas login
        user: { id: user.id, name: user.name, role: user.role, studioName: user.studioName }
      }, { status: 200 });
    }

    return NextResponse.json({ pesan: "Action tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}