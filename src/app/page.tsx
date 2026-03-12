"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import confetti from "canvas-confetti";

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
    const lulus = data.status_lulus ? "LULUS" : "TIDAK LULUS";
    const doc = new jsPDF();

    const img = new Image();
    img.src = '/kop.png'; 
    
    img.onload = () => {
      // 1. KOP SURAT
      doc.addImage(img, 'PNG', 10, 10, 190, 40); 

      // 2. JUDUL SURAT (BOLD)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("SURAT KETERANGAN LULUS", 105, 60, { align: "center" });
      
      // SISANYA TIDAK BOLD
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Nomor : 056/KPG.01.06/SMAN1MARGAASIH", 105, 67, { align: "center" });
      doc.line(65, 69, 145, 69);

      // 3. DATA KEPALA SEKOLAH (NORMAL)
      doc.text("Yang bertanda tangan dibawah ini :", 20, 80);
      
      autoTable(doc, {
        startY: 83,
        margin: { left: 25 },
        body: [
          ["Nama", ": CUCU IMAN, S. Pd, M. M. Pd"],
          ["NIP", ": 197306072000121002"],
          ["Pangkat/Gol", ": IV/b"],
          ["Jabatan", ": Kepala SMA Negeri 1 Margaasih"],
        ],
        theme: "plain",
        styles: { fontSize: 11, cellPadding: 1, fontStyle: "normal" }, // Normal
        columnStyles: { 0: { cellWidth: 35 } },
      });

      // 4. DATA SISWA (NORMAL)
      const middleY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Dengan ini menerangkan bahwa :", 20, middleY);

      autoTable(doc, {
        startY: middleY + 3,
        margin: { left: 25 },
        body: [
          ["Nama", `: ${data.nama.toUpperCase()}`],
          ["Tempat, Tanggal Lahir", `: ${data.tempat_lahir}, ${data.tgl_lahir}`],
          ["Nama Ayah", `: ${data.nama_ayah}`],
          ["NIS", `: ${data.nis}`],
          ["NISN", `: ${data.nisn}`],
        ],
        theme: "plain",
        styles: { fontSize: 11, cellPadding: 1, fontStyle: "normal" }, // Normal
        columnStyles: { 0: { cellWidth: 45 } },
      });

      // 5. PERNYATAAN LULUS & KOTAK "LULUS" (SESUAI GAMBAR)
      const statementY = (doc as any).lastAutoTable.finalY + 15;
      const textPernyataan = "Berdasarkan hasil evaluasi pembelajaran Tahun Pelajaran 2024/2025, siswa tersebut di atas telah dinyatakan :";
      
      const splitPernyataan = doc.splitTextToSize(textPernyataan, 170);
      doc.text(splitPernyataan, 20, statementY);

      // MEMBUAT KOTAK LULUS SEPERTI DI GAMBAR
      const boxWidth = 60;
      const boxHeight = 15;
      const boxX = 105 - (boxWidth / 2); // Center
      const boxY = statementY + 8;

      // Gambar Kotak (Rectangle)
      doc.setLineWidth(0.8); // Garis kotak agak tebal
      doc.rect(boxX, boxY, boxWidth, boxHeight); 
      
      // Tulisan LULUS di dalam kotak
      doc.setFont("helvetica", "bold"); // Khusus kata LULUS dibuat Bold
      doc.setFontSize(16);
      doc.text(`${lulus}`, 105, boxY + 10, { align: "center" });

      // Kembali ke Normal
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Demikian Surat Keterangan Lulus ini dibuat agar dapat digunakan keperluan lain sesuai kebutuhan.", 20, boxY + 25);

      // 6. TANDA TANGAN
      const ttdY = boxY + 50;
      doc.text("Bandung,  Juni 2026", 140, ttdY);
      doc.text("Kepala SMAN 1 MARGAASIH", 140, ttdY + 7);
      
      doc.text("CUCU IMAN, S. Pd, M. M. Pd", 140, ttdY + 30);
      doc.line(140, ttdY + 31, 195, ttdY + 31); // Garis bawah nama kepsek
      doc.text("NIP. 197306072000121002", 140, ttdY + 36);

      doc.save(`SKL_SMAN1MAG_2026_${data.nama}.pdf`);
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
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
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div><p className="text-[10px] text-slate-400">NISN</p>{hasilSiswa.nisn}</div>
                  <div><p className="text-[10px] text-slate-400">TGL LAHIR</p>{hasilSiswa.tgl_lahir}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div><p className="text-[10px] text-slate-400">NIS</p>{hasilSiswa.nis}</div>
                  <div><p className="text-[10px] text-slate-400">NAMA AYAH</p>{hasilSiswa.nama_ayah}</div>
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