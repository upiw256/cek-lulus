# 🎓 Aplikasi Cek Kelulusan Sekolah

Aplikasi berbasis web untuk memudahkan pihak sekolah dalam mengumumkan status kelulusan siswa secara digital. Siswa dapat mengecek status kelulusan mereka hanya dengan memasukkan NISN dan Tanggal Lahir, serta dapat langsung mengunduh/mencetak **Surat Keterangan Lulus (SKL)** berformat PDF yang sudah dilengkapi dengan Tanda Tangan Elektronik (TTE) Kepala Sekolah dan Cap Stempel Institusi.

Aplikasi ini dibangun menggunakan framework **Next.js (App Router)** dan database **MongoDB**.

---

## ✨ Fitur Utama

### 🧑‍🎓 Untuk Siswa (Frontend)
- **Desain Interaktif & Modern**: Antarmuka pengecekan yang mudah digunakan dan responsif.
- **Validasi Keamanan Otomatis**: Dilengkapi dengan pengaman Captcha matematika saat mencari data.
- **Unduh PDF Otomatis**: Jika siswa dinyatakan "LULUS", mereka dapat langsung mencetak form SKL.
- **Tanda Tangan & Cap Otomatis**: SKL yang didapat siswa sudah mencakup Tanda Tangan Digital Kepala Sekolah dan Cap basah sekolah secara *tumpang-tindih (overlapping)* menyerupai surat fisik terlegalisir.

### 👔 Untuk Admin (Backend / Dashboard)
- **Manajemen Data Siswa**: Tambah, edit, cari, atau hapus data siswa dengan antarmuka yang cepat.
- **Import Data Massal via Excel**: Tak perlu repot menambah data satu per satu. Anda bisa mengunggah file `.xlsx` dan ratusan data siswa akan ditarik ke dalam database pada saat bersamaan.
- **Statistik Dashboard**: Informasi metrik sederhana mengenai jumlah total siswa, yang lulus, maupun yang ditunda.
- **Modul TTE & Penomoran Surat**:
  - Konfigurasi langsung dari sistem terkait rincian TTE (Unggah file `.png` transparan untuk Stempel Sekolah & Tanda Tangan Kepala Sekolah maksimal ukuran 500KB).
  - Konfigurasi profil Kepala Sekolah (Nama, NIP, Golongan).
  - Merubah nomor dan tanggal kop surat SKL secara dinamis.

---

## 💻 Tech Stack (Teknologi yang Digunakan)

*   **Framework**: [Next.js (App Router)](https://nextjs.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) bersama Mongoose ORM
*   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & jspdf-autotable
*   **Excel Parsing**: [ExcelJS](https://github.com/exceljs/exceljs)
*   **Animasi Tambahan**: canvas-confetti

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Persiapan
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/en/) (Disarankan versi >= 18)
- Memiliki koneksi/URL koneksi ke sebuah database **MongoDB** (bisa menggunakan *MongoDB Atlas* yang gratis).

### 2. Konfigurasi Sistem
1. _Clone_ atau unduh direktori aset proyek ini.
2. Buka terminal di dalam folder *project*.
3. Lakukan instalasi segala dependencies yang dibutuhkan dengan sistem Node Package Manager (`npm`):
   ```bash
   npm install
   ```
4. Buat file bernama `.env.local` di *root* (folder tingkat paling atas) berisi variabel ini:
   ```env
   # Koneksi URL Database MongoDB
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/namadatabase
   
   # Nama identitas yang akan dimuat di Kop PDF
   NEXT_PUBLIC_SCHOOL_NAME="SMAN 1 CONTOH"
   ```

### 3. Jalankan Aplikasi
Jalankan perintah ini di terminal:
```bash
npm run dev
```

Aplikasi siap diakses!
*   **Siswa (Akses Publik)**: `http://localhost:3000`
*   **Admin Panel**: `http://localhost:3000/login`

> **Note**: Tambahan file _routing_ yang mungkin memuat otentikasi login admin dapat ditemukan dengan mengubah/menyesuaikan isian pada `src/app/api/admin/login` atau yang sejenis.

---

## 📄 Format Tabel Excel (`Import Data Siswa`)
Ketika mengunggah *Database Excel*, aplikasi mengharapkan susunan tata letak kolom yang presisi dari kiri ke kanan. Harap ikuti format kolom minimal di baris (B-I) seperti berikut ini:
*   Kolom (B) - Kolom 2: **NIS**
*   Kolom (C) - Kolom 3: **NISN**
*   Kolom (D) - Kolom 4: **Nama Lengkap**
*   Kolom (E) - Kolom 5: **Tempat Lahir**
*   Kolom (F) - Kolom 6: **Tanggal Lahir** (Format bisa *Date* Excel atau teks biasa HH/BB/TTTT)
*   Kolom (G) - Kolom 7: **Nama Ayah**
*   Kolom (H) - Kolom 8: **Status Kelulusan** (Ketik 'Lulus' untuk aktif)
*   Kolom (I) - Kolom 9: **Kelas**

---
_Dibuat dengan Next.js_ ☀️
