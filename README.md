# Website Ujian Kecepatan Mengetik — BPS Kabupaten Tana Tidung

Aplikasi web minimalis untuk ujian kecepatan mengetik Bahasa Indonesia berdurasi 1 menit dengan sistem maksimal 3 kali percobaan (mengambil nilai terbaik) dan fitur unduh sertifikat otomatis.

## Struktur File
- `index.html` — Struktur halaman utama (Form Identitas & Pakta Integritas, Area Tes 1 Menit, Hasil & Sertifikat)
- `style.css` — Desain antarmuka minimalis dengan warna primer Putih & Biru Langit
- `script.js` — Logika perhitungan KPM (Kata Per Menit), Jumlah Kata, Akurasi, batas 3 percobaan, dan pembuatan sertifikat

## Cara Menghubungkan ke Domain Sendiri
Karena website ini berbasis statis murni (HTML, CSS, JS tanpa ketergantungan database eksternal), Anda dapat mengunggahnya dengan sangat mudah:

1. **Menggunakan Vercel / Netlify / Cloudflare Pages (Gratis & Cepat)**:
   - Buat project baru dan unggah folder `uji-ketik-bps` (atau hubungkan ke GitHub).
   - Masuk ke menu **Settings > Domains**, lalu masukkan nama domain Anda.
   - Arahkan DNS (`A Record` atau `CNAME`) pada penyedia domain Anda sesuai instruksi yang tampil.
2. **Menggunakan Hosting Biasa / cPanel**:
   - Buka **File Manager** lalu masuk ke direktori `public_html`.
   - Unggah ketiga file (`index.html`, `style.css`, `script.js`) langsung ke dalam folder tersebut.
