import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type"); // 'signature' atau 'stamp'

    if (!file || !type) {
      return NextResponse.json({ error: "File atau tipe tidak ditemukan" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tentukan nama file tetap supaya otomatis tertimpa
    const fileName = type === "signature" ? "signature.png" : "stamp.png";
    const filePath = path.join(process.cwd(), "public", "tte", fileName);

    // Pastikan folder public/tte sudah ada
    await fs.mkdir(path.join(process.cwd(), "public", "tte"), { recursive: true });

    // Tulis/Timpah file
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/tte/${fileName}?t=${Date.now()}` // Tambah timestamp agar browser tidak cache gambar lama
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal upload file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type } = await req.json(); // 'signature' atau 'stamp'
    const fileName = type === "signature" ? "signature.png" : "stamp.png";
    const filePath = path.join(process.cwd(), "public", "tte", fileName);

    await fs.unlink(filePath);

    return NextResponse.json({ success: true, message: "File berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus file atau file tidak ditemukan" }, { status: 500 });
  }
}