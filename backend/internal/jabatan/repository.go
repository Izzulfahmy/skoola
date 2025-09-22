// file: backend/internal/jabatan/repository.go
package jabatan

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertJabatanInput) (*Jabatan, error)
	GetAll(ctx context.Context, schemaName string) ([]Jabatan, error)
	GetByID(ctx context.Context, schemaName string, id int) (*Jabatan, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertJabatanInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertJabatanInput) (*Jabatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO jabatan (nama_jabatan) VALUES ($1) RETURNING id, nama_jabatan, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.NamaJabatan)

	var j Jabatan
	if err := row.Scan(&j.ID, &j.NamaJabatan, &j.CreatedAt, &j.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data jabatan setelah dibuat: %w", err)
	}
	return &j, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Jabatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_jabatan, created_at, updated_at FROM jabatan ORDER BY nama_jabatan ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all jabatan: %w", err)
	}
	defer rows.Close()

	var jabatanList []Jabatan
	for rows.Next() {
		var j Jabatan
		if err := rows.Scan(&j.ID, &j.NamaJabatan, &j.CreatedAt, &j.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data jabatan: %w", err)
		}
		jabatanList = append(jabatanList, j)
	}
	return jabatanList, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id int) (*Jabatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_jabatan, created_at, updated_at FROM jabatan WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var j Jabatan
	err := row.Scan(&j.ID, &j.NamaJabatan, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan, bukan error
		}
		return nil, fmt.Errorf("gagal memindai data jabatan by id: %w", err)
	}
	return &j, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertJabatanInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE jabatan SET nama_jabatan = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, input.NamaJabatan, id)
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

	query := `DELETE FROM jabatan WHERE id = $1`
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
