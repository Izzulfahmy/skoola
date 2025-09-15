package teacher

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database guru.
type Repository interface {
	// Create membuat user baru dan data guru di dalam satu transaksi.
	// Menggunakan schemaName untuk menargetkan skema tenant yang benar.
	Create(ctx context.Context, schemaName string, user *User, teacher *Teacher) error

	// GetAll mengambil semua data guru dari skema tenant yang ditentukan.
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)

	// GetByID mengambil satu data guru berdasarkan ID dari skema tenant yang ditentukan.
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) // <-- TAMBAHKAN INI
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

// GetAll adalah implementasi untuk mengambil semua data guru.
func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	// 1. Set search_path agar kita menargetkan skema tenant yang benar.
	// Ini sangat penting untuk multi-tenancy.
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	// 2. Siapkan query SQL untuk mengambil semua guru.
	// Kita urutkan berdasarkan nama lengkap agar hasilnya rapi.
	query := `
		SELECT id, user_id, nama_lengkap, nip, alamat, nomor_telepon, created_at, updated_at
		FROM teachers
		ORDER BY nama_lengkap ASC
	`

	// 3. Eksekusi query ke database.
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal mengeksekusi query get all teachers: %w", err)
	}
	// Pastikan kita selalu menutup koneksi rows setelah selesai.
	defer rows.Close()

	// 4. Siapkan sebuah slice kosong untuk menampung hasil.
	var teachers []Teacher

	// 5. Lakukan iterasi (looping) untuk setiap baris data yang dikembalikan database.
	for rows.Next() {
		var teacher Teacher // Buat variabel penampung untuk setiap guru

		// 6. Pindai (Scan) data dari baris saat ini ke dalam variabel 'teacher'.
		// Urutan variabel di Scan HARUS SAMA PERSIS dengan urutan kolom di query SELECT.
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

		// 7. Tambahkan guru yang sudah dipindai ke dalam slice 'teachers'.
		teachers = append(teachers, teacher)
	}

	// 8. Cek jika ada error selama iterasi.
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data guru: %w", err)
	}

	// 9. Jika semua berjalan lancar, kembalikan slice berisi data guru.
	return teachers, nil
}

// GetByID adalah implementasi untuk mengambil satu data guru berdasarkan ID.
func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	// 1. Set search_path agar kita menargetkan skema tenant yang benar.
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	// 2. Siapkan query SQL untuk mengambil satu guru berdasarkan ID.
	// Tanda $1 adalah placeholder untuk parameter agar aman dari SQL Injection.
	query := `
		SELECT id, user_id, nama_lengkap, nip, alamat, nomor_telepon, created_at, updated_at
		FROM teachers
		WHERE id = $1
	`

	// 3. Eksekusi query menggunakan QueryRowContext karena kita hanya mengharapkan satu baris.
	row := r.db.QueryRowContext(ctx, query, id)

	// 4. Siapkan sebuah variabel untuk menampung hasilnya.
	var teacher Teacher

	// 5. Pindai (Scan) data dari baris yang ditemukan ke dalam variabel 'teacher'.
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

	// 6. Penanganan error yang sangat penting!
	if err != nil {
		// Jika errornya adalah 'sql.ErrNoRows', artinya data tidak ditemukan.
		// Ini bukan error server, tapi kasus yang valid. Kita kembalikan nil.
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan, tidak dianggap sebagai error.
		}
		// Jika error lain, maka itu adalah error server.
		return nil, fmt.Errorf("gagal memindai data guru by id: %w", err)
	}

	// 7. Jika berhasil, kembalikan pointer ke data guru yang ditemukan.
	return &teacher, nil
}
