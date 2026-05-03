"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { generateSKL } from "@/lib/pdfGenerator";

const SCALE = 3.78; // 1mm = 3.78px (Standard 96 DPI). 

export default function PdfSettingPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [kopPreview, setKopPreview] = useState(`/kop.png?t=${Date.now()}`);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/setting");
      const data = await res.json();
      if (data && !data.error) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Gagal ambil setting:", err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { _id, __v, createdAt, updatedAt, ...payload } = settings;
      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Konfigurasi PDF Berhasil Disimpan!");
      } else {
        throw new Error("Gagal menyimpan data");
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = () => {
    const dummyData = {
      nama: "FULAN BIN FULAN",
      nisn: "0012345678",
      nis: "12345",
      tempat_lahir: "Bandung",
      tgl_lahir: "2008-05-20",
      nama_ayah: "AYAH FULAN",
      rata_rata_nilai: "88.50",
      status_lulus: true,
      pengaturan: settings
    };
    generateSKL(dummyData);
  };

  const handleUploadKop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "kop");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload/tte", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setKopPreview(`${data.url}?t=${Date.now()}`);
        alert("✅ Kop Surat Berhasil Diperbarui!");
      }
    } catch (err: any) {
        alert("❌ Gagal upload Kop Surat: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="p-10 text-center">Loading settings...</div>;

  const pageWidth = (settings.paper_size === "f4" ? 210 : 210) * SCALE;
  const pageHeight = (settings.paper_size === "f4" ? 330 : 297) * SCALE;

  const ElementBox = ({ title, x, y, w, h, id, children }: any) => (
    <Rnd
      size={{ width: w * SCALE, height: h * SCALE }}
      position={{ x: x * SCALE, y: y * SCALE }}
      onDragStop={(e, d) => {
        setSettings({ ...settings, [`${id}_x`]: d.x / SCALE, [`${id}_y`]: d.y / SCALE });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSettings({
          ...settings,
          [`${id}_width`]: parseFloat(ref.style.width) / SCALE,
          [`${id}_height`]: parseFloat(ref.style.height) / SCALE,
          [`${id}_x`]: position.x / SCALE,
          [`${id}_y`]: position.y / SCALE,
        });
      }}
      bounds="parent"
      className="border border-blue-400/40 flex flex-col items-center justify-center overflow-hidden group cursor-move z-20 hover:border-blue-500 transition-colors"
    >
      <div className="absolute top-0 left-0 bg-blue-400 text-white text-[8px] px-1 font-bold uppercase z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {title}
      </div>
      {children}
    </Rnd>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-0 p-0 animate-in fade-in duration-500 w-full overflow-hidden">
      {/* KONTROL */}
      <div className="w-full xl:w-[600px] space-y-6 flex-shrink-0 bg-white min-h-[calc(100vh-100px)] border-r border-slate-200 p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg">💾</div>
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">PDF Config</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase px-1">Visual Layout & Wording Editor</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Ukuran Kertas</h3>
                <select 
                    value={settings.paper_size || "a4"} 
                    onChange={(e) => setSettings({...settings, paper_size: e.target.value})}
                    className="text-[10px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                >
                    <option value="a4">A4 (210x297mm)</option>
                    <option value="f4">F4 (210x330mm)</option>
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Kop Surat</h3>
                <label className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold cursor-pointer hover:bg-blue-100 transition-all">
                    Upload Baru
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadKop} />
                </label>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Width (mm)</label>
                    <input type="number" readOnly value={Math.round(settings.kop_width)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Height (mm)</label>
                    <input type="number" readOnly value={Math.round(settings.kop_height)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                 </div>
             </div>
          </div>

          <div className="space-y-4 pt-2">
             <h3 className="font-bold text-slate-700 text-sm border-b pb-2 uppercase tracking-wider">Tanda Tangan & Cap</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">TTD Width</label>
                    <input type="number" readOnly value={Math.round(settings.sig_width)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cap Width</label>
                    <input type="number" readOnly value={Math.round(settings.stamp_width)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                 </div>
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
             <h3 className="font-bold text-slate-700 text-sm border-b pb-2 uppercase tracking-wider">Kata-kata SKL</h3>
             <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Text Pembuka</label>
                    <textarea value={settings.text_pembuka} onChange={(e) => setSettings({...settings, text_pembuka: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs min-h-[60px] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Text Menerangkan</label>
                    <textarea value={settings.text_menerangkan} onChange={(e) => setSettings({...settings, text_menerangkan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs min-h-[60px] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Text Keputusan</label>
                    <textarea value={settings.text_keputusan} onChange={(e) => setSettings({...settings, text_keputusan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs min-h-[80px] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    <p className="text-[9px] text-slate-400 italic font-medium px-1">Gunakan {"{tahun_ajaran}"} dan variabel seperti {"{{nama}}"} untuk otomatisasi</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Text Penutup</label>
                    <textarea value={settings.text_penutup} onChange={(e) => setSettings({...settings, text_penutup: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs min-h-[60px] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                 </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
            <button
            onClick={handleTestPrint}
            className="w-full py-5 bg-white text-blue-600 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border-2 border-blue-50 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            >
            Cetak Preview (Fulan) 🖨️
            </button>

            <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
            {loading ? "Menyimpan..." : "Update Konfigurasi PDF 🚀"}
            </button>
        </div>

        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                <strong>💡 Tip Pro:</strong> Geser kotak biru pada kertas untuk mengatur posisi. Hasil print PDF akan persis seperti yang Anda lihat di layar.
            </p>
        </div>
      </div>

      {/* PREVIEW CANVAS */}
      <div className="flex-1 flex justify-center bg-slate-100/50 p-4 lg:p-12 rounded-[3.5rem] border border-slate-200/50 overflow-auto min-h-[900px] backdrop-blur-sm">
        <div 
            style={{ 
                width: pageWidth, 
                height: pageHeight, 
                fontFamily: 'Arial, sans-serif',
                color: '#000'
            }}
            className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] relative flex-shrink-0 transition-all duration-500"
        >
          {/* Watermark/Grid Helper line for margins */}
          <div className="absolute inset-x-[10mm] inset-y-[10mm] border border-dashed border-slate-100 pointer-events-none" style={{
            left: 10 * SCALE, right: 10 * SCALE, top: 10 * SCALE, bottom: 10 * SCALE
          }} />

          {/* KOP SURAT */}
          <ElementBox title="Kop Surat" x={settings.kop_x} y={settings.kop_y} w={settings.kop_width} h={settings.kop_height} id="kop">
             <img src={kopPreview} className="w-full h-full object-contain pointer-events-none" />
          </ElementBox>

          {/* JUDUL */}
          <div className="absolute w-full text-center" style={{ top: 60 * SCALE }}>
              <div style={{ fontSize: 14 * 0.3528 * SCALE }} className="font-bold uppercase leading-tight">Surat Keterangan Lulus</div>
              <div style={{ fontSize: 11 * 0.3528 * SCALE }} className="leading-tight">Nomor : {settings.nomor_surat}</div>
              <div className="w-40 h-[0.5px] bg-black mx-auto mt-1" />
          </div>

          <div className="absolute" style={{ top: 80 * SCALE, left: 20 * SCALE, width: 170 * SCALE }}>
              <p style={{ fontSize: 11 * 0.3528 * SCALE, marginBottom: 8 * SCALE }}>{settings.text_pembuka}</p>
              
              <div style={{ marginLeft: 5 * SCALE }} className="h-20 border border-dotted border-slate-200 mb-4 flex items-center justify-center text-[10px] text-slate-300 uppercase">Data Kepala Sekolah (Auto)</div>

              <p style={{ fontSize: 11 * 0.3528 * SCALE, marginBottom: 4 * SCALE }}>{settings.text_menerangkan}</p>

              <div style={{ marginLeft: 5 * SCALE }} className="h-24 border border-dotted border-slate-200 mb-6 flex items-center justify-center text-[10px] text-slate-300 uppercase">Data Siswa (Auto)</div>

              <p style={{ fontSize: 11 * 0.3528 * SCALE, marginBottom: 6 * SCALE }}>{settings.text_keputusan?.replace("{tahun_ajaran}", settings.tahun_ajaran)}</p>

              <div style={{ width: 60 * SCALE, height: 15 * SCALE, fontSize: 16 * 0.3528 * SCALE }} className="border-[0.5mm] border-black mx-auto mb-6 flex items-center justify-center font-bold">LULUS</div>

              <p style={{ fontSize: 11 * 0.3528 * SCALE }}>{settings.text_penutup}</p>
          </div>

          {/* SIGNATURE */}
          <ElementBox title="Tanda Tangan" x={settings.sig_x} y={settings.sig_y} w={settings.sig_width} h={settings.sig_height} id="sig">
             <img src={`/tte/signature.png?t=${Date.now()}`} className="w-full h-full object-contain pointer-events-none" />
          </ElementBox>

          {/* STAMP */}
          <ElementBox title="Cap Sekolah" x={settings.stamp_x} y={settings.stamp_y} w={settings.stamp_width} h={settings.stamp_height} id="stamp">
             <img src={`/tte/stamp.png?t=${Date.now()}`} className="w-full h-full object-contain pointer-events-none" />
          </ElementBox>

          {/* NAMA KEPSEK (Fixed visual guide) */}
          <div className="absolute" style={{ left: 130 * SCALE, top: (settings.sig_y + settings.sig_height + 5) * SCALE }}>
              <div style={{ fontSize: 11 * 0.3528 * SCALE }} className="font-bold line-clamp-1">{settings.nama_kepsek.toUpperCase()}</div>
              <div style={{ fontSize: 11 * 0.3528 * SCALE }} className="line-clamp-1">NIP. {settings.nip_kepsek}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
