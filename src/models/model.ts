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
}, { timestamps: true });

// 2. Buat Modelnya
// Cek dulu apakah model sudah ada (untuk mencegah error di Next.js Hot Reload)
const Siswa = models.Siswa || model("Siswa", SiswaSchema);

export default Siswa;