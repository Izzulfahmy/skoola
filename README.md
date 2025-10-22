⚙️ Proyek Monorepo: Setup Lingkungan & Pengembangan
Dokumen ini memuat panduan langkah demi langkah untuk menyiapkan lingkungan pengembangan (Backend Go & Frontend React/Vite) pada sistem operasi Debian, termasuk penggunaan tmux untuk mengelola proses background.

I. Prasyarat Sistem & Dependensi
Pastikan dependensi utama berikut telah terinstal pada sistem Anda:

Go (Golang): Bahasa pemrograman untuk backend.

PostgreSQL: Basis data utama.

Node.js & npm: Lingkungan runtime dan manajer paket untuk frontend.

Git: Sistem kontrol versi.

Tmux: Terminal multiplexer untuk mengelola sesi.

Instalasi (Contoh Perintah)
Bash

# Instalasi (Sesuaikan dengan metode instalasi resmi/preferensi Anda)
# 
# Golang
# ...
# PostgreSQL
# ...
# Node.js/npm
# ...
# Tmux
# sudo apt install tmux
# Git
# sudo apt install git
II. Setup Proyek
Setelah repository dikloning, instal dependensi JavaScript pada frontend:

Bash

# Pindah ke direktori proyek
cd /path/to/your/project
# Instal dependensi frontend
npm install
# Instal dependensi React Query
npm install @tanstack/react-query @tanstack/react-query-devtools
🚀 Panduan Penggunaan Tmux (Sesi Persisten)
Tmux digunakan untuk memastikan proses server (backend dan frontend) tetap berjalan di background meskipun koneksi SSH terputus (detach).

Penting: Jangan pernah menggunakan exit di dalam panel tmux jika Anda ingin server tetap berjalan. Selalu gunakan mekanisme Detach.

1. Memulai Sesi Baru
Mulai sesi tmux baru dengan nama (misalnya skoola):

Bash

tmux new -s skoola
2. Konfigurasi Panel (Opsional)
Untuk memisahkan backend dan frontend dalam satu jendela:

Tekan Ctrl+b (prefix default).

Lepaskan, lalu tekan: % (Membagi panel secara vertikal).

Pindah antar panel: Ctrl+b lalu [Panah Kiri/Kanan].

3. Menjalankan Server
Panel Kiri (Backend Go)
Bash

# Pindah ke direktori backend
cd backend
# Jalankan server Go
go run cmd/api/main.go
Panel Kanan (Frontend React/Vite)
Bash

# Pindah ke direktori frontend
cd frontend
# Jalankan development server
npm run dev
4. Melepaskan Sesi (Detach)
Setelah kedua server berjalan, lepaskan diri dari sesi tmux tanpa menghentikan proses:

Tekan Ctrl+b (prefix default).

Lepaskan, lalu tekan: d (detach).

Anda akan melihat notifikasi [detached (from session skoola)] dan dapat menutup koneksi SSH Anda. Proses server tetap aktif.

5. Menyambungkan Kembali Sesi (Reattach)
Ketika Anda kembali masuk ke server, sambungkan kembali ke sesi yang sudah berjalan:

Bash

tmux attach -t skoola
Anda akan kembali ke sesi tmux dengan semua proses dan log yang sedang berjalan.
