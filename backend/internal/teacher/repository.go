package teacher

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database guru.
type Repository interface {
	Create(ctx context.Context, schemaName string, user *User, teacher *Teacher) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, teacher *Teacher) error
	Delete(ctx context.Context, schemaName string, teacherID string) error

	// GetByEmail mencari satu data user berdasarkan alamat email.
	// Kita butuh ini untuk proses login.
	GetByEmail(ctx context.Context, schemaName string, email string) (*User, error) // <-- TAMBAHKAN INI
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
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	userQuery := `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err = tx.ExecContext(ctx, userQuery, user.ID, user.Email, user.PasswordHash, "teacher")
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel users: %w", err)
	}

	teacherQuery := `INSERT INTO teachers (id, user_id, nama_lengkap, nip, alamat, nomor_telepon) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = tx.ExecContext(ctx, teacherQuery, teacher.ID, user.ID, teacher.NamaLengkap, teacher.NIP, teacher.Alamat, teacher.NomorTelepon)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel teachers: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("gagal melakukan commit transaksi: %w", err)
	}

	return nil
}

// GetAll adalah implementasi untuk mengambil semua data guru.
func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT id, user_id, nama_lengkap, nip, alamat, nomor_telepon, created_at, updated_at
		FROM teachers
		ORDER BY nama_lengkap ASC
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
			&teacher.ID,
			&teacher.UserID,
			&teacher.NamaLengkap,
			&teacher.NIP,
			&teacher.Alamat,
			&teacher.NomorTelepon,
			&teacher.CreatedAt,
			&teacher.UpdatedAt,
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

// GetByID adalah implementasi untuk mengambil satu data guru berdasarkan ID.
func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT id, user_id, nama_lengkap, nip, alamat, nomor_telepon, created_at, updated_at
		FROM teachers
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var teacher Teacher
	err := row.Scan(
		&teacher.ID,
		&teacher.UserID,
		&teacher.NamaLengkap,
		&teacher.NIP,
		&teacher.Alamat,
		&teacher.NomorTelepon,
		&teacher.CreatedAt,
		&teacher.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data guru by id: %w", err)
	}

	return &teacher, nil
}

// Update adalah implementasi untuk memperbarui data guru.
func (r *postgresRepository) Update(ctx context.Context, schemaName string, teacher *Teacher) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		UPDATE teachers
		SET nama_lengkap = $1, nip = $2, alamat = $3, nomor_telepon = $4, updated_at = NOW()
		WHERE id = $5
	`
	result, err := r.db.ExecContext(ctx, query,
		teacher.NamaLengkap,
		teacher.NIP,
		teacher.Alamat,
		teacher.NomorTelepon,
		teacher.ID,
	)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update teacher: %w", err)
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

// Delete adalah implementasi untuk menghapus data guru.
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

// GetByEmail adalah implementasi untuk mengambil data user berdasarkan email.
func (r *postgresRepository) GetByEmail(ctx context.Context, schemaName string, email string) (*User, error) {
	// 1. Set search_path untuk menargetkan skema tenant yang benar.
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	// 2. Siapkan query SQL untuk mengambil user berdasarkan email.
	// Kita butuh semua field ini untuk verifikasi.
	query := `SELECT id, email, password_hash, role FROM users WHERE email = $1`

	// 3. Eksekusi query menggunakan QueryRowContext.
	row := r.db.QueryRowContext(ctx, query, email)

	// 4. Siapkan variabel untuk menampung hasilnya.
	var user User

	// 5. Pindai (Scan) data.
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	)

	// 6. Tangani error, terutama jika user tidak ditemukan.
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User tidak ditemukan, ini bukan error.
		}
		return nil, fmt.Errorf("gagal memindai data user by email: %w", err)
	}

	// 7. Jika berhasil, kembalikan pointer ke data user.
	return &user, nil
}
