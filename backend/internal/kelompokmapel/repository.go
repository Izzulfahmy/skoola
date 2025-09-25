// file: backend/internal/kelompokmapel/repository.go
package kelompokmapel

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertKelompokInput) (*KelompokMataPelajaran, error)
	GetAll(ctx context.Context, schemaName string) ([]KelompokMataPelajaran, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertKelompokInput) error
	Delete(ctx context.Context, schemaName string, id int) error
	GetMaxUrutan(ctx context.Context, schemaName string) (int, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	if err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	return nil
}

func (r *postgresRepository) GetMaxUrutan(ctx context.Context, schemaName string) (int, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}
	var maxUrutan sql.NullInt64
	query := `SELECT MAX(urutan) FROM kelompok_mata_pelajaran`
	err := r.db.QueryRowContext(ctx, query).Scan(&maxUrutan)
	if err != nil {
		return 0, err
	}
	if maxUrutan.Valid {
		return int(maxUrutan.Int64), nil
	}
	return 0, nil // Return 0 if table is empty or all urutan are NULL
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertKelompokInput) (*KelompokMataPelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `INSERT INTO kelompok_mata_pelajaran (nama_kelompok, urutan) VALUES ($1, $2) RETURNING id, nama_kelompok, urutan, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.NamaKelompok, input.Urutan)

	var k KelompokMataPelajaran
	if err := row.Scan(&k.ID, &k.NamaKelompok, &k.Urutan, &k.CreatedAt, &k.UpdatedAt); err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]KelompokMataPelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, nama_kelompok, urutan, created_at, updated_at FROM kelompok_mata_pelajaran ORDER BY urutan ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var kelompokList []KelompokMataPelajaran
	for rows.Next() {
		var k KelompokMataPelajaran
		if err := rows.Scan(&k.ID, &k.NamaKelompok, &k.Urutan, &k.CreatedAt, &k.UpdatedAt); err != nil {
			return nil, err
		}
		kelompokList = append(kelompokList, k)
	}
	return kelompokList, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertKelompokInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `UPDATE kelompok_mata_pelajaran SET nama_kelompok = $1, urutan = $2, updated_at = NOW() WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.NamaKelompok, input.Urutan, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `DELETE FROM kelompok_mata_pelajaran WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
