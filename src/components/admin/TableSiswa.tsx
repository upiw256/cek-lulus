import { useState } from "react";

interface SiswaProps {
  data: any[];
  onRefresh: () => void;
}

export default function TableSiswa({ data, onRefresh }: SiswaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSiswa, setEditingSiswa] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
    try {
        const res = await fetch(`/api/admin/siswa/${id}`, { method: "DELETE" });
        if (res.ok) {
        alert("🗑️ Data berhasil dibuang!");
        setDeletingId(null);
        onRefresh(); // Supaya tabel langsung update
        }
    } catch (err) {
        alert("❌ Gagal menghapus data");
    }
    };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/siswa/${editingSiswa._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSiswa),
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

  const filteredData = data.filter((s: any) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.nis.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 lg:pb-0">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Data Master Siswa</h3>
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="text-primary font-bold">{filteredData.length}</span> Siswa
          </p>
        </div>
        
        <div className="relative group w-full md:w-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Cari Nama, NISN..."
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TAMPILAN DESKTOP (Table) - Hidden on Mobile */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Identitas</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Nama Lengkap</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Detail & Keluarga</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest text-center">Status</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((s) => (
                <tr key={s._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-slate-700">NIS: {s.nis}</span>
                      <span className="text-slate-400 font-mono">NISN: {s.nisn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-800 uppercase block">{s.nama}</span>
                    <p className="text-slate-400 italic">Kelas: {s.kelas}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 space-y-0.5 text-xs">
                      <p className="font-medium">📍 {s.tempat_lahir}, {s.tgl_lahir}</p>
                      <p className="text-slate-400 italic">👤 Ayah: {s.nama_ayah}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status_lulus ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                      {s.status_lulus ? "Lulus" : "Tunda"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingSiswa(s)} className="p-2 hover:bg-white rounded-lg border border-slate-100 shadow-sm">✏️</button>
                      <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAMPILAN MOBILE (Card Layout) - Hidden on Desktop */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredData.length > 0 ? (
          filteredData.map((s: any) => (
            <div key={s._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{s.nis} / {s.nisn}</p>
                  <h4 className="font-black text-slate-800 uppercase leading-tight">{s.nama}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status_lulus ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                  {s.status_lulus ? "Lulus" : "Tunda"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50 text-[11px]">
                <div>
                  <p className="text-slate-400 uppercase font-bold">Lahir di</p>
                  <p className="text-slate-700 font-medium">{s.tempat_lahir}, {s.tgl_lahir}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold">Nama Ayah</p>
                  <p className="text-slate-700 font-medium uppercase">{s.nama_ayah}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingSiswa(s)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <span>✏️</span> Edit Data
                </button>
                <button 
                onClick={() => setDeletingId(s._id)} // s._id adalah ID dari MongoDB
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                >
                🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-50 font-medium">Data tidak ditemukan</div>
        )}
      </div>

      {/* MODAL EDIT (Dibuat lebih ramah mobile) */}
      {editingSiswa && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Handle bar untuk mobile */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Edit Data Siswa</h3>
                <button onClick={() => setEditingSiswa(null)} className="text-slate-400 text-3xl">&times;</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5 pb-10 md:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">NIS</label>
                    <input type="text" value={editingSiswa.nis} onChange={(e) => setEditingSiswa({...editingSiswa, nis: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">NISN</label>
                    <input type="text" value={editingSiswa.nisn} onChange={(e) => setEditingSiswa({...editingSiswa, nisn: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nama Lengkap</label>
                  <input type="text" value={editingSiswa.nama} onChange={(e) => setEditingSiswa({...editingSiswa, nama: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold uppercase" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tempat Lahir</label>
                    <input type="text" value={editingSiswa.tempat_lahir} onChange={(e) => setEditingSiswa({...editingSiswa, tempat_lahir: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tgl Lahir</label>
                    <input type="text" value={editingSiswa.tgl_lahir} onChange={(e) => setEditingSiswa({...editingSiswa, tgl_lahir: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nama Ayah</label>
                    <input type="text" value={editingSiswa.nama_ayah} onChange={(e) => setEditingSiswa({...editingSiswa, nama_ayah: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Kelas</label>
                    <input type="text" value={editingSiswa.kelas} onChange={(e) => setEditingSiswa({...editingSiswa, kelas: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium" />
                  </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
                  <button type="button" onClick={() => setEditingSiswa(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-blue-200">
                    {isSubmitting ? "Loading..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
        {deletingId && (
        <div className="fixed inset-0 !z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            {/* Backdrop klik untuk tutup (Opsional) */}
            <div className="absolute inset-0" onClick={() => setDeletingId(null)}></div>
            
            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200 shadow-red-200/20">
            <div className="w-20 h-20 bg-red-50 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6 text-3xl">
                🗑️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Data?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">
                Data ini akan hilang selamanya dan tidak bisa dikembalikan. Kamu yakin?
            </p>
            <div className="flex gap-3">
                <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                Batal
                </button>
                <button 
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                Ya, Hapus
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}