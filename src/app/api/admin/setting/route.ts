import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/models/model";

export async function GET() {
  try {
    await connectDB();
    // Ambil data pertama saja karena setting cuma ada satu
    const setting = await Setting.findOne();
    
    // Kalau belum ada data sama sekali, kirim objek kosong agar frontend tidak error
    return NextResponse.json(setting || {});
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Gunakan findOneAndUpdate dengan upsert: true
    // Artinya: Cari satu data, kalau ada di-update, kalau tidak ada dibuat baru
    const updatedSetting = await Setting.findOneAndUpdate(
      {}, // Filter kosong karena kita cuma punya satu dokumen setting
      { ...body },
      { 
        new: true,      // Kembalikan data yang sudah diupdate
        upsert: true,   // Buat baru jika belum ada
        runValidators: true // Jalankan validasi schema
      }
    );

    return NextResponse.json({ 
      message: "Setting berhasil diperbarui!", 
      data: updatedSetting 
    });
  } catch (error: any) {
    console.error("Error API Update:", error);
    return NextResponse.json({ error: error.message || "Gagal update setting" }, { status: 500 });
  }
}