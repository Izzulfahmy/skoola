## 🌐 Dokumentasi Setup Lingkungan Pengembangan

Dokumen ini memandu penyiapan lingkungan pengembangan proyek monorepo (Go Backend dan React/Vite Frontend) pada sistem operasi berbasis Linux (Debian/Ubuntu).

### I. Persiapan Lingkungan dan Dependensi

Pastikan dependensi sistem berikut telah terinstal dan dikonfigurasi dengan benar:

| Komponen | Tujuan |
| :--- | :--- |
| **Go (Golang)** | Lingkungan *runtime* dan kompilasi untuk layanan *backend*. |
| **Node.js & npm** | Lingkungan eksekusi dan manajer paket untuk *frontend*. |
| **PostgreSQL** | Sistem manajemen basis data relasional. |
| **Git** | Kontrol versi proyek. |
| **Tmux** | *Terminal Multiplexer* untuk manajemen sesi persisten. |

#### Instalasi Dependensi (Contoh Referensi)

Gunakan manajer paket sistem (`apt`, `brew`, dsb.) untuk menginstal komponen di atas:

```bash
# Contoh: Instalasi umum pada Debian/Ubuntu
sudo apt update
sudo apt install git tmux
# Instalasi Go, Node.js, dan PostgreSQL harus mengikuti panduan resmi
# untuk memastikan versi yang kompatibel dan konfigurasi yang tepat.
```

### II. Penyiapan Proyek & Dependensi Aplikasi

Setelah *repository* dikloning, lakukan instalasi dependensi untuk komponen *frontend*:

```bash
# Navigasi ke root direktori proyek
cd /path/to/project/
# Instalasi dependensi Node.js
npm install
# Instalasi pustaka React Query dan Devtools
npm install @tanstack/react-query @tanstack/react-query-devtools
```

-----

## ⚙️ Manajemen Sesi dengan Tmux

**Tmux** digunakan untuk memastikan proses server aplikasi (Go dan Node.js) tetap berjalan di *background* (*daemonized*) meskipun koneksi SSH terputus (*detachment*).

**Peringatan Penting:** Untuk mempertahankan proses berjalan, selalu gunakan mekanisme **Detach**. Menggunakan perintah `exit` di dalam panel `tmux` akan menghentikan *shell* dan semua proses yang dijalankannya.

### 1\. Memulai dan Mengidentifikasi Sesi

Mulai sesi `tmux` baru dengan penamaan sesi yang jelas (`skoola`):

```bash
tmux new -s skoola
```

### 2\. Konfigurasi Jendela (Splitting)

Untuk memisahkan *backend* dan *frontend* dalam tampilan yang sama:

1.  Tekan **`Ctrl+b`** (*prefix* default).
2.  Lepaskan, lalu tekan: **`%`** (Membagi panel secara vertikal).
3.  Navigasi antar panel: **`Ctrl+b`** lalu **`[Panah Kiri/Kanan]`**.

### 3\. Eksekusi Server

#### Panel 1: Backend (Go Service)

```bash
# Navigasi ke direktori backend
cd /skoola/backend
# Eksekusi server API
go run cmd/api/main.go
```

#### Panel 2: Frontend (React/Vite Development)

```bash
# Navigasi ke direktori frontend
cd /skoola/frontend
# Jalankan development server
npm run dev
```

### 4\. Melepaskan Sesi (Detach)

Lepaskan diri dari sesi `tmux` tanpa menghentikan proses yang sedang berjalan:

1.  Tekan **`Ctrl+b`** (*prefix* default).
2.  Lepaskan, lalu tekan: **`d`** (Detach).

Sistem akan menampilkan konfirmasi `[detached (from session skoola)]`. Proses server kini berjalan secara persisten di *background*.

### 5\. Menyambungkan Kembali Sesi (Reattach)

Ketika kembali masuk ke server, sambungkan kembali ke sesi yang telah dibuat:

```bash
tmux attach -t skoola
```

Anda akan dikembalikan ke status terminal dan proses yang sama persis saat sesi dilepaskan.
