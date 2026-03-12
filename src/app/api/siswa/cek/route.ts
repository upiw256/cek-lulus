import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Siswa, Setting } from "@/models/model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { nisn, tgl_lahir, captchaInput } = await req.json();

    // 1. Validasi Captcha
    const jawabanBenar = req.cookies.get("captcha_text")?.value;
    if (!captchaInput || captchaInput !== jawabanBenar) {
      return NextResponse.json(
        { error: "Aduh, jawaban matematikamu masih salah. Coba hitung lagi ya! 😊" }, 
        { status: 400 }
      );
    }

    // 2. Ambil Data Setting (Penting untuk Nama Kepsek & Nomor Surat di PDF)
    // Kita ambil satu data setting yang paling baru
    const dataSetting = await Setting.findOne().sort({ updatedAt: -1 });

    // 3. Cek apakah Web sedang dinonaktifkan (Offline) dari menu Setting
    if (dataSetting && dataSetting.is_active === false) {
       return NextResponse.json(
        { error: "Mohon maaf, pengumuman saat ini sedang ditutup oleh Admin. 🙏" }, 
        { status: 403 }
      );
    }

    // 4. Cari Siswa berdasarkan NISN dan Tanggal Lahir
    const dataSiswa = await Siswa.findOne({
      nisn: nisn,
      tgl_lahir: tgl_lahir
    });

    if (!dataSiswa) {
      return NextResponse.json(
        { error: "Maaf, NISN atau Tanggal Lahirmu tidak ditemukan. Cek lagi ya!" }, 
        { status: 404 }
      );
    }

    // 5. Kalau ketemu, kirim gabungan datanya!
    return NextResponse.json({
      message: "Data ditemukan!",
      data: {
        // Data Siswa
        ...dataSiswa.toObject(),
        // Data Setting disisipkan di sini agar bisa dibaca fungsi downloadPDF
        pengaturan: dataSetting || null 
      }
    });

  } catch (error) {
    console.error("Error Cek Kelulusan:", error);
    return NextResponse.json(
      { error: "Sistem lagi istirahat sebentar, coba lagi nanti ya!" }, 
      { status: 500 }
    );
  }
}