import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { nisn, tgl_lahir, captchaInput } = await req.json();

    // 1. Validasi Captcha (Jawaban Matematika)
    const jawabanBenar = req.cookies.get("captcha_text")?.value;
    if (!captchaInput || captchaInput !== jawabanBenar) {
      return NextResponse.json(
        { error: "Aduh, jawaban matematikamu masih salah. Coba hitung lagi ya! 😊" }, 
        { status: 400 }
      );
    }

    // 2. Cari Siswa berdasarkan NISN dan Tanggal Lahir
    // Kita pakai regex 'i' supaya kalau adik-adik ketik huruf besar/kecil tidak masalah
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

    // 3. Kalau ketemu, kirim datanya!
    return NextResponse.json({
      message: "Data ditemukan!",
      data: dataSiswa
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Sistem lagi istirahat sebentar, coba lagi nanti ya!" }, 
      { status: 500 }
    );
  }
}