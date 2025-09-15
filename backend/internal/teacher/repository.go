package teacher

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database guru.
type Repository interface {
	Create(ctx context.Context, schemaName string, user *User, teacher *Teacher) error
}

// postgresRepository adalah implementasi dari Repository menggunakan PostgreSQL.
type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// Create adalah implementasi method untuk membuat guru baru.
func (r *postgresRepository) Create(ctx context.Context, schemaName string, user *User, teacher *Teacher) error {
	// 1. Memulai transaksi
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// 2. Set search_path untuk transaksi ini ke skema tenant
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	// 3. Masukkan data ke tabel 'users'
	userQuery := `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err = tx.ExecContext(ctx, userQuery, user.ID, user.Email, user.PasswordHash, "teacher")
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel users: %w", err)
	}

	// 4. Masukkan data ke tabel 'teachers'
	teacherQuery := `INSERT INTO teachers (id, user_id, nama_lengkap, nip, alamat, nomor_telepon) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = tx.ExecContext(ctx, teacherQuery, teacher.ID, user.ID, teacher.NamaLengkap, teacher.NIP, teacher.Alamat, teacher.NomorTelepon)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel teachers: %w", err)
	}

	// 5. Jika semua berhasil, commit transaksi
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("gagal melakukan commit transaksi: %w", err)
	}

	return nil
}
