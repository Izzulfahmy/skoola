// file: internal/student/repository.go
package student

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database siswa.
type Repository interface {
	Create(ctx context.Context, schemaName string, student *Student) error
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
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

// Create memasukkan data siswa baru ke dalam database.
func (r *postgresRepository) Create(ctx context.Context, schemaName string, student *Student) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
        INSERT INTO students (id, nama_lengkap, nis, nisn, alamat, nama_wali, nomor_telepon_wali)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err := r.db.ExecContext(ctx, query,
		student.ID,
		student.NamaLengkap,
		student.NIS,
		student.NISN,
		student.Alamat,
		student.NamaWali,
		student.NomorTeleponWali,
	)
	if err != nil {
		return fmt.Errorf("gagal memasukkan data siswa: %w", err)
	}

	return nil
}

// GetAll mengambil semua data siswa dari database.
func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Student, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
        SELECT id, nama_lengkap, nis, nisn, alamat, nama_wali, nomor_telepon_wali, created_at, updated_at
        FROM students
        ORDER BY nama_lengkap ASC
    `
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all students: %w", err)
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var s Student
		err := rows.Scan(
			&s.ID,
			&s.NamaLengkap,
			&s.NIS,
			&s.NISN,
			&s.Alamat,
			&s.NamaWali,
			&s.NomorTeleponWali,
			&s.CreatedAt,
			&s.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal memindai data siswa: %w", err)
		}
		students = append(students, s)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data siswa: %w", err)
	}

	return students, nil
}
