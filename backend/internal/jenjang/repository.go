// file: backend/internal/jenjang/repository.go
package jenjang

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertJenjangInput) (*JenjangPendidikan, error)
	GetAll(ctx context.Context, schemaName string) ([]JenjangPendidikan, error)
	GetByID(ctx context.Context, schemaName string, id int) (*JenjangPendidikan, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertJenjangInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertJenjangInput) (*JenjangPendidikan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO jenjang_pendidikan (nama_jenjang) VALUES ($1) RETURNING id, nama_jenjang, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.NamaJenjang)

	var jenjang JenjangPendidikan
	if err := row.Scan(&jenjang.ID, &jenjang.NamaJenjang, &jenjang.CreatedAt, &jenjang.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data jenjang setelah dibuat: %w", err)
	}
	return &jenjang, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]JenjangPendidikan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_jenjang, created_at, updated_at FROM jenjang_pendidikan ORDER BY nama_jenjang ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all jenjang: %w", err)
	}
	defer rows.Close()

	var jenjangList []JenjangPendidikan
	for rows.Next() {
		var j JenjangPendidikan
		if err := rows.Scan(&j.ID, &j.NamaJenjang, &j.CreatedAt, &j.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data jenjang: %w", err)
		}
		jenjangList = append(jenjangList, j)
	}
	return jenjangList, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id int) (*JenjangPendidikan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_jenjang, created_at, updated_at FROM jenjang_pendidikan WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var j JenjangPendidikan
	err := row.Scan(&j.ID, &j.NamaJenjang, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan, bukan error
		}
		return nil, fmt.Errorf("gagal memindai data jenjang by id: %w", err)
	}
	return &j, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertJenjangInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE jenjang_pendidikan SET nama_jenjang = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, input.NamaJenjang, id)
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

	query := `DELETE FROM jenjang_pendidikan WHERE id = $1`
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
