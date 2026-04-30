import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSKL = (data: any) => {
  const lulus = data.status_lulus ? "LULUS" : "TIDAK LULUS";
  const doc = new jsPDF();
  
  const set = data.pengaturan;
  const kepsek = set?.nama_kepsek || "Nama Kepala Sekolah";
  const nip = set?.nip_kepsek || "NIP. -";
  const pangkat = set?.pangkat || "-";
  const nomorSurat = set?.nomor_surat || "000/xxx/2026";
  const tglSurat = set?.tgl_surat || "Juni 2026";
  const tahunAjaran = set?.tahun_ajaran || "2025/2026";

  const imgKop = new Image();
  const imgTtd = new Image();
  const imgCap = new Image();

  imgKop.src = '/kop.png'; 
  imgTtd.src = `/tte/signature.png?t=${Date.now()}`;
  imgCap.src = `/tte/stamp.png?t=${Date.now()}`;

  // Fungsi pembantu agar gambar dimuat dulu baru cetak PDF
  const loadImage = (img: HTMLImageElement) => {
    return new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  // Kita pakai Async/Await supaya lebih rapi daripada callback bertingkat
  Promise.all([loadImage(imgKop), loadImage(imgTtd), loadImage(imgCap)]).then(() => {
    // 1. KOP SURAT
    doc.addImage(imgKop, 'PNG', 10, 10, 190, 40); 

    // 2. JUDUL SURAT
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SURAT KETERANGAN LULUS", 105, 60, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor : ${nomorSurat}`, 105, 67, { align: "center" });
    doc.line(65, 69, 145, 69);

    // 3. DATA KEPALA SEKOLAH
    doc.text("Yang bertanda tangan dibawah ini :", 20, 80);
    autoTable(doc, {
      startY: 83,
      margin: { left: 25 },
      body: [
        ["Nama", `: ${kepsek.toUpperCase()}`],
        ["NIP", `: ${nip}`],
        ["Pangkat/Gol", `: ${pangkat}`],
        ["Jabatan", `: Kepala SMA Negeri 1 Margaasih`],
      ],
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 35 } },
    });

    // 4. DATA SISWA
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
        ["Rata-rata Nilai", `: ${data.rata_rata_nilai || "-"}`],
      ],
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 45 } },
    });

    // 5. STATUS KELULUSAN
    const statementY = (doc as any).lastAutoTable.finalY + 15;
    doc.text(`Berdasarkan hasil evaluasi pembelajaran Tahun Pelajaran ${tahunAjaran}, siswa tersebut di atas telah dinyatakan :`, 20, statementY, { maxWidth: 170 });

    const boxY = statementY + 10;
    doc.setLineWidth(0.5);
    doc.rect(75, boxY, 60, 15); 
    doc.setFont("helvetica", "bold").setFontSize(16);
    doc.text(`${lulus}`, 105, boxY + 10, { align: "center" });

    doc.setFont("helvetica", "normal").setFontSize(11);
    doc.text("Demikian Surat Keterangan Lulus ini dibuat agar dapat digunakan keperluan lain sesuai kebutuhan.", 20, boxY + 25);

    // 6. TANDA TANGAN & CAP
    const ttdAreaY = boxY + 45;
    doc.text(`Bandung, ${tglSurat}`, 130, ttdAreaY);
    doc.text(`Kepala SMA Negeri 1 Margaasih,`, 130, ttdAreaY + 7);

    // Debugging: Cek status tte di console
    console.log("Status TTE di PDF:", set?.show_tte);

    // Tambahkan TTD & Cap (Hanya jika diaktifkan di setting)
    // Kita cek secara eksplisit === true agar lebih aman
    if (set?.show_tte === true) {
      doc.addImage(imgTtd, 'PNG', 135, ttdAreaY + 10, 40, 20);
      doc.addImage(imgCap, 'PNG', 120, ttdAreaY + 8, 30, 30);
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${kepsek.toUpperCase()}`, 130, ttdAreaY + 40);
    doc.line(130, ttdAreaY + 41, 185, ttdAreaY + 41);
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${nip}`, 130, ttdAreaY + 46);

    // Selesai!
    doc.save(`SKL_${data.nisn}_${data.nama.split(' ')[0]}.pdf`);
  });
};