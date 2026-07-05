# Walkthrough Hasil Implementasi Chatbot Gemini + Astra DB

Seluruh tahapan pengembangan chatbot (Fase 1 sampai Fase 5) telah berhasil diselesaikan secara otonom.

---

## 1. Perubahan yang Dilakukan

* **Struktur Folder Terstandarisasi**:
  * Folder baru `/public` dibuat untuk menyimpan file frontend statis.
  * Berkas [index.html](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/public/index.html) dan [style.css](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/public/style.css) dipindahkan ke `/public` agar backend dapat menyajikannya secara statis.
* **Inisialisasi Project Node.js**:
  * Membuat berkas [package.json](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/package.json) dengan type `module` dan dependencies: `express`, `cors`, `dotenv`, `@google/genai`, dan `@modelcontextprotocol/sdk`.
  * Sukses melakukan `npm install` seluruh dependensi backend.
* **Implementasi Backend (`index.js`)**:
  * Menulis berkas [index.js](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/index.js) yang bertindak sebagai Express server lokal sekaligus **MCP Client** yang terhubung ke **MCP Server astra-db**.
  * Endpoint `POST /api/chat` melakukan pengambilan similarity vector (RAG) untuk dokumen `ISO 27001-2022 rm.pdf` (koleksi database `"data"`), lalu meneruskan konteks tersebut ke instruksi sistem Gemini 2.5 Flash API.
* **Refaktor Frontend (`public/script.js`)**:
  * Menulis berkas [script.js](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/public/script.js) untuk merekam riwayat percakapan (`conversationHistory`) secara dinamis, melakukan fetch API ke backend, dan mengelola status visual loading/proses.
* **Pengisian Kredensial Lokal**:
  * Membuat berkas [starter/.env](file:///C:/Users/Donnyusmar/Downloads/rain/v7la-projects/hactiv8/IT-Pro/starter/.env) berisi kredensial valid API Key Gemini & Application Token Astra DB.

---

## 2. Pengujian & Verifikasi Terlaksana

* **Status Startup Server**:
  * Server berhasil dijalankan secara background di **http://localhost:3000** tanpa ada error.
  * Log server menunjukkan koneksi sukses terhubung ke MCP Server:
    `Server ready on http://localhost:3000`
    `Successfully connected to Astra DB MCP Server.`
* **Pengujian REST API Endpoint**:
  * Pengujian HTTP request `POST` ke `/api/chat` melalui PowerShell berhasil menerima balasan valid dari model Gemini 2.5 Flash dalam Bahasa Indonesia:
    `ISO 27001 adalah standar internasional...`

---

## 3. Sinkronisasi GitHub (Fase 6)
* Berhasil menginisialisasi repository Git lokal di root proyek.
* Berkas `.gitignore` ditambahkan untuk melindungi berkas kredensial `.env` dan direktori `node_modules/`.
* Mengkonfigurasi git email (`donnyusmar@gmail.com`) dan username (`donnyusmar`).
* Menghubungkan remote repositori origin ke: `https://github.com/donnyusmar/ISO27001-Chatbot.git`.
* Sukses melakukan push pertama branch `main` ke GitHub.

---

## 4. Fitur Antarmuka Pengguna & Sidebar Baru
* **Rangkaian Pesan Baru**: Tombol untuk memulai percakapan baru secara bersih.
* **Telusuri Rangkaian Pesan**: Kolom filter pencarian thread secara waktu nyata (*real-time search*).
* **Terbaru & Persistensi**: Daftar riwayat percakapan yang disimpan di `localStorage` lokal klien dan dapat dibuka kembali kapan saja secara dinamis.
* **Tampilkan Lebih Banyak**: Paginasi daftar thread di sidebar.

---

## 5. Sidebar CRUD, Kolaborasi, dan Drag-and-Drop (Fase 8)
* **Sidebar Toggle**: Menambahkan tombol toggle berikon layout di sidebar kiri atas dan di chat header untuk memperluas (expand) atau menyusutkan (collapse) sidebar.
* **Menu Opsi Rangkaian Pesan (⋮)**:
  * **Edit Judul**: Mengubah judul thread secara langsung menggunakan input text inline.
  * **Bagikan**: Menyandikan (encode) data percakapan menjadi string Base64 yang disisipkan ke dalam URL hash, menyalin link secara otomatis ke clipboard, dan memunculkan toast notifikasi. Saat link tersebut dibuka di browser lain, percakapan dibaca langsung dari hash URL tersebut secara dinamis.
  * **Hapus**: Menghapus data thread tertentu dari LocalStorage.
* **Drag-and-Drop Reordering**: Mendukung pengaturan urutan item daftar dengan cara menyeret dan menaruh (drag and drop) rangkaian pesan ke atas/bawah secara bebas, dan menyimpan urutan baru tersebut ke LocalStorage.



