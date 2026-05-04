import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { nisn, nama, pdfBase64 } = await req.json();

    if (!nisn || !nama || !pdfBase64) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Tentukan folder penyimpanan
    const dir = path.join(process.cwd(), "public", "generate");

    // Buat folder jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Bersihkan nama untuk filename
    const cleanNama = nama.split(" ")[0].replace(/[^a-z0-9]/gi, "_").toUpperCase();
    const fileName = `SKL_${nisn}_${cleanNama}.pdf`;
    const filePath = path.join(dir, fileName);

    // Konversi base64 ke Buffer
    const buffer = Buffer.from(pdfBase64.split(",")[1], "base64");

    // Simpan file
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: "PDF berhasil disimpan",
      path: `/generate/${fileName}` 
    });
  } catch (error: any) {
    console.error("Error saving PDF:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
