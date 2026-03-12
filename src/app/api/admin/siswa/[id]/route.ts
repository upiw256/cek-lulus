import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/model";

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // 1. Definisikan sebagai Promise
) {
  try {
    await connectDB();
    const body = await req.json();
    
    // 2. Unwrapping params menggunakan await (Wajib di Next.js 15)
    const { id } = await params;

    // 3. Update warning Mongoose (Ganti 'new' jadi 'returnDocument')
    const updatedSiswa = await Siswa.findByIdAndUpdate(
      id, 
      body, 
      { returnDocument: 'after' } 
    );

    if (!updatedSiswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Data berhasil diperbarui!", 
      data: updatedSiswa 
    });
  } catch (error) {
    console.error("Error API Update:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// Tambahkan di bawah fungsi PUT yang sudah ada
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const deletedSiswa = await Siswa.findByIdAndDelete(id);

    if (!deletedSiswa) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Data berhasil dihapus selamanya!" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}