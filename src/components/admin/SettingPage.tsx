"use client";
import { useState, useEffect } from "react";
import { SettingsInput } from "@/components/admin/SettingsInput";
import { SettingsCard } from "@/components/admin/SettingsCard";

export default function SettingPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    nama_kepsek: "CUCU IMAN, S. Pd, M. M. Pd",
    nip_kepsek: "197306072000121002",
    pangkat: "IV/b",
    tahun_ajaran: "2024/2025",
    tgl_surat: "Juni 2026",
    nomor_surat: "056/KPG.01.06/SMAN1MARGAASIH",
    is_active: true,
  });

  // Ambil data saat halaman dibuka
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/setting");
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server Error:", errorText);
          return;
        }
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

  // Simpan data ke Database
  const handleSave = async () => {
    setLoading(true);
    try {
      // Bersihkan field ID agar tidak error di MongoDB
      const { _id, __v, createdAt, updatedAt, ...payload } = settings as any;

      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Berhasil disimpan! Data SKL otomatis terupdate.");
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
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

      <div className="flex justify-center pt-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Update Konfigurasi 🚀"}
        </button>
      </div>
    </div>
  );
}