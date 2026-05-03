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
    let fileName = "";
    let targetFolder = path.join(process.cwd(), "public", "tte");
    
    if (type === "signature") fileName = "signature.png";
    else if (type === "stamp") fileName = "stamp.png";
    else if (type === "kop") {
      fileName = "kop.png";
      targetFolder = path.join(process.cwd(), "public");
    }

    const filePath = path.join(targetFolder, fileName);

    // Pastikan folder target sudah ada
    await fs.mkdir(targetFolder, { recursive: true });

    // Tulis/Timpah file (Simpan sebagai buffer)
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: type === "kop" ? `/${fileName}` : `/tte/${fileName}`
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Gagal upload file: " + error.message }, { status: 500 });
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