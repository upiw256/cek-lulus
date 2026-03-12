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
}, { timestamps: true });

const SettingsSchema = new Schema({
  nama_kepsek: { type: String, required: [true, "Nama Kepala Sekolah harus diisi ya!"], default: "CUCU IMAN, S. Pd, M. M. Pd" },
  nip_kepsek: { type: String, required: [true, "NIP harus diisi!"], default: "197306072000121002" },
  pangkat: { type: String, default: "IV/b" },
  tahun_ajaran: { type: String, default: "2024/2025" },
  tgl_surat: { type: String, default: "Juni 2026" },
  is_active: { type: Boolean, default: true },
  // Tambahan: Nomor Surat jika ingin diatur dari setting juga
  nomor_surat: { type: String, default: "056/KPG.01.06/SMAN1MARGAASIH" }
}, { 
  timestamps: true // Supaya kita tahu kapan terakhir kali pengaturan diubah
});

// 2. Buat Modelnya
// Cek dulu apakah model sudah ada (untuk mencegah error di Next.js Hot Reload)
const Siswa = models.Siswa || model("Siswa", SiswaSchema);
const Setting = models.Setting || model("Setting", SettingsSchema);

export {Siswa, Setting}; // Ekspor kedua model sekaligus