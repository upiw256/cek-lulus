"use client";
import { useState, useEffect } from "react";
import { SettingsInput } from "@/components/admin/SettingsInput";
import { SettingsCard } from "@/components/admin/SettingsCard";

export default function SettingPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    nama_kepsek: "",
    nip_kepsek: "",
    pangkat: "",
    tahun_ajaran: "",
    tgl_surat: "",
    nomor_surat: "",
    is_active: true,
    show_tte: true,
    sig_width: 40,
    sig_height: 20,
    stamp_width: 30,
    stamp_height: 30,
  });

  // State untuk preview gambar agar langsung berubah saat upload
  const [sigPreview, setSigPreview] = useState<string | null>(`/tte/signature.png?t=${Date.now()}`);
  const [stampPreview, setStampPreview] = useState<string | null>(`/tte/stamp.png?t=${Date.now()}`);

  // 1. Ambil data setting dari database saat halaman dibuka
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/setting");
        const data = await res.json();
        if (data && !data.error) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Gagal ambil setting:", err);
      }
    };
    fetchSettings();
  }, []);

  // 2. Fungsi Upload File ke public/tte (Menimpa file lama)
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'stamp') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file harus PNG agar transparan
    if (file.type !== "image/png") {
      alert("❌ Gunakan file format .PNG agar background transparan!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload/tte", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        // Update preview dengan cache breaker (?t=...)
        const newUrl = `${data.url}?t=${Date.now()}`;
        if (type === 'signature') setSigPreview(newUrl);
        else setStampPreview(newUrl);
        
        alert(`✅ ${type === 'signature' ? 'Tanda Tangan' : 'Cap'} Berhasil Diperbarui!`);
      }
    } catch (err) {
      alert("❌ Gagal upload gambar");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (type: 'signature' | 'stamp') => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${type === 'signature' ? 'Tanda Tangan' : 'Cap Sekolah'}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload/tte", {
        method: "DELETE",
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        if (type === 'signature') setSigPreview(null);
        else setStampPreview(null);
        alert("✅ Berhasil dihapus!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("❌ Gagal menghapus: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Simpan data teks ke Database
  const handleSaveData = async () => {
    setLoading(true);
    try {
      // Buang field ID bawaan MongoDB agar tidak error saat update/post
      const { _id, __v, createdAt, updatedAt, ...payload } = settings as any;

      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Konfigurasi Teks Berhasil Disimpan!");
      } else {
        throw new Error("Gagal menyimpan data teks");
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Setting Web</h1>
          <p className="text-slate-500 font-medium">Panel Kontrol SMAN 1 Margaasih</p>
        </div>
        
        <button 
          onClick={() => setSettings({...settings, is_active: !settings.is_active})}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border ${
            settings.is_active 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-red-50 text-red-600 border-red-100'
          }`}
        >
          {settings.is_active ? "🟢 Sistem Online" : "🔴 Sistem Offline"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Identitas */}
        <SettingsCard title="Kepala Sekolah" icon="👤" colorClass="text-blue-500">
          <SettingsInput 
            label="Nama & Gelar" 
            value={settings.nama_kepsek} 
            onChange={(v) => setSettings({...settings, nama_kepsek: v})} 
          />
          <SettingsInput 
            label="NIP" 
            value={settings.nip_kepsek} 
            onChange={(v) => setSettings({...settings, nip_kepsek: v})} 
          />
          <SettingsInput 
            label="Golongan" 
            value={settings.pangkat} 
            onChange={(v) => setSettings({...settings, pangkat: v})} 
          />
        </SettingsCard>

        {/* Card Konfigurasi SKL */}
        <SettingsCard title="Format Surat" icon="📄" colorClass="text-orange-500">
          <SettingsInput 
            label="Nomor Surat" 
            value={settings.nomor_surat} 
            onChange={(v) => setSettings({...settings, nomor_surat: v})} 
          />
          <SettingsInput 
            label="Tahun Pelajaran" 
            value={settings.tahun_ajaran} 
            onChange={(v) => setSettings({...settings, tahun_ajaran: v})} 
          />
          <SettingsInput 
            label="Bulan & Tahun (PDF)" 
            value={settings.tgl_surat} 
            onChange={(v) => setSettings({...settings, tgl_surat: v})} 
          />
        </SettingsCard>
      </div>

      {/* Card Upload TTE & Cap */}
      <SettingsCard title="Legalisasi Digital (PNG)" icon="🖋️" colorClass="text-purple-600">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-bold text-slate-700">Tampilkan Legalisasi di PDF</p>
            <p className="text-xs text-slate-400">Aktifkan jika ingin menyertakan TTE dan Cap Sekolah secara otomatis</p>
          </div>
          <button 
            onClick={() => setSettings({...settings, show_tte: !settings.show_tte})}
            className={`w-14 h-8 rounded-full transition-all relative ${settings.show_tte ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.show_tte ? 'left-7' : 'left-1 shadow-sm'}`} />
          </button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${!settings.show_tte ? 'opacity-40 grayscale' : ''}`}>
          {/* Tanda Tangan */}
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Tanda Tangan Kepsek</p>
            <div className="h-32 w-full flex items-center justify-center bg-white rounded-2xl mb-4 p-2 shadow-sm">
              {sigPreview ? (
                <img 
                    src={sigPreview} 
                    alt="TTD" 
                    className="max-h-full object-contain"
                    onError={() => setSigPreview(null)}
                />
              ) : (
                <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">⚠️ Belum Ada TTD</div>
              )}
            </div>
            

            <div className="flex w-full gap-2">
                <label className="flex-1">
                <input type="file" accept="image/png" onChange={(e) => handleUploadFile(e, 'signature')} className="hidden" />
                <div className="text-center py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                    Ganti
                </div>
                </label>
                <button 
                onClick={() => handleDeleteFile('signature')}
                className="px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                Hapus
                </button>
            </div>
          </div>

          {/* Cap Sekolah */}
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Cap Resmi Sekolah</p>
            <div className="h-32 w-full flex items-center justify-center bg-white rounded-2xl mb-4 p-2 shadow-sm">
              {stampPreview ? (
                <img 
                    src={stampPreview} 
                    alt="Cap" 
                    className="max-h-full object-contain"
                    onError={() => setStampPreview(null)}
                />
              ) : (
                <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">⚠️ Belum Ada Cap</div>
              )}
            </div>


            <div className="flex w-full gap-2">
                <label className="flex-1">
                <input type="file" accept="image/png" onChange={(e) => handleUploadFile(e, 'stamp')} className="hidden" />
                <div className="text-center py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                    Ganti
                </div>
                </label>
                <button 
                onClick={() => handleDeleteFile('stamp')}
                className="px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                Hapus
                </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Tombol Simpan Akhir */}
      <div className="flex justify-center pt-8">
        <button 
          onClick={handleSaveData}
          disabled={loading}
          className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Sedang Memproses..." : "Update Konfigurasi Web 🚀"}
        </button>
      </div>
    </div>
  );
}