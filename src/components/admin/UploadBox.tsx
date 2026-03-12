import ExcelJS from "exceljs";

const downloadTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Siswa");

  // 1. Definisikan Header sesuai file yang kamu tunjukkan tadi
  worksheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "NIS", key: "nis", width: 15 }, // Tambahan
    { header: "NISN", key: "nisn", width: 15 },
    { header: "Nama Lengkap", key: "nama", width: 30 },
    { header: "Tempat Lahir", key: "tempat_lahir", width: 20 }, // Tambahan
    { header: "Tanggal Lahir", key: "tgl_lahir", width: 15 },
    { header: "Nama Ayah", key: "nama_ayah", width: 25 }, // Tambahan
    { header: "Status", key: "status", width: 15 },
  ];

  // 2. Tambahkan satu baris contoh agar admin tidak bingung
  worksheet.addRow({
    no: 1,
    nis: "22231001",
    nisn: "0075432101",
    nama: "ADITYA PRATAMA",
    tempat_lahir: "Bandung",
    tgl_lahir: "12/05/2007",
    nama_ayah: "SUHERMAN",
    status: "Lulus",
  });

  // 3. Beri sedikit warna pada header agar cantik
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{ argb:'F0F0F0' }
  };

  // 4. Proses Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Template_Data_Siswa.xlsx";
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export default function UploadBox({ onUpload, loading, file, setFile }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-700">Import Data Excel</h3>
            
            {/* Tombol Download Template */}
            <button 
                onClick={downloadTemplate}
                className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
                <span>📥</span> Download Template
            </button>
        </div>
      <div 
        onClick={() => document.getElementById('fileInput')?.click()}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-primary transition-all cursor-pointer"
      >
        <input id="fileInput" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
        <span className="text-4xl block mb-2">📊</span>
        <p className="text-slate-500">{file ? file.name : "Klik untuk pilih file Excel"}</p>
      </div>
      <button 
        onClick={onUpload} 
        disabled={!file || loading}
        className="btn-primary w-full mt-6 py-4 rounded-2xl disabled:bg-slate-200"
      >
        {loading ? "Sabar ya, lagi proses..." : "Import Sekarang"}
      </button>
    </div>
  );
}