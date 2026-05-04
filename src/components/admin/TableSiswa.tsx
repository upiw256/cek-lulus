import { useState } from "react";
import { generateSKLBase64 } from "@/lib/pdfGenerator";

interface SiswaProps {
  data: any[];
  onRefresh: () => void;
}

export default function TableSiswa({ data, onRefresh }: SiswaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Edit
  const [editingSiswa, setEditingSiswa] = useState<any>(null);

  // State untuk Tambah Baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSiswa, setNewSiswa] = useState({
    nis: "",
    nisn: "",
    nama: "",
    tempat_lahir: "",
    tgl_lahir: "",
    nama_ayah: "",
    kelas: "",
    rata_rata_nilai: "",
    status_lulus: true,
  });

  // State untuk Hapus
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // State untuk Generate PDF Massal
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  const handleGenerateAllPDF = async () => {
    if (!confirm(`Apakah Anda yakin ingin menggenerate PDF untuk ${data.length} siswa? Proses ini mungkin memakan waktu.`)) return;
    
    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: data.length });

    try {
      // 1. Ambil Setting Terbaru
      const settingRes = await fetch("/api/admin/setting");
      const pengaturan = await settingRes.json();

      // 2. Loop dan Generate
      for (let i = 0; i < data.length; i++) {
        const student = data[i];
        setGenerationProgress({ current: i + 1, total: data.length });

        try {
          const pdfBase64 = await generateSKLBase64({
            ...student,
            pengaturan
          });

          await fetch("/api/admin/generate/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nisn: student.nisn,
              nama: student.nama,
              pdfBase64
            })
          });
        } catch (err) {
          console.error(`Gagal generate PDF untuk ${student.nama}:`, err);
        }
      }

      alert("✅ Berhasil: Semua PDF telah di-generate dan disimpan di server!");
    } catch (err) {
      alert("❌ Terjadi kesalahan saat generate massal");
    } finally {
      setIsGenerating(false);
    }
  };

  // FUNGSI: Hapus Data
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/siswa/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("🗑️ Data berhasil dibuang!");
        setDeletingId(null);
        onRefresh();
      }
    } catch (err) {
      alert("❌ Gagal menghapus data");
    }
  };
  
  // FUNGSI: Hapus Semua Data
  const handleDeleteAll = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/siswa", { method: "DELETE" });
      if (res.ok) {
        alert("🚮 Semua data sudah dibersihkan!");
        setShowDeleteAllModal(false);
        onRefresh();
      }
    } catch (err) {
      alert("❌ Gagal menghapus semua data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI: Update Data (Edit)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let dataToSave = { ...editingSiswa };
      if (dataToSave.tgl_lahir.includes("-")) {
        const [year, month, day] = dataToSave.tgl_lahir.split("-");
        dataToSave.tgl_lahir = `${day}/${month}/${year}`;
      }
      const res = await fetch(`/api/admin/siswa/${editingSiswa._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        alert("✅ Data berhasil diupdate!");
        setEditingSiswa(null);
        onRefresh();
      }
    } catch (err) {
      alert("❌ Gagal update data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI: Tambah Data Baru
  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSiswa),
      });

      if (res.ok) {
        alert("✅ Siswa baru berhasil ditambahkan!");
        setShowAddModal(false);
        setNewSiswa({
          nis: "",
          nisn: "",
          nama: "",
          tempat_lahir: "",
          tgl_lahir: "",
          nama_ayah: "",
          kelas: "",
          rata_rata_nilai: "",
          status_lulus: true,
        });
        onRefresh();
      }
    } catch (err) {
      alert("❌ Gagal tambah data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Pencarian
  const filteredData = data.filter(
    (s: any) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.nis.includes(searchQuery),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 lg:pb-0">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
            Data Master Siswa
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan{" "}
            <span className="text-blue-600 font-bold">
              {filteredData.length}
            </span>{" "}
            Siswa
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all text-sm"
            >
              ➕ Tambah Siswa Baru
            </button>
            <button
              disabled={isGenerating || data.length === 0}
              onClick={handleGenerateAllPDF}
              className={`mt-3 px-5 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2 ${
                isGenerating 
                ? "bg-blue-100 text-blue-600 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isGenerating ? (
                <>⏳ {generationProgress.current} / {generationProgress.total}</>
              ) : (
                <>📄 Generate Semua PDF</>
              )}
            </button>
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="mt-3 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 active:scale-95 transition-all text-sm"
            >
              🗑️ Hapus Semua
            </button>
          </div>
        </div>

        <div className="relative group w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari Nama atau NISN..."
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-4 top-3.5 opacity-40">🔍</span>
        </div>
      </div>

      {/* TAMPILAN TABEL (Desktop) */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                Identitas
              </th>
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                Nama Lengkap
              </th>
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                Keluarga & Kelas
              </th>
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">
                Rata-rata
              </th>
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">
                Status
              </th>
              <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((s) => (
              <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="font-bold text-slate-700">NIS: {s.nis}</p>
                    <p className="text-slate-400 font-mono">NISN: {s.nisn}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-slate-800 uppercase block text-sm">
                    {s.nama}
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Lahir: {s.tempat_lahir}, {s.tgl_lahir}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="text-slate-600">👤 Ayah: {s.nama_ayah}</p>
                    <p className="text-blue-500 font-bold">
                      🏫 Kelas: {s.kelas}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                    {s.rata_rata_nilai || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status_lulus ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {s.status_lulus ? "Lulus" : "Tunda"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => {
                        let siswa = { ...s };
                        // Jika di database formatnya DD/MM/YYYY, ubah ke YYYY-MM-DD agar muncul di input date
                        if (siswa.tgl_lahir && siswa.tgl_lahir.includes("/")) {
                          const [day, month, year] = siswa.tgl_lahir.split("/");
                          siswa.tgl_lahir = `${year}-${month}-${day}`;
                        }
                        setEditingSiswa(siswa);
                      }} 
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingId(s._id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH SISWA */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">
              Tambah Siswa Baru
            </h3>
            <form onSubmit={handleAddSiswa} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    NIS
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiswa.nis}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, nis: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    NISN
                  </label>
                  <input
                    required
                    type="text"
                    value={newSiswa.nisn}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, nisn: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  value={newSiswa.nama}
                  onChange={(e) =>
                    setNewSiswa({
                      ...newSiswa,
                      nama: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={newSiswa.tempat_lahir}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, tempat_lahir: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    placeholder="Contoh: 12 Juni 2008"
                    value={newSiswa.tgl_lahir}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, tgl_lahir: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Nama Ayah
                  </label>
                  <input
                    type="text"
                    value={newSiswa.nama_ayah}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, nama_ayah: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={newSiswa.kelas}
                    onChange={(e) =>
                      setNewSiswa({ ...newSiswa, kelas: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Rata-rata Nilai
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 88.50"
                  value={newSiswa.rata_rata_nilai}
                  onChange={(e) =>
                    setNewSiswa({ ...newSiswa, rata_rata_nilai: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none font-bold text-blue-600"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SISWA */}
      {editingSiswa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter italic">
              Edit Profil Siswa
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* BARIS 1: NIS & NISN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">NIS</label>
                  <input
                    type="text"
                    value={editingSiswa.nis}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, nis: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">NISN</label>
                  <input
                    type="text"
                    value={editingSiswa.nisn}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, nisn: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* BARIS 2: NAMA LENGKAP */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingSiswa.nama}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, nama: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-blue-600"
                />
              </div>

              {/* BARIS 3: TEMPAT & TANGGAL LAHIR */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editingSiswa.tempat_lahir}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, tempat_lahir: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tgl Lahir</label>
                  <input
                    type="date"
                    value={editingSiswa.tgl_lahir}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, tgl_lahir: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* BARIS 4: NAMA AYAH & KELAS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nama Ayah</label>
                  <input
                    type="text"
                    value={editingSiswa.nama_ayah}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, nama_ayah: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Kelas</label>
                  <input
                    type="text"
                    value={editingSiswa.kelas}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, kelas: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Rata-rata</label>
                  <input
                    type="text"
                    value={editingSiswa.rata_rata_nilai}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, rata_rata_nilai: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-blue-600"
                  />
                </div>
              </div>

              {/* BARIS 5: STATUS KELULUSAN */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Status Kelulusan</label>
                <select
                  value={editingSiswa.status_lulus ? "true" : "false"}
                  onChange={(e) =>
                    setEditingSiswa({
                      ...editingSiswa,
                      status_lulus: e.target.value === "true",
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-2xl outline-none font-black transition-all ${
                    editingSiswa.status_lulus 
                      ? "bg-green-50 border-green-200 text-green-600" 
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}
                >
                  <option value="true">LULUS</option>
                  <option value="false">TUNDA</option>
                </select>
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingSiswa(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full mx-auto mb-4 text-2xl">
              🗑️
            </div>
            <h3 className="text-xl font-bold text-slate-800">Hapus Siswa?</h3>
            <p className="text-xs text-slate-500 my-4">
              Data yang dihapus tidak bisa dikembalikan lagi ya.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center rounded-full mx-auto mb-4 text-2xl animate-bounce">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Hapus Semua Data?</h3>
            <p className="text-xs text-slate-500 my-4 leading-relaxed font-medium">
              Tindakan ini akan menghapus <span className="text-red-500 font-bold">SELURUH</span> data siswa secara permanen. Yakin nih?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Gas Jadi
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Proses..." : "Hapus Semua!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
