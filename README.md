Install Golang
Install Postgres
Install Node js
Install Npm
Install Tmux
Install git
npm install
npm install @tanstack/react-query @tanstack/react-query-devtools


Anda benar sekali. Pertanyaan Anda sangat tepat\!

Ketika Anda menggunakan `tmux` dan menjalankan server di dalamnya, lalu Anda mengetikkan `exit` di dalam salah satu panel atau jendela, proses yang berjalan di panel tersebut **akan terhenti** (karena `exit` menghentikan *shell* yang menjalankan proses server Anda).

Tujuan utama menggunakan **tmux** adalah agar Anda bisa **melepaskan diri (detach)** dari sesi terminal, tetapi membiarkan proses di dalamnya (server *backend* dan *frontend*) **tetap berjalan di *background***.

Berikut adalah panduan yang benar untuk menjalankan server Go dan Node.js/Vite di dalam `tmux` tanpa menghentikannya saat Anda menutup koneksi SSH:

-----

## 🚀 Panduan Menggunakan tmux (Detach & Reattach)

Asumsikan Anda sudah masuk ke server Debian Anda via SSH.

### 1\. Memulai Sesi tmux

Jalankan perintah ini untuk memulai sesi `tmux` baru (Anda bisa memberi nama sesinya, misal `skoola`).

```bash
tmux new -s skoola
```

### 2\. Menyiapkan Panel (Opsional, tapi Direkomendasikan)

Setelah sesi dimulai, Anda dapat membagi jendela menjadi dua panel (satu untuk *backend* dan satu untuk *frontend*):

1.  Tekan kombinasi tombol: **`Ctrl+b`** (ini adalah *prefix* default)
2.  Lepaskan, lalu tekan: **`%`** (Ini akan membagi jendela secara vertikal).
3.  Pindah ke panel baru (jika perlu): **`Ctrl+b`** lalu **`[Panah Kiri/Kanan]`**

### 3\. Menjalankan Server Anda

Di Panel Kiri (**Backend Go**):

```bash
# Pindah ke direktori backend
cd backend
# Jalankan server Go Anda
go run cmd/api/main.go
```

Di Panel Kanan (**Frontend React/Vite**):

```bash
# Pindah ke direktori frontend
cd frontend
# Pastikan dependensi sudah terinstal (hanya jika belum)
# npm install 
# Jalankan development server
npm run dev
```

### 4\. Melepaskan Sesi (Detach) - Server Tetap Berjalan\!

Setelah kedua server berjalan dan menampilkan *log* di panel masing-masing, Anda bisa keluar dari sesi `tmux` tanpa menghentikan prosesnya.

Tekan kombinasi tombol: **`Ctrl+b`** (ini adalah *prefix* default)
Lepaskan, lalu tekan: **`d`** (untuk **d**etach)

Anda akan kembali ke terminal Debian Anda dengan pesan seperti: `[detached (from session skoola)]`. Kedua server Anda **tetap berjalan**. Anda sekarang bisa menutup koneksi SSH Anda.

### 5\. Menyambungkan Kembali Sesi (Reattach)

Ketika Anda kembali masuk ke server Debian Anda, Anda dapat menyambungkan kembali ke sesi yang sedang berjalan:

```bash
tmux attach -t skoola
```

Anda akan kembali melihat kedua server Anda berjalan di panel yang sama persis saat Anda meninggalkannya.

### ⚠️ Peringatan Penting\!

  * **JANGAN** ketik `exit` di dalam panel `tmux` jika Anda ingin server tetap berjalan.
  * Selalu gunakan **`Ctrl+b`** diikuti **`d`** untuk **Detach**.
  * Jika Anda menggunakan `screen` (alternatif `tmux`), perintah *detach*-nya adalah **`Ctrl+a`** diikuti **`d`**.
