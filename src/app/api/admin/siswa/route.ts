import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Siswa } from "@/models/model";

export async function GET() {
  try {
    await connectDB();
    const data = await Siswa.find().sort({ createdAt: -1 }); // Ambil semua data, yang terbaru di atas
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nama, nisn, nis, tempat_lahir, tgl_lahir, nama_ayah, status, kelas } = await request.json();
    await connectDB();
    const newSiswa = new Siswa({ nama, nisn, nis, tempat_lahir, tgl_lahir, nama_ayah, status_lulus: status, kelas });
    await newSiswa.save();
    return NextResponse.json(newSiswa, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambahkan data" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await Siswa.deleteMany({});
    return NextResponse.json({ message: "Semua data siswa berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus semua data" },
      { status: 500 },
    );
  }
}