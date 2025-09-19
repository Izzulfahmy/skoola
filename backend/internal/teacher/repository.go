// file: backend/internal/teacher/repository.go
package teacher

import (
	"context"
	"database/sql"
	"fmt"
)

type Querier interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
}

type Repository interface {
	Create(ctx context.Context, querier Querier, schemaName string, user *User, teacher *Teacher) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, teacher *Teacher) error
	Delete(ctx context.Context, schemaName string, teacherID string) error
	GetByEmail(ctx context.Context, schemaName string, email string) (*User, error)
	GetPublicUserByEmail(ctx context.Context, email string) (*User, error)
	// --- FUNGSI BARU DI BAWAH INI ---
	GetAdminBySchema(ctx context.Context, schemaName string) (*User, error)
	UpdateUserEmail(ctx context.Context, schemaName string, userID string, newEmail string) error
	UpdateUserPassword(ctx context.Context, schemaName string, userID string, hashedPassword string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// --- FUNGSI BARU UNTUK MENCARI ADMIN DI DALAM SKEMA SEKOLAH ---
func (r *postgresRepository) GetAdminBySchema(ctx context.Context, schemaName string) (*User, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, email, password_hash, role FROM users WHERE role = 'admin' LIMIT 1`
	row := r.db.QueryRowContext(ctx, query)

	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("tidak ada admin yang ditemukan di skema %s", schemaName)
		}
		return nil, fmt.Errorf("gagal memindai data admin: %w", err)
	}
	return &user, nil
}

// --- FUNGSI BARU UNTUK MEMPERBARUI EMAIL USER ---
func (r *postgresRepository) UpdateUserEmail(ctx context.Context, schemaName string, userID string, newEmail string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, newEmail, userID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update email: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows // Menandakan user ID tidak ditemukan
	}

	return nil
}

// --- FUNGSI BARU UNTUK MEMPERBARUI PASSWORD USER ---
func (r *postgresRepository) UpdateUserPassword(ctx context.Context, schemaName string, userID string, hashedPassword string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, hashedPassword, userID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update password: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// --- FUNGSI-FUNGSI LAMA DI BAWAH INI TETAP SAMA (TIDAK PERLU DIUBAH) ---

// Implementasi Create yang sudah diperbaiki
func (r *postgresRepository) Create(ctx context.Context, querier Querier, schemaName string, user *User, teacher *Teacher) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := querier.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	userQuery := `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err := querier.ExecContext(ctx, userQuery, user.ID, user.Email, user.PasswordHash, user.Role)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel users: %w", err)
	}

	teacherQuery := `INSERT INTO teachers (id, user_id, nama_lengkap, nip, alamat, nomor_telepon) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = querier.ExecContext(ctx, teacherQuery, teacher.ID, user.ID, teacher.NamaLengkap, teacher.NIP, teacher.Alamat, teacher.NomorTelepon)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel teachers: %w", err)
	}

	return nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		SELECT t.id, t.user_id, u.email, t.nama_lengkap, t.nip, t.alamat, t.nomor_telepon, t.created_at, t.updated_at
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		ORDER BY t.nama_lengkap ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal mengeksekusi query get all teachers: %w", err)
	}
	defer rows.Close()
	var teachers []Teacher
	for rows.Next() {
		var teacher Teacher
		err := rows.Scan(
			&teacher.ID, &teacher.UserID, &teacher.Email, &teacher.NamaLengkap,
			&teacher.NIP, &teacher.Alamat, &teacher.NomorTelepon, &teacher.CreatedAt, &teacher.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal memindai data guru: %w", err)
		}
		teachers = append(teachers, teacher)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data guru: %w", err)
	}
	return teachers, nil
}
func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		SELECT t.id, t.user_id, u.email, t.nama_lengkap, t.nip, t.alamat, t.nomor_telepon, t.created_at, t.updated_at
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		WHERE t.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)
	var teacher Teacher
	err := row.Scan(
		&teacher.ID, &teacher.UserID, &teacher.Email, &teacher.NamaLengkap,
		&teacher.NIP, &teacher.Alamat, &teacher.NomorTelepon, &teacher.CreatedAt, &teacher.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data guru by id: %w", err)
	}
	return &teacher, nil
}
func (r *postgresRepository) Update(ctx context.Context, schemaName string, teacher *Teacher) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	teacherQuery := `
		UPDATE teachers
		SET nama_lengkap = $1, nip = $2, alamat = $3, nomor_telepon = $4, updated_at = NOW()
		WHERE id = $5
	`
	_, err = tx.ExecContext(ctx, teacherQuery, teacher.NamaLengkap, teacher.NIP, teacher.Alamat, teacher.NomorTelepon, teacher.ID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update teacher: %w", err)
	}
	userQuery := `UPDATE users SET email = $1 WHERE id = $2`
	result, err := tx.ExecContext(ctx, userQuery, teacher.Email, teacher.UserID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update user email: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return tx.Commit()
}
func (r *postgresRepository) Delete(ctx context.Context, schemaName string, teacherID string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `DELETE FROM users WHERE id = (SELECT user_id FROM teachers WHERE id = $1)`
	result, err := r.db.ExecContext(ctx, query, teacherID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
func (r *postgresRepository) GetByEmail(ctx context.Context, schemaName string, email string) (*User, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `SELECT id, email, password_hash, role FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data user by email: %w", err)
	}
	return &user, nil
}
func (r *postgresRepository) GetPublicUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, email, password_hash, role FROM public.users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data public user by email: %w", err)
	}
	return &user, nil
}
