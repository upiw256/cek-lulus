import mongoose, { Schema, model, models } from "mongoose";

// 1. Definisikan Struktur Data (Schema)
const SiswaSchema = new Schema({
  nisn: { type: String, required: true, unique: true },
  nis: { type: String, required: true }, // Tambahan NIS
  nama: { type: String, required: true },
  tempat_lahir: { type: String, required: true }, // Tambahan Tempat Lahir
  tgl_lahir: { type: String, required: true },
  nama_ayah: { type: String, required: true }, // Tambahan Nama Ayah
  status_lulus: { type: Boolean, default: false },
  kelas: { type: String, required: true }, // Tambahan Kelas
  rata_rata_nilai: { type: String, default: "-" }, // Tambahan Rata-rata Nilai
}, { timestamps: true });

const SettingsSchema = new Schema({
  nama_kepsek: { type: String, required: [true, "Nama Kepala Sekolah harus diisi ya!"], default: "CUCU IMAN, S. Pd, M. M. Pd" },
  nip_kepsek: { type: String, required: [true, "NIP harus diisi!"], default: "197306072000121002" },
  pangkat: { type: String, default: "IV/b" },
  tahun_ajaran: { type: String, default: "2024/2025" },
  tgl_surat: { type: String, default: "Juni 2026" },
  is_active: { type: Boolean, default: true },
  // Tambahan: Nomor Surat jika ingin diatur dari setting juga
  nomor_surat: { type: String, default: "056/KPG.01.06/SMAN1MARGAASIH" },
  show_tte: { type: Boolean, default: true }, // Baris Baru: Toggle TTE/Cap di PDF
  sig_width: { type: Number, default: 40 },
  sig_height: { type: Number, default: 20 },
  sig_x: { type: Number, default: 135 },
  sig_y: { type: Number, default: 215 },
  stamp_width: { type: Number, default: 30 },
  stamp_height: { type: Number, default: 30 },
  stamp_x: { type: Number, default: 120 },
  stamp_y: { type: Number, default: 213 },
  kop_width: { type: Number, default: 190 },
  kop_height: { type: Number, default: 40 },
  kop_x: { type: Number, default: 10 },
  kop_y: { type: Number, default: 10 },
  text_pembuka: { type: String, default: "Yang bertanda tangan dibawah ini :" },
  text_menerangkan: { type: String, default: "Dengan ini menerangkan bahwa :" },
  text_keputusan: { type: String, default: "Berdasarkan hasil evaluasi pembelajaran Tahun Pelajaran {tahun_ajaran}, siswa tersebut di atas telah dinyatakan :" },
  text_penutup: { type: String, default: "Demikian Surat Keterangan Lulus ini dibuat agar dapat digunakan keperluan lain sesuai kebutuhan." },
  paper_size: { type: String, default: "a4" }, // 'a4' or 'f4'
}, { 
  timestamps: true // Supaya kita tahu kapan terakhir kali pengaturan diubah
});

// 2. Buat Modelnya
// Di Next.js, kita perlu hapus model dari cache agar schema baru terbaca saat hot reload
if (models.Siswa) delete (mongoose as any).models.Siswa;
if (models.Setting) delete (mongoose as any).models.Setting;

const Siswa = model("Siswa", SiswaSchema);
const Setting = model("Setting", SettingsSchema);

export {Siswa, Setting}; // Ekspor kedua model sekaligus