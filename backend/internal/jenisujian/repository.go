// file: backend/internal/jenisujian/repository.go
package jenisujian

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertJenisUjianInput) (*JenisUjian, error)
	GetAll(ctx context.Context, schemaName string) ([]JenisUjian, error)
	GetByID(ctx context.Context, schemaName string, id int) (*JenisUjian, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertJenisUjianInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertJenisUjianInput) (*JenisUjian, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO jenis_ujian (kode_ujian, nama_ujian) VALUES ($1, $2) RETURNING id, kode_ujian, nama_ujian, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.KodeUjian, input.NamaUjian)

	var j JenisUjian
	if err := row.Scan(&j.ID, &j.KodeUjian, &j.NamaUjian, &j.CreatedAt, &j.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data jenis ujian setelah dibuat: %w", err)
	}
	return &j, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]JenisUjian, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, kode_ujian, nama_ujian, created_at, updated_at FROM jenis_ujian ORDER BY nama_ujian ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all jenis ujian: %w", err)
	}
	defer rows.Close()

	var list []JenisUjian
	for rows.Next() {
		var j JenisUjian
		if err := rows.Scan(&j.ID, &j.KodeUjian, &j.NamaUjian, &j.CreatedAt, &j.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data jenis ujian: %w", err)
		}
		list = append(list, j)
	}
	return list, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id int) (*JenisUjian, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, kode_ujian, nama_ujian, created_at, updated_at FROM jenis_ujian WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var j JenisUjian
	err := row.Scan(&j.ID, &j.KodeUjian, &j.NamaUjian, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data jenis ujian by id: %w", err)
	}
	return &j, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertJenisUjianInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE jenis_ujian SET kode_ujian = $1, nama_ujian = $2, updated_at = NOW() WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.KodeUjian, input.NamaUjian, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update: %w", err)
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

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id int) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM jenis_ujian WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
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
