"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function TTEPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    ttd_image: "",
    cap_image: "",
  });

  // Ambil data saat halaman dibuka
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/setting");
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setSettings((prev) => ({ 
              ...prev, 
              ttd_image: data.ttd_image || "",
              cap_image: data.cap_image || ""
            }));
          }
        }
      } catch (err) {
        console.error("Gagal ambil setting TTE.");
      }
    };
    fetchSettings();
  }, []);

  // Konversi File ke Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "ttd_image" | "cap_image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 500) { // Max 500KB
      alert("❌ Ukuran gambar maksimal 500KB agar loading PDF tetap cepat.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Kita hanya update ttd_image dan cap_image
      // Setting route mendukung partial update jika Schema tidak validation error
      // Tapi lebih aman mengirim semua payload? Tidak perlu, body akan men-timpa
      // Wait, Mongoose findOneAndUpdate { ...body } akan men-set field yang dikirim saja jika pakai $set. 
      // Karena di API kita: await Setting.findOneAndUpdate({}, { ...body }, ...)
      // Maka body akan overwrite spesifik field yg dikirim.
      
      const payload = { 
        ttd_image: settings.ttd_image,
        cap_image: settings.cap_image
      };

      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Tanda Tangan & Cap Sekolah berhasil diperbarui!");
      } else {
        throw new Error(result.error || "Gagal menyimpan");
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Tanda Tangan Elektronik</h1>
        <p className="text-slate-500 font-medium mt-2">Upload TTD Kepala Sekolah & Cap Resmi u/ dicetak di PDF SKL.</p>
        <p className="text-xs text-orange-500 mt-1 font-bold">⚠️ Gunakan gambar transparan (.PNG) ukuran maksimal 500KB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom Tanda Tangan */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Tanda Tangan KepSek</h2>
          
          <div className="w-full h-40 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden mb-4">
            {settings.ttd_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.ttd_image} alt="Tanda Tangan" className="max-h-full object-contain" />
            ) : (
              <p className="text-slate-400 text-sm font-medium">Belum ada gambar</p>
            )}
          </div>
          
          <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all w-full text-center">
            Pilih Tanda Tangan (.PNG)
            <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileUpload(e, "ttd_image")} />
          </label>
        </div>

        {/* Kolom Cap Sekolah */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Cap Sekolah (Stempel)</h2>
          
          <div className="w-full h-40 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden mb-4">
            {settings.cap_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.cap_image} alt="Cap Sekolah" className="max-h-full object-contain" />
            ) : (
              <p className="text-slate-400 text-sm font-medium">Belum ada gambar</p>
            )}
          </div>
          
          <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all w-full text-center">
            Pilih Cap Sekolah (.PNG)
            <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileUpload(e, "cap_image")} />
          </label>
        </div>

      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Menyimpan Upload..." : "Simpan TTE 🚀"}
        </button>
      </div>
    </div>
  );
}
