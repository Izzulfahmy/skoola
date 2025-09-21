// file: backend/internal/foundation/repository.go
package foundation

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database yayasan.
type Repository interface {
	Create(ctx context.Context, foundation *Foundation) error
	GetAll(ctx context.Context) ([]Foundation, error)
	GetByID(ctx context.Context, id string) (*Foundation, error)
	Update(ctx context.Context, foundation *Foundation) error
	Delete(ctx context.Context, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, f *Foundation) error {
	query := `INSERT INTO public.foundations (id, nama_yayasan) VALUES ($1, $2)`
	_, err := r.db.ExecContext(ctx, query, f.ID, f.NamaYayasan)
	if err != nil {
		return fmt.Errorf("gagal insert ke tabel public.foundations: %w", err)
	}
	return nil
}

func (r *postgresRepository) GetAll(ctx context.Context) ([]Foundation, error) {
	query := `
		SELECT f.id, f.nama_yayasan, f.created_at, f.updated_at
		FROM public.foundations f
		ORDER BY f.nama_yayasan ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all foundations: %w", err)
	}
	defer rows.Close()

	var foundations []Foundation
	for rows.Next() {
		var f Foundation
		if err := rows.Scan(&f.ID, &f.NamaYayasan, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data foundation: %w", err)
		}
		foundations = append(foundations, f)
	}
	return foundations, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, id string) (*Foundation, error) {
	query := `SELECT id, nama_yayasan, created_at, updated_at FROM public.foundations WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var f Foundation
	err := row.Scan(&f.ID, &f.NamaYayasan, &f.CreatedAt, &f.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data foundation by id: %w", err)
	}
	return &f, nil
}

func (r *postgresRepository) Update(ctx context.Context, f *Foundation) error {
	query := `UPDATE public.foundations SET nama_yayasan = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, f.NamaYayasan, f.ID)
	if err != nil {
		return fmt.Errorf("gagal eksekusi query update foundation: %w", err)
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

func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	// Note: Relasi ON DELETE SET NULL akan otomatis menangani kolom foundation_id di tabel tenants.
	query := `DELETE FROM public.foundations WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal eksekusi query delete foundation: %w", err)
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
