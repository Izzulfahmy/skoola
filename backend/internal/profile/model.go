// file: backend/internal/profile/model.go
package profile

// ProfilSekolah merepresentasikan data dari tabel 'profil_sekolah'.
// Kita menggunakan pointer (*string, *int) untuk kolom yang boleh kosong (NULL) di database.
type ProfilSekolah struct {
	ID            int     `json:"id"`
	NPSN          *string `json:"npsn"`
	NamaSekolah   string  `json:"nama_sekolah"`
	Naungan       *string `json:"naungan"`
	Alamat        *string `json:"alamat"`
	Kelurahan     *string `json:"kelurahan"`
	Kecamatan     *string `json:"kecamatan"`
	KotaKabupaten *string `json:"kota_kabupaten"`
	Provinsi      *string `json:"provinsi"`
	KodePos       *string `json:"kode_pos"`
	Telepon       *string `json:"telepon"`
	Email         *string `json:"email"`
	Website       *string `json:"website"`
	KepalaSekolah *string `json:"kepala_sekolah"`
	JenjangID     *int    `json:"jenjang_id"`
}
