"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import confetti from "canvas-confetti";
import { generateSKL } from '@/lib/pdfGenerator';

export default function HalamanCekKelulusan() {
  const [nisn, setNisn] = useState("");
  const [tglLahirInput, setTglLahirInput] = useState(""); // Format YYYY-MM-DD dari browser
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [hasilSiswa, setHasilSiswa] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const refreshCaptcha = async () => {
    const res = await fetch("/api/captcha");
    const json = await res.json();
    setCaptchaQuestion(json.question);
    setCaptchaInput("");
  };

  useEffect(() => { refreshCaptcha(); }, []);

  // FUNGSI KONVERSI TANGGAL: YYYY-MM-DD -> DD/MM/YYYY
  const formatTanggalKeIndo = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPesanError("");

    // Kita ubah dulu formatnya sebelum dikirim ke server
    const tglFormatted = formatTanggalKeIndo(tglLahirInput);

    try {
      const res = await fetch("/api/siswa/cek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nisn,
          tgl_lahir: tglFormatted, // Kirim format DD/MM/YYYY
          captchaInput
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setHasilSiswa(result.data);
        setShowModal(true);
        if (result.data.status_lulus) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        setPesanError(result.error);
        refreshCaptcha();
      }
    } catch (err) {
      setPesanError("Koneksi bermasalah, coba lagi ya!");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (data: any) => {
    generateSKL(data);
  };

  return (
    <div className="min-h-screen bg-slate-300 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 flex justify-center"><img src={"logo.png"} className="w-30 h-35"/></div>
          <h1 className="text-2xl font-black text-slate-800 uppercase">Cek Kelulusan</h1>
          <p className="text-sm text-slate-400 font-medium">Gunakan NISN dan Tanggal Lahirmu</p>
        </div>

        <form onSubmit={handleCek} className="space-y-5">
          {/* INPUT NISN */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">NISN</label>
            <input 
              type="text" required placeholder="10 Digit NISN"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
            />
          </div>

          {/* INPUT TANGGAL LAHIR (DATE PICKER) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Tanggal Lahir</label>
            <input 
              type="date" required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 cursor-pointer"
              value={tglLahirInput}
              onChange={(e) => setTglLahirInput(e.target.value)}
            />
          </div>

          {/* CAPTCHA */}
          <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-black text-blue-700">{captchaQuestion || "Menghitung..."}</p>
              <button type="button" onClick={refreshCaptcha} className="text-xl">🔄</button>
            </div>
            <input 
              type="number" required placeholder="Hasilnya?"
              className="w-full px-6 py-4 bg-white border border-blue-200 rounded-2xl text-center font-black"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
          </div>

          {pesanError && <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl text-center">⚠️ {pesanError}</div>}

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            {isLoading ? "Sabar Ya..." : "Lihat Hasil 🚀"}
          </button>
        </form>
      </div>

      {/* MODAL HASIL */}
      {showModal && hasilSiswa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
            <div className={`p-8 text-center text-white ${hasilSiswa.status_lulus ? 'bg-green-500' : 'bg-orange-500'}`}>
              <div className="text-5xl mb-2">{hasilSiswa.status_lulus ? "🎉" : "📋"}</div>
              <h2 className="text-2xl font-black uppercase tracking-widest">
                {hasilSiswa.status_lulus ? "Kamu Lulus!" : "Hasil Pengumuman"}
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</p>
                  <p className="text-lg font-black text-slate-800 uppercase">{hasilSiswa.nama}</p>
                  <p className="text-lg font-black text-slate-800 uppercase">{hasilSiswa.kelas}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div><p className="text-[10px] text-slate-400">NISN</p>{hasilSiswa.nisn}</div>
                  <div><p className="text-[10px] text-slate-400">TGL LAHIR</p>{hasilSiswa.tgl_lahir}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div><p className="text-[10px] text-slate-400">NIS</p>{hasilSiswa.nis}</div>
                  <div><p className="text-[10px] text-slate-400">NAMA AYAH</p>{hasilSiswa.nama_ayah}</div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata Nilai</p>
                  <p className="text-xl font-black text-blue-600">{hasilSiswa.rata_rata_nilai || "-"}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {hasilSiswa.status_lulus && (
                  <button onClick={() => downloadPDF(hasilSiswa)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">📥 Download PDF</button>
                )}
                <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}