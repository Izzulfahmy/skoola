// file: backend/internal/matapelajaran/repository.go
package matapelajaran

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error)
	GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO mata_pelajaran (kode_mapel, nama_mapel) VALUES ($1, $2) RETURNING id, kode_mapel, nama_mapel, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.KodeMapel, input.NamaMapel)

	var mp MataPelajaran
	if err := row.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &mp.CreatedAt, &mp.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data mata pelajaran setelah dibuat: %w", err)
	}
	return &mp, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, kode_mapel, nama_mapel, created_at, updated_at FROM mata_pelajaran ORDER BY nama_mapel ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all mata pelajaran: %w", err)
	}
	defer rows.Close()

	var list []MataPelajaran
	for rows.Next() {
		var mp MataPelajaran
		if err := rows.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &mp.CreatedAt, &mp.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data mata pelajaran: %w", err)
		}
		list = append(list, mp)
	}
	return list, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, kode_mapel, nama_mapel, created_at, updated_at FROM mata_pelajaran WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var mp MataPelajaran
	err := row.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &mp.CreatedAt, &mp.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan
		}
		return nil, fmt.Errorf("gagal memindai data mata pelajaran by id: %w", err)
	}
	return &mp, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE mata_pelajaran SET kode_mapel = $1, nama_mapel = $2, updated_at = NOW() WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.KodeMapel, input.NamaMapel, id)
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

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM mata_pelajaran WHERE id = $1`
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
