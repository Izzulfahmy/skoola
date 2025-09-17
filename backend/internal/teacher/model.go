package teacher

import "time"

// User represents the users table structure.
// Kita letakkan di sini sementara, nanti bisa dipindah ke package 'user' sendiri.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Jangan kirim password hash ke client
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Teacher represents the teachers table structure.
type Teacher struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Email        string    `json:"email"` // <-- TAMBAHKAN FIELD INI
	NamaLengkap  string    `json:"nama_lengkap"`
	NIP          *string   `json:"nip"` // Pointer agar bisa NULL
	Alamat       *string   `json:"alamat"`
	NomorTelepon *string   `json:"nomor_telepon"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
