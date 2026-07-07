# Panduan Praktik Terbaik (Best Practices) & Progress Tracker
## Gemini-Powered ISO 27001-2022 Chatbot (with Astra DB Integration)

---

## Tabel Progress Tracker Aplikasi

| No | Nama Fase | Status | Progres | Keterangan |
|---|---|---|---|---|
| 1 | **Fase 1**: Persiapan Lingkungan & Inisialisasi | ✅ Selesai | 100% | Struktur folder siap, dependensi dasar, dan kredensial `.env` terisi. |
| 2 | **Fase 2**: Implementasi Express Backend (`index.js`) | ✅ Selesai | 100% | Pembuatan REST API endpoint & serving folder statis sukses. |
| 3 | **Fase 3**: Integrasi Astra DB via MCP Client | ✅ Selesai | 100% | Koneksi MCP terjalin dan VectorSearch untuk data ISO berhasil. |
| 4 | **Fase 4**: Refaktor Frontend Client-Side (`public/script.js`) | ✅ Selesai | 100% | Pengiriman history percakapan multi-turn berfungsi lancar. |
| 5 | **Fase 5**: Verifikasi, Pengujian & Shipment | ✅ Selesai | 100% | Pengujian E2E sukses dan server berjalan aktif di port 3000. |
| 6 | **Fase 6**: Sinkronisasi & Update ke GitHub | ✅ Selesai | 100% | Konfigurasi git lokal, setup remote, dan push ke GitHub repo sukses. |
| 7 | **Fase 7**: Implementasi Fitur Sidebar & UI Enhancements | ✅ Selesai | 100% | Menambahkan fitur Pesan Baru, Telusuri Percakapan, dan Persistensi riwayat. |
| 8 | **Fase 8**: Sidebar CRUD, Kolaborasi, dan Drag-and-Drop | ✅ Selesai | 100% | Tambahkan edit judul, hapus, bagikan link chat, toggle sidebar, dan reorder list. |
| 9 | **Fase 9**: Fitur Maximize & Minimize Isi Chat (Individu & Global) | ✅ Selesai | 100% | Pembuatan toggle ciutkan/kembangkan balon obrolan secara mandiri maupun massal sukses. |
| 10 | **Fase 10**: Tombol Hapus Chat (Tombol X) & Drag-and-Drop Paket Obrolan | ✅ Selesai | 100% | Pembuatan tombol X untuk hapus pesan individu dan drag-and-drop pasangan obrolan (user + Gemini) sukses. |
| 11 | **Fase 11**: Perbaikan Ikon Global | ✅ Selesai | 100% | Memperbaiki transisi teks tombol balon chat ketika tombol global di klik sukses. |
| 12 | **Fase 12**: Rancangan Panel Admin | ✅ Selesai | 100% | Menyusun spesifikasi dan best practices panel admin chatbot sukses. |
| 13 | **Fase 13**: Rancangan Ganti Password & Shortcut Gear | ✅ Selesai | 100% | Menyusun spesifikasi ganti password admin dan tombol shortcut gear sukses. |
| 14 | **Fase 14**: Perbaikan PDF dan RAG | ✅ Selesai | 100% | Memperbaiki parser PDF modern dan integrasi RAG ke Astra DB. |
| **Total** | **Progres Keseluruhan Aplikasi** | **Selesai Penuh** | **100%** | **Seluruh 14 fase pengembangan dan integrasi selesai sepenuhnya.** |

---

## Rincian Panduan Praktik Terbaik per Fase

### FASE 1: Persiapan Lingkungan & Inisialisasi (Progres: 100%)
* **Pemisahan Aset Statis**: Memindahkan file UI (`index.html`, `script.js`, `style.css`) ke folder `/public` agar struktur backend dan frontend tidak tercampur.
* **Isolasi Variabel Lingkungan**:
  * Semua kredensial seperti `GEMINI_API_KEY`, `ASTRA_DB_APPLICATION_TOKEN`, dan `ASTRA_DB_API_ENDPOINT` disimpan dalam berkas `.env` di folder root proyek.
  * Menyiapkan `.env.example` tanpa nilai asli untuk dipublikasikan ke Git.
  * Memasukkan `.env` ke dalam berkas `.gitignore`.

### FASE 2: Implementasi Express Backend (Progres: 100%)
* **Modularitas Routing**: Membangun server ExpressJS dasar pada berkas `index.js` dengan port default `3000`.
* **Serving Aset**: Mengaktifkan middleware `app.use(express.static('public'))` untuk menyajikan frontend statis secara efisien.
* **Security & Parsing**: Menerapkan middleware `cors()` untuk mengizinkan request lintas origin dan `express.json()` guna membaca request body.

### FASE 3: Integrasi Astra DB via MCP Client (Progres: 100%)
* **Standardisasi MCP**: Menghubungkan backend Express ke **MCP Server astra-db** menggunakan SDK resmi `@modelcontextprotocol/sdk` via transport `stdio`.
* **Penyelamatan Error (Graceful Fallback)**: Jika koneksi ke MCP Server gagal, sistem tetap dapat berjalan dengan memanfaatkan basis pengetahuan bawaan Gemini tanpa menyebabkan crash (error 500).
* **Context Ingestion**: Mengambil data potongan dokumen referensi **ISO 27001-2022 rm.pdf** dari Astra DB menggunakan parameter pencarian masukan terakhir pengguna (similarity vector), lalu menyuntikkannya ke `systemInstruction` Gemini API.

### FASE 4: Refaktor Frontend Client-Side (Progres: 100%)
* **State Management Multi-turn**: Mengelola riwayat percakapan dalam array objek `{ role: "user" | "model", text: "..." }` di sisi frontend untuk diteruskan ke backend.
* **Indikator Proses (Loading State)**: Menyediakan tombol kirim berupa penanda proses loading ketika memanggil API untuk menghindari klik ganda.
* **Penanganan Error Visual**: Menampilkan pesan error yang ramah di layar chat jika backend server tidak merespons atau mengembalikan error.

### FASE 5: Verifikasi, Pengujian & Shipment (Progres: 100%)
* **Kepatuhan Doktrin Karpathy**:
  * *Think Before Coding*: Memvalidasi kelancaran interaksi antar komponen sebelum melakukan commit.
  * *Surgical Changes*: Hanya menyentuh berkas yang ditugaskan tanpa merusak file sekitar.
* **Circuit Breaker**: Jika server crash beruntun (lebih dari 3 kali) setelah perubahan kode, kembalikan worktree ke versi commit stabil terdekat secara instan.
* **Shipment**: Menyiapkan file produksi dan memastikan API Key terisolasi penuh sebelum dideploy to server cloud.

### FASE 6: Sinkronisasi & Update ke GitHub (Progres: 100%)
* **Konfigurasi Kredensial Git**:
  * Git Email: `donnyusmar@gmail.com`
  * Git Username: `donnyusmar`
  * Target Repositori GitHub: `https://github.com/donnyusmar/ISO27001-Chatbot.git`
* **Alur Instruksi Fase 6**:
  * Menyiapkan file `.gitignore` untuk menyaring berkas sensitif `.env` dan folder `node_modules/`.
  * Inisialisasi git lokal (`git init`).
  * Merekam konfigurasi user lokal sesuai kredensial pengguna.
  * Menjalankan `git commit` perdana dan menyambungkan remote origin `https://github.com/donnyusmar/ISO27001-Chatbot.git`.
  * Sukses melakukan `git push -u origin main`.

### FASE 7: Implementasi Fitur Sidebar & UI Enhancements (Progres: 100%)
* **UI Kiri (Sidebar Layout)**: Mengubah desain satu kolom menjadi dua kolom dengan sidebar modern selebar 280px.
* **Pesan Baru (New Chat)**: Tombol pembersih context percakapan aktif untuk memulai dialog baru yang terisolasi.
* **Filter Pencarian (Search Input)**: Fitur input pencarian di bagian atas sidebar untuk menyeleksi judul percakapan secara waktu nyata (*real-time filtering*).
* **Persistensi Riwayat (LocalStorage)**: Menyimpan daftar judul thread dan array pesan lengkap di local storage peramban klien agar dapat dimuat kembali secara dinamis.

### FASE 8: Sidebar CRUD, Kolaborasi, dan Drag-and-Drop (Progres: 100%)
* **Sidebar Toggle (Expand/Collapse)**: Tombol toggle sidebar untuk menyembunyikan atau menampilkan sidebar demi fleksibilitas area chat.
* **Menu Konteks Thread (Options)**:
  * Tombol menu tiga titik vertikal di setiap baris percakapan pada daftar "Terbaru".
  * Popup dropdown menu berisi: Edit Judul (inline editing), Hapus (hapus permanen dari LocalStorage), dan Bagikan (kolaborasi data/link percakapan).
* **Reorder List (Drag-and-Drop)**: Implementasi drag-and-drop HTML5 API untuk mengurutkan daftar percakapan dan menyimpan index posisi baru di LocalStorage.

### FASE 9: Fitur Maximize & Minimize Isi Chat (Individu & Global) (Progres: 100%)
* **Toggle Lipat/Kembangkan Balon Chat**: Menambahkan tombol pemicu visual kecil di pojok kanan atas setiap pesan untuk melipat pesan panjang (meminimalkan tinggi balon pesan dengan gradien memudar) dan membukanya kembali.
* **Pengendali Massal (Global Controller)**: Menyediakan tombol pengendali di header obrolan untuk melipat atau mengembangkan seluruh riwayat percakapan secara instan.

### FASE 10: Tombol Hapus Chat (Tombol X) & Drag-and-Drop Paket Obrolan (Progres: 100%)
* **Tombol Hapus Balon Chat (Tombol X)**: Menambahkan tombol aksi ❌ di header setiap balon pesan untuk menghapus pesan individu dari riwayat. (Selesai)
* **Drag-and-Drop Paket Balon Chat**: Mengelompokkan pesan user dan bot ke dalam satu kontainer giliran obrolan (Chat Turn) dan mengizinkan drag-and-drop untuk mengatur ulang urutan pasangan obrolan tersebut secara dinamis. (Selesai)

### FASE 11: Perbaikan Ikon Global (Progres: 100%)
* **Deskripsi**: Memperbaiki transisi teks tombol balon chat ketika tombol global di klik sehingga ikon SVG tidak terdistorsi menjadi tulisan text. (Selesai)

### FASE 12: Rancangan Panel Admin (Progres: 100%)
* **Deskripsi**: Menyusun spesifikasi dan best practices panel admin chatbot untuk mengelola token secara dinamis, mengunggah/menghapus file PDF di database, dan menyetel parameter model AI secara real-time. (Selesai)

### FASE 13: Rancangan Ganti Password & Shortcut Gear (Progres: 100%)
* **Deskripsi**: Menyusun spesifikasi ganti password admin secara dinamis di basis data (Astra DB) dan penempatan tombol pintas roda gigi (*settings*) di panel navigasi obrolan utama. (Selesai)

### FASE 14: Perbaikan PDF dan RAG (Progres: 100%)
* **Adapter Parser PDF Adaptif**: Menyusun skrip parsing teks PDF yang tangguh agar mendukung `pdf-parse` versi modular class-based (v2.x) maupun fungsional CommonJS (v1.x) secara dinamis tanpa mengganggu dependensi.
* **Integrasi Direct Data API**: Mem-bypass MCP child-process untuk operasi CRUD dokumen dan beralih ke Astra DB REST Data API langsung via `fetch` guna meniadakan error resolve DNS / jaringan lokal (`getaddrinfo ENOTFOUND`).
* **Sinkronisasi Skema Langflow**: Menyelaraskan nama properti dokumen (`page_content` untuk teks, `metadata.filename` untuk nama file) agar data yang disimpan dari panel admin sinkron dan terbaca bersama data hasil ingest dari skema Langflow.
