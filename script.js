// Daftar kata Bahasa Indonesia umum & istilah kerja/statistik untuk tes mengetik
const WORD_POOL = [
  "saya", "anda", "kita", "mereka", "ini", "itu", "yang", "dan", "di", "ke",
  "dari", "untuk", "pada", "dengan", "adalah", "tidak", "bisa", "akan", "sudah", "belum",
  "dalam", "atau", "juga", "oleh", "karena", "sebagai", "dapat", "lebih", "harus", "setiap",
  "data", "statistik", "survei", "sensus", "angka", "tabel", "grafik", "analisis", "laporan", "publikasi",
  "kabupaten", "provinsi", "nasional", "daerah", "wilayah", "desa", "kecamatan", "penduduk", "ekonomi", "sosial",
  "pertumbuhan", "inflasi", "indeks", "harga", "konsumen", "produksi", "distribusi", "pertanian", "industri", "perdagangan",
  "kerja", "kantor", "waktu", "cepat", "tepat", "akurat", "teliti", "mandiri", "jujur", "integritas",
  "komputer", "sistem", "informasi", "digital", "jaringan", "aplikasi", "dokumen", "arsip", "berkas", "halaman",
  "tahun", "bulan", "minggu", "hari", "jam", "menit", "detik", "jadwal", "target", "kinerja",
  "masyarakat", "pelayanan", "publik", "kualitas", "standar", "metode", "sampel", "populasi", "variabel", "indikator",
  "kegiatan", "lapangan", "petugas", "responden", "wawancara", "kuesioner", "validasi", "evaluasi", "monitoring", "pengolahan",
  "pendidikan", "kesehatan", "perumahan", "lingkungan", "transportasi", "komunikasi", "pariwisata", "keuangan", "anggaran", "program",
  "rencana", "strategi", "tujuan", "hasil", "capaian", "manfaat", "dampak", "perkembangan", "kemajuan", "inovasi",
  "belajar", "membaca", "menulis", "mengetik", "menghitung", "menyusun", "memeriksa", "mengirim", "menerima", "menyimpan",
  "baik", "benar", "jelas", "lengkap", "rapi", "teratur", "mudah", "penting", "utama", "resmi",
  "baru", "lama", "besar", "kecil", "tinggi", "rendah", "banyak", "sedikit", "semua", "beberapa",
  "antara", "melalui", "terhadap", "tentang", "seperti", "ketika", "setelah", "sebelum", "selama", "hingga",
  "namun", "tetapi", "sehingga", "apabila", "jika", "maka", "agar", "supaya", "walaupun", "meskipun",
  "indonesia", "kalimantan", "utara", "tidung", "pemerintah", "instansi", "lembaga", "badan", "pusat", "satuan"
];

const TEST_DURATION = 60; // 60 detik (1 menit)
const MAX_ATTEMPTS = 3;

// Elemen DOM
const stepIntro = document.getElementById("stepIntro");
const stepTest = document.getElementById("stepTest");
const stepResult = document.getElementById("stepResult");

const introForm = document.getElementById("introForm");
const fullNameInput = document.getElementById("fullName");
const integrityCheck = document.getElementById("integrityCheck");
const startBtn = document.getElementById("startBtn");
const headerRight = document.getElementById("headerRight");
const headerParticipant = document.getElementById("headerParticipant");
const exitHeaderBtn = document.getElementById("exitHeaderBtn");

const attemptText = document.getElementById("attemptText");
const statusHint = document.getElementById("statusHint");
const timerDisplay = document.getElementById("timerDisplay");
const wordContainer = document.getElementById("wordContainer");
const typingInput = document.getElementById("typingInput");

const bestWpmEl = document.getElementById("bestWpm");
const bestWordsEl = document.getElementById("bestWords");
const bestAccuracyEl = document.getElementById("bestAccuracy");
const historyBody = document.getElementById("historyBody");
const retryBtn = document.getElementById("retryBtn");
const downloadCertBtn = document.getElementById("downloadCertBtn");
const printCertBtn = document.getElementById("printCertBtn");
const resetParticipantBtn = document.getElementById("resetParticipantBtn");
const certificateCanvas = document.getElementById("certificateCanvas");

const confirmModal = document.getElementById("confirmModal");
const cancelExitBtn = document.getElementById("cancelExitBtn");
const confirmExitBtn = document.getElementById("confirmExitBtn");

// State Aplikasi
let participantName = "";
let certificateId = "";
let attempts = []; // Menyimpan objek { attemptNumber, wpm, totalWords, correctWords, accuracy }
let inActiveSession = false; // True saat sudah melewati halaman awal

// State per Percobaan
let words = [];
let currentWordIndex = 0;
let timeLeft = TEST_DURATION;
let timerInterval = null;
let testStarted = false;
let testFinished = false;

let correctWordsCount = 0;
let totalTypedWordsCount = 0;
let correctCharsCount = 0;
let totalTypedCharsCount = 0;

// Helper Format Huruf Kapital di Awal Kata (Title Case)
function toTitleCase(str) {
  return str.replace(/\S+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

// Validasi Form Awal & Auto Kapital Nama
function updateStartButtonState() {
  const hasName = fullNameInput.value.trim().length >= 2;
  const isChecked = integrityCheck.checked;
  startBtn.disabled = !(hasName && isChecked);
}

fullNameInput.addEventListener("input", () => {
  const start = fullNameInput.selectionStart;
  const end = fullNameInput.selectionEnd;
  const formatted = toTitleCase(fullNameInput.value);

  if (fullNameInput.value !== formatted) {
    fullNameInput.value = formatted;
    fullNameInput.setSelectionRange(start, end);
  }
  updateStartButtonState();
});

integrityCheck.addEventListener("change", updateStartButtonState);

// Buat ID Sertifikat Unik
function generateCertificateId() {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BPS-6504/${year}/UKM-${rand}`;
}

// Submit Form Mulai
introForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (startBtn.disabled) return;

  participantName = toTitleCase(fullNameInput.value.trim().replace(/\s+/g, " "));
  fullNameInput.value = participantName;
  certificateId = generateCertificateId();
  attempts = [];
  inActiveSession = true;

  // Dorong state riwayat browser agar tombol Back memunculkan pop-up konfirmasi
  history.pushState({ sessionActive: true }, "");

  headerParticipant.textContent = `Peserta: ${participantName}`;
  headerRight.classList.remove("hidden");

  startNewAttempt();
});

// Acak Kata
function generateWords(count = 180) {
  const result = [];
  let lastWord = "";
  for (let i = 0; i < count; i++) {
    let candidate = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    while (candidate === lastWord) {
      candidate = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    }
    result.push(candidate);
    lastWord = candidate;
  }
  return result;
}

// Mulai Percobaan Baru
function startNewAttempt() {
  stepIntro.classList.add("hidden");
  stepResult.classList.add("hidden");
  stepTest.classList.remove("hidden");

  words = generateWords(200);
  currentWordIndex = 0;
  timeLeft = TEST_DURATION;
  testStarted = false;
  testFinished = false;

  correctWordsCount = 0;
  totalTypedWordsCount = 0;
  correctCharsCount = 0;
  totalTypedCharsCount = 0;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const currentAttemptNum = attempts.length + 1;
  attemptText.textContent = `${currentAttemptNum} / ${MAX_ATTEMPTS}`;
  statusHint.textContent = "Ketik kata pertama untuk memulai waktu (1 menit)";
  timerDisplay.textContent = formatTime(timeLeft);
  timerDisplay.classList.remove("warning");

  renderWords();

  typingInput.value = "";
  typingInput.disabled = false;
  typingInput.focus();
}

// Render Daftar Kata ke Layar
function renderWords() {
  wordContainer.innerHTML = "";
  wordContainer.style.transform = "translateY(0px)";

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "word" + (index === 0 ? " active" : "");
    span.dataset.index = index;
    span.textContent = word;
    wordContainer.appendChild(span);
  });
}

// Format Detik ke MM:SS
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Mulai Hitung Mundur 1 Menit
function startTimer() {
  if (testStarted) return;
  testStarted = true;
  statusHint.textContent = "Ujian sedang berlangsung...";

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 10) {
      timerDisplay.classList.add("warning");
    }

    if (timeLeft <= 0) {
      finishAttempt();
    }
  }, 1000);
}

// Hitung kesamaan karakter per kata
function countMatchingChars(typed, target) {
  let matches = 0;
  const minLen = Math.min(typed.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (typed[i] === target[i]) {
      matches++;
    }
  }
  return matches;
}

// Evaluasi Kata Saat Spasi Ditekan
function evaluateCurrentWord(typedValue) {
  const targetWord = words[currentWordIndex];
  const wordElements = wordContainer.children;
  const currentSpan = wordElements[currentWordIndex];

  totalTypedWordsCount++;
  const maxLen = Math.max(typedValue.length, targetWord.length);
  totalTypedCharsCount += maxLen;

  if (typedValue === targetWord) {
    correctWordsCount++;
    correctCharsCount += targetWord.length;
    currentSpan.classList.remove("active", "typing-error");
    currentSpan.classList.add("correct");
  } else {
    correctCharsCount += countMatchingChars(typedValue, targetWord);
    currentSpan.classList.remove("active", "typing-error");
    currentSpan.classList.add("incorrect");
  }

  currentWordIndex++;

  // Tambah kata baru jika hampir habis
  if (currentWordIndex > words.length - 40) {
    const moreWords = generateWords(100);
    moreWords.forEach((w) => {
      words.push(w);
      const span = document.createElement("span");
      span.className = "word";
      span.dataset.index = words.length - 1;
      span.textContent = w;
      wordContainer.appendChild(span);
    });
  }

  const nextSpan = wordElements[currentWordIndex];
  if (nextSpan) {
    nextSpan.classList.add("active");
    scrollWordViewport(nextSpan);
  }
}

// Geser baris kata otomatis agar kata aktif selalu di baris atas/tengah secara responsif
function scrollWordViewport(activeSpan) {
  const firstSpan = wordContainer.children[0];
  if (!firstSpan || !activeSpan) return;
  const lineOffset = activeSpan.offsetTop - firstSpan.offsetTop;
  const computed = window.getComputedStyle(wordContainer);
  const lineHeight = parseFloat(computed.lineHeight) || 42;
  const rowGap = parseFloat(computed.rowGap) || 6;
  const singleRowStep = lineHeight + rowGap;
  const scrollAmount = Math.max(0, lineOffset - singleRowStep);
  wordContainer.style.transform = `translateY(-${scrollAmount}px)`;
}

window.addEventListener("resize", () => {
  const activeSpan = wordContainer.children[currentWordIndex];
  if (activeSpan) {
    scrollWordViewport(activeSpan);
  }
});

// Event Input Mengetik
typingInput.addEventListener("input", () => {
  if (testFinished) return;

  const rawVal = typingInput.value;

  if (!testStarted && rawVal.trim().length > 0) {
    startTimer();
  }

  // Jika pengguna menekan spasi
  if (rawVal.endsWith(" ")) {
    const typedWord = rawVal.trim();
    if (typedWord.length > 0) {
      evaluateCurrentWord(typedWord);
    }
    typingInput.value = "";
    return;
  }

  // Highlight merah jika huruf sementara tidak cocok dengan awalan kata target
  const currentSpan = wordContainer.children[currentWordIndex];
  const targetWord = words[currentWordIndex];
  if (currentSpan && targetWord) {
    if (!targetWord.startsWith(rawVal)) {
      currentSpan.classList.add("typing-error");
    } else {
      currentSpan.classList.remove("typing-error");
    }
  }
});

// Cegah Paste / Drop di kolom ketik
typingInput.addEventListener("paste", (e) => e.preventDefault());
typingInput.addEventListener("drop", (e) => e.preventDefault());

// Selesaikan Percobaan Saat Waktu Habis
function finishAttempt() {
  if (testFinished) return;
  testFinished = true;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Jika saat waktu habis kata yang sedang diketik sudah sama persis dengan kata target, hitung juga
  const lastTyped = typingInput.value.trim();
  if (lastTyped.length > 0 && lastTyped === words[currentWordIndex]) {
    evaluateCurrentWord(lastTyped);
  }

  typingInput.value = "";
  typingInput.disabled = true;

  const wpm = correctWordsCount;
  const totalWords = totalTypedWordsCount;
  const accuracy =
    totalTypedWordsCount > 0
      ? Math.round((correctWordsCount / totalTypedWordsCount) * 100)
      : 0;

  attempts.push({
    attemptNumber: attempts.length + 1,
    wpm,
    totalWords,
    correctWords: correctWordsCount,
    accuracy
  });

  showResultScreen();
}

// Ambil Percobaan Terbaik (Tertinggi)
function getBestAttempt() {
  if (attempts.length === 0) {
    return { attemptNumber: 1, wpm: 0, totalWords: 0, correctWords: 0, accuracy: 0 };
  }

  return attempts.reduce((best, current) => {
    if (current.wpm > best.wpm) return current;
    if (current.wpm === best.wpm && current.accuracy > best.accuracy) return current;
    if (
      current.wpm === best.wpm &&
      current.accuracy === best.accuracy &&
      current.totalWords > best.totalWords
    ) {
      return current;
    }
    return best;
  }, attempts[0]);
}

// Tampilkan Halaman Hasil & Sertifikat
function showResultScreen() {
  stepTest.classList.add("hidden");
  stepResult.classList.remove("hidden");

  const best = getBestAttempt();

  bestWpmEl.textContent = best.wpm;
  bestWordsEl.textContent = best.totalWords;
  bestAccuracyEl.textContent = `${best.accuracy}%`;

  // Render tabel riwayat percobaan
  historyBody.innerHTML = "";
  attempts.forEach((item) => {
    const isBest = item.attemptNumber === best.attemptNumber;
    const tr = document.createElement("tr");
    if (isBest) tr.classList.add("best-row");

    tr.innerHTML = `
      <td>Percobaan ${item.attemptNumber}</td>
      <td>${item.wpm} KPM</td>
      <td>${item.correctWords} benar dari ${item.totalWords} kata</td>
      <td>${item.accuracy}%</td>
      <td>
        <span class="${isBest ? "status-best" : "status-normal"}">
          ${isBest ? "Nilai Terbaik (Diambil)" : "Tercatat"}
        </span>
      </td>
    `;
    historyBody.appendChild(tr);
  });

  // Atur tombol Coba Lagi (maksimal 3 kali) dengan spasi yang rapi
  const remaining = MAX_ATTEMPTS - attempts.length;
  if (remaining > 0) {
    retryBtn.classList.remove("hidden");
    retryBtn.textContent = `Coba Lagi (${remaining} kesempatan tersisa)`;
  } else {
    retryBtn.classList.add("hidden");
  }

  // Gambar sertifikat dengan nilai terbaik
  drawCertificate(best);
}

// Tombol Coba Lagi
retryBtn.addEventListener("click", () => {
  if (attempts.length < MAX_ATTEMPTS) {
    startNewAttempt();
  }
});

// ========================
// MODAL PERINGATAN KELUAR / RESET
// ========================
function openExitModal() {
  confirmModal.classList.remove("hidden");
}

function closeExitModal() {
  confirmModal.classList.add("hidden");
  // Jika sedang mengetik dan tes belum selesai, kembalikan fokus ke input ketik
  if (!stepTest.classList.contains("hidden") && !testFinished) {
    typingInput.focus();
  }
}

function resetToHome() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  inActiveSession = false;
  testStarted = false;
  testFinished = false;
  attempts = [];

  confirmModal.classList.add("hidden");
  stepTest.classList.add("hidden");
  stepResult.classList.add("hidden");
  stepIntro.classList.remove("hidden");
  headerRight.classList.add("hidden");

  fullNameInput.value = "";
  integrityCheck.checked = false;
  updateStartButtonState();
  fullNameInput.focus();
}

// Klik tombol Keluar di Header atau Ganti Peserta Baru
exitHeaderBtn.addEventListener("click", openExitModal);
resetParticipantBtn.addEventListener("click", openExitModal);

cancelExitBtn.addEventListener("click", closeExitModal);
confirmExitBtn.addEventListener("click", resetToHome);

// Klik area gelap di luar kartu modal untuk batal
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    closeExitModal();
  }
});

// Cegah tombol Back browser langsung keluar tanpa pop-up
window.addEventListener("popstate", () => {
  if (inActiveSession) {
    // Kembalikan state agar halaman tidak pindah, lalu tampilkan modal tema UI
    history.pushState({ sessionActive: true }, "");
    openExitModal();
  }
});

// Cegah pintasan Refresh keyboard (F5 / Ctrl+R / Cmd+R) saat sesi berlangsung dan tampilkan pop-up UI
window.addEventListener("keydown", (e) => {
  if (!inActiveSession) return;

  const isF5 = e.key === "F5";
  const isCtrlR = (e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R");

  if (isF5 || isCtrlR) {
    e.preventDefault();
    openExitModal();
  } else if (e.key === "Escape" && !confirmModal.classList.contains("hidden")) {
    closeExitModal();
  }
});

// Peringatan bawaan browser jika pengguna menutup tab atau menekan tombol Reload di bar browser
window.addEventListener("beforeunload", (e) => {
  if (inActiveSession) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ========================
// SERTIFIKAT CANVAS
// ========================
function drawCertificate(bestScore) {
  const ctx = certificateCanvas.getContext("2d");
  const W = certificateCanvas.width;  // 1600
  const H = certificateCanvas.height; // 1131

  // 1. Latar Belakang Putih Bersih
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // 2. Aksen Sudut & Bingkai Minimalis Biru Langit
  ctx.fillStyle = "#F0F9FF";
  ctx.fillRect(40, 40, W - 80, H - 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(68, 68, W - 136, H - 136);

  // Garis Bingkai Luar
  ctx.strokeStyle = "#0EA5E9";
  ctx.lineWidth = 3;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  // Garis Bingkai Dalam Tipis
  ctx.strokeStyle = "#BAE6FD";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(82, 82, W - 164, H - 164);

  // Bar Aksen Atas Biru Langit
  ctx.fillStyle = "#0EA5E9";
  ctx.fillRect(68, 68, W - 136, 12);

  // 3. Ikon Grafik Statistik Minimalis di Tengah Atas
  const iconCenterX = W / 2;
  const iconTopY = 140;
  ctx.fillStyle = "#0284C7";
  roundRect(ctx, iconCenterX - 30, iconTopY + 20, 14, 28, 3, true);
  ctx.fillStyle = "#0EA5E9";
  roundRect(ctx, iconCenterX - 7, iconTopY + 10, 14, 38, 3, true);
  ctx.fillStyle = "#38BDF8";
  roundRect(ctx, iconCenterX + 16, iconTopY, 14, 48, 3, true);

  // 4. Nama Instansi
  ctx.textAlign = "center";
  ctx.fillStyle = "#0284C7";
  ctx.font = "700 24px 'Inter', sans-serif";
  ctx.fillText("BADAN PUSAT STATISTIK KABUPATEN TANA TIDUNG", W / 2, 232);

  // 5. Judul Sertifikat
  ctx.fillStyle = "#0F172A";
  ctx.font = "700 46px 'Inter', sans-serif";
  ctx.fillText("SERTIFIKAT UJIAN MENGETIK", W / 2, 305);

  // Nomor Sertifikat
  ctx.fillStyle = "#64748B";
  ctx.font = "500 18px 'JetBrains Mono', monospace";
  ctx.fillText(`Nomor: ${certificateId}`, W / 2, 345);

  // Garis Pemisah Kecil
  ctx.strokeStyle = "#BAE6FD";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, 375);
  ctx.lineTo(W / 2 + 90, 375);
  ctx.stroke();

  // 6. Pengantar Nama Peserta
  ctx.fillStyle = "#475569";
  ctx.font = "400 22px 'Inter', sans-serif";
  ctx.fillText("Diberikan kepada:", W / 2, 425);

  // Nama Peserta (Terformat Kapital Awal Kata)
  ctx.fillStyle = "#0F172A";
  ctx.font = "700 52px 'Inter', sans-serif";
  ctx.fillText(participantName, W / 2, 495);

  // Garis bawah nama
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 520);
  ctx.lineTo(W / 2 + 280, 520);
  ctx.stroke();

  // 7. Deskripsi Capaian
  ctx.fillStyle = "#475569";
  ctx.font = "400 21px 'Inter', sans-serif";
  ctx.fillText(
    "Telah menyelesaikan Ujian Kecepatan dan Akurasi Mengetik (Durasi 1 Menit) secara mandiri",
    W / 2,
    572
  );
  ctx.fillText(
    "dan dapat dipertanggungjawabkan dengan hasil terbaik sebagai berikut:",
    W / 2,
    604
  );

  // 8. Kotak Hasil (KPM, Jumlah Kata, Akurasi)
  const boxWidth = 320;
  const boxHeight = 165;
  const gap = 36;
  const totalBoxesWidth = boxWidth * 3 + gap * 2;
  const startX = (W - totalBoxesWidth) / 2;
  const boxY = 648;

  const metrics = [
    {
      value: `${bestScore.wpm} KPM`,
      label: "Kecepatan (Kata / Menit)"
    },
    {
      value: `${bestScore.totalWords} Kata`,
      label: "Jumlah Kata Terketik"
    },
    {
      value: `${bestScore.accuracy}%`,
      label: "Tingkat Akurasi"
    }
  ];

  metrics.forEach((m, idx) => {
    const x = startX + idx * (boxWidth + gap);

    // Latar Kotak
    ctx.fillStyle = "#F0F9FF";
    roundRect(ctx, x, boxY, boxWidth, boxHeight, 12, true);

    // Border Kotak
    ctx.strokeStyle = "#BAE6FD";
    ctx.lineWidth = 2;
    roundRect(ctx, x, boxY, boxWidth, boxHeight, 12, false, true);

    // Nilai Utama
    ctx.fillStyle = "#0284C7";
    ctx.font = "700 44px 'Inter', sans-serif";
    ctx.fillText(m.value, x + boxWidth / 2, boxY + 82);

    // Label Metrik
    ctx.fillStyle = "#475569";
    ctx.font = "500 19px 'Inter', sans-serif";
    ctx.fillText(m.label, x + boxWidth / 2, boxY + 125);
  });

  // 9. Footer Tanggal & Pengesahan Instansi
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  ctx.fillStyle = "#64748B";
  ctx.font = "400 18px 'Inter', sans-serif";
  ctx.fillText(
    `Rekor terbaik dari ${attempts.length} percobaan  •  Diterbitkan pada ${dateStr}`,
    W / 2,
    885
  );

  // Garis Tanda Pengesahan
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 160, 965);
  ctx.lineTo(W / 2 + 160, 965);
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 20px 'Inter', sans-serif";
  ctx.fillText("BPS Kabupaten Tana Tidung", W / 2, 998);
}

// Helper menggambar kotak bersudut tumpul di Canvas
function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Unduh Sertifikat sebagai PNG
downloadCertBtn.addEventListener("click", () => {
  const best = getBestAttempt();
  drawCertificate(best);

  const safeName = participantName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const link = document.createElement("a");
  link.download = `Sertifikat_Uji_Ketik_BPS_Tana_Tidung_${safeName || "Peserta"}.png`;
  link.href = certificateCanvas.toDataURL("image/png");
  link.click();
});

// Cetak / Simpan sebagai PDF
printCertBtn.addEventListener("click", () => {
  const best = getBestAttempt();
  drawCertificate(best);
  const dataUrl = certificateCanvas.toDataURL("image/png");

  const printWin = window.open("", "_blank");
  if (!printWin) {
    alert("Mohon izinkan pop-up pada browser untuk mencetak PDF, atau gunakan tombol Unduh Sertifikat (PNG).");
    return;
  }

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sertifikat - ${participantName}</title>
      <style>
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
        img { width: 100%; max-width: 100%; height: auto; object-fit: contain; }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" onload="window.print(); window.close();" />
    </body>
    </html>
  `);
  printWin.document.close();
});
