// file: internal/student/model.go
package student

import "time"

// Student merepresentasikan data dalam tabel 'students'.
type Student struct {
	ID               string    `json:"id"`
	NamaLengkap      string    `json:"nama_lengkap"`
	NIS              *string   `json:"nis"` // Pointer agar bisa NULL
	NISN             *string   `json:"nisn"`
	Alamat           *string   `json:"alamat"`
	NamaWali         *string   `json:"nama_wali"`
	NomorTeleponWali *string   `json:"nomor_telepon_wali"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
