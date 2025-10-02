// file: backend/internal/prestasi/model.go
package prestasi

import "time"

// Prestasi merepresentasikan data dari tabel 'prestasi_siswa'.
type Prestasi struct {
	ID             string    `json:"id"`
	TahunAjaranID  string    `json:"tahun_ajaran_id"`
	AnggotaKelasID string    `json:"anggota_kelas_id"`
	NamaPrestasi   string    `json:"nama_prestasi"`
	Tingkat        string    `json:"tingkat"`
	Peringkat      string    `json:"peringkat"`
	Tanggal        time.Time `json:"tanggal"`
	Deskripsi      *string   `json:"deskripsi"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	// Kolom tambahan untuk join
	NamaSiswa string `json:"nama_siswa,omitempty"`
	NamaKelas string `json:"nama_kelas,omitempty"`
}

// UpsertPrestasiInput adalah DTO untuk membuat atau memperbarui data.
type UpsertPrestasiInput struct {
	TahunAjaranID  string `json:"tahun_ajaran_id" validate:"required,uuid"`
	AnggotaKelasID string `json:"anggota_kelas_id" validate:"required,uuid"`
	NamaPrestasi   string `json:"nama_prestasi" validate:"required,min=3"`
	Tingkat        string `json:"tingkat" validate:"required,oneof=Sekolah Desa/Kelurahan Kecamatan Kabupaten/Kota Provinsi Nasional Internasional"`
	Peringkat      string `json:"peringkat" validate:"required,oneof='Juara 1' 'Juara 2' 'Juara 3' 'Harapan 1' 'Harapan 2' 'Harapan 3'"`
	Tanggal        string `json:"tanggal" validate:"required,datetime=2006-01-02"`
	Deskripsi      string `json:"deskripsi"`
}
