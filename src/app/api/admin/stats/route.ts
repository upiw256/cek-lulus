import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Siswa } from "@/models/model";

export async function GET() {
  try {
    await connectDB();
    
    const total = await Siswa.countDocuments();
    const lulus = await Siswa.countDocuments({ status_lulus: true });
    const tunda = await Siswa.countDocuments({ status_lulus: false });

    return NextResponse.json({
      total,
      lulus,
      tunda
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
