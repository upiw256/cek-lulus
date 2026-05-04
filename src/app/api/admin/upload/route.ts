import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {Siswa} from "@/models/model";
import ExcelJS from "exceljs";
import { normalizeDateIndo } from "@/lib/dateUtils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);

    const dataSiswa: any[] = [];

    worksheet?.eachRow((row, rowNumber) => {
      const cellTgl = row.getCell(6);
      let tgl_lahir_convert = "";
      if (cellTgl.value instanceof Date) {
        // Jika Excel membacanya sebagai objek Tanggal, kita format manual ke DD/MM/YYYY
        const d = cellTgl.value;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        tgl_lahir_convert = `${day}/${month}/${year}`;
      } else {
        // Jika Excel membacanya sebagai tulisan biasa (String)
        const rawText = cellTgl.text?.trim() || "";
        tgl_lahir_convert = normalizeDateIndo(rawText);
      }
      if (rowNumber > 1) {
        // Ambil nilai dan bersihkan spasi (trim)
        const nis = row.getCell(2).text?.trim();
        const nisn = row.getCell(3).text?.trim();
        const nama = row.getCell(4).text?.trim();
        const tempat_lahir = row.getCell(5).text?.trim();
        const tgl_lahir = tgl_lahir_convert;
        const nama_ayah = row.getCell(7).text?.trim(); // Kolom G
        const statusRaw = row.getCell(8).text?.trim().toLowerCase();
        const kelas = row.getCell(9).text?.trim(); // Kolom I (Kelas)
        
        // Ambil nilai Rata-rata (Kolom J) dan paksa format 2 angka di belakang koma
        const rawNilai = row.getCell(10).value;
        let rata_rata_nilai = "-";
        
        if (typeof rawNilai === 'number') {
          rata_rata_nilai = rawNilai.toFixed(2);
        } else if (typeof rawNilai === 'string' && !isNaN(parseFloat(rawNilai))) {
          rata_rata_nilai = parseFloat(rawNilai).toFixed(2);
        } else {
          rata_rata_nilai = row.getCell(10).text?.trim() || "-";
        }

        // LOG untuk intip data di terminal/console
        console.log(`Baris ${rowNumber}:`, { nisn, nama, nama_ayah, tgl_lahir, kelas, statusRaw, rata_rata_nilai });

        // Validasi: pastikan data penting tidak kosong sebelum di-push
        if (nisn && nama && nama_ayah) { 
          dataSiswa.push({
            nis,
            nisn,
            nama,
            tempat_lahir,
            tgl_lahir,
            nama_ayah,
            status_lulus: statusRaw === "lulus",
            kelas,
            rata_rata_nilai,
          });
        } else {
          console.warn(`⚠️ Baris ${rowNumber} dilewati karena data tidak lengkap (Cek Nama Ayah!)`);
        }
      }
    });

    if (dataSiswa.length === 0) {
      return NextResponse.json({ error: "Tidak ada data valid yang bisa diimport. Cek kolom Nama Ayah!" }, { status: 400 });
    }

    await Siswa.deleteMany({}); 
    await Siswa.insertMany(dataSiswa);

    return NextResponse.json({ 
      message: `Berhasil mengimpor ${dataSiswa.length} data siswa!` 
    });

  } catch (error: any) {
    console.error("Error Detail:", error.message);
    return NextResponse.json({ error: error.message || "Gagal memproses file Excel" }, { status: 500 });
  }
}