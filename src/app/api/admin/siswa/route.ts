import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/model";

export async function GET() {
  try {
    await connectDB();
    const data = await Siswa.find().sort({ createdAt: -1 }); // Ambil semua data, yang terbaru di atas
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}