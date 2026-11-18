import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const TIPE_MEDIA = new Map([
  ["image/jpeg", { folder: "images", ext: ".jpg", maxBytes: 10 * 1024 * 1024 }],
  ["image/png", { folder: "images", ext: ".png", maxBytes: 10 * 1024 * 1024 }],
  ["image/webp", { folder: "images", ext: ".webp", maxBytes: 10 * 1024 * 1024 }],
  ["image/gif", { folder: "images", ext: ".gif", maxBytes: 10 * 1024 * 1024 }],
  ["video/mp4", { folder: "videos", ext: ".mp4", maxBytes: 100 * 1024 * 1024 }],
  ["video/webm", { folder: "videos", ext: ".webm", maxBytes: 100 * 1024 * 1024 }],
]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const developerId = form.get("developerId");
    if (!(file instanceof File) || typeof developerId !== "string") {
      return NextResponse.json({ pesan: "File dan akun developer wajib diisi." }, { status: 400 });
    }

    const config = TIPE_MEDIA.get(file.type);
    if (!config) {
      return NextResponse.json({ pesan: "Format yang didukung: JPG, PNG, WEBP, GIF, MP4, atau WEBM." }, { status: 400 });
    }
    if (file.size === 0 || file.size > config.maxBytes) {
      const batas = config.folder === "images" ? "10 MB" : "100 MB";
      return NextResponse.json({ pesan: `Ukuran file harus lebih dari 0 dan maksimal ${batas}.` }, { status: 400 });
    }

    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      select: { role: true, status: true },
    });
    if (!developer || developer.role !== "DEVELOPER" || developer.status !== "APPROVED") {
      return NextResponse.json({ pesan: "Akun developer belum disetujui atau tidak valid." }, { status: 403 });
    }

    const folder = path.join(process.cwd(), "public", "uploads", config.folder);
    await mkdir(folder, { recursive: true });
    const fileName = `${randomUUID()}${config.ext}`;
    await writeFile(path.join(folder, fileName), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${config.folder}/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("ERROR_UPLOAD_MEDIA", error);
    return NextResponse.json({ pesan: "Gagal mengunggah file." }, { status: 500 });
  }
}
