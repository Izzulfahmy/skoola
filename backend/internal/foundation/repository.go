// file: backend/internal/foundation/repository.go
package foundation

import (
	"context"
	"database/sql"
	"fmt"
)

// ... (Interface tidak berubah) ...
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

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) GetAll(ctx context.Context) ([]Foundation, error) {
	// --- PERBAIKAN DI SINI: Query diubah untuk menghitung jumlah sekolah ---
	query := `
		SELECT 
			f.id, 
			f.nama_yayasan, 
			f.created_at, 
			f.updated_at,
			COUNT(t.id) as school_count
		FROM public.foundations f
		LEFT JOIN public.tenants t ON f.id = t.foundation_id
		GROUP BY f.id, f.nama_yayasan, f.created_at, f.updated_at
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
		// --- PERBAIKAN DI SINI: Menambahkan &f.SchoolCount saat scan ---
		if err := rows.Scan(&f.ID, &f.NamaYayasan, &f.CreatedAt, &f.UpdatedAt, &f.SchoolCount); err != nil {
			return nil, fmt.Errorf("gagal memindai data foundation: %w", err)
		}
		foundations = append(foundations, f)
	}
	return foundations, rows.Err()
}

// --- FUNGSI LAINNYA TIDAK BERUBAH ---
func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	queryTenants := `SELECT schema_name FROM public.tenants WHERE foundation_id = $1`
	rows, err := tx.QueryContext(ctx, queryTenants, id)
	if err != nil {
		return fmt.Errorf("gagal mengambil data tenant terkait: %w", err)
	}
	defer rows.Close()

	var schemasToDelete []string
	for rows.Next() {
		var schemaName string
		if err := rows.Scan(&schemaName); err != nil {
			return fmt.Errorf("gagal memindai schema_name: %w", err)
		}
		schemasToDelete = append(schemasToDelete, schemaName)
	}
	if err = rows.Err(); err != nil {
		return fmt.Errorf("terjadi error saat iterasi data tenant: %w", err)
	}

	for _, schemaName := range schemasToDelete {
		dropSchemaQuery := fmt.Sprintf("DROP SCHEMA %q CASCADE", schemaName)
		if _, err := tx.ExecContext(ctx, dropSchemaQuery); err != nil {
			return fmt.Errorf("gagal menghapus skema %s: %w", schemaName, err)
		}
	}

	deleteTenantsQuery := `DELETE FROM public.tenants WHERE foundation_id = $1`
	if _, err := tx.ExecContext(ctx, deleteTenantsQuery, id); err != nil {
		return fmt.Errorf("gagal menghapus dari tabel public.tenants: %w", err)
	}

	deleteFoundationQuery := `DELETE FROM public.foundations WHERE id = $1`
	result, err := tx.ExecContext(ctx, deleteFoundationQuery, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete foundation: %w", err)
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
func (r *postgresRepository) Create(ctx context.Context, f *Foundation) error {
	query := `INSERT INTO public.foundations (id, nama_yayasan) VALUES ($1, $2)`
	_, err := r.db.ExecContext(ctx, query, f.ID, f.NamaYayasan)
	if err != nil {
		return fmt.Errorf("gagal insert ke tabel public.foundations: %w", err)
	}
	return nil
}
func (r *postgresRepository) GetByID(ctx context.Context, id string) (*Foundation, error) {
	// Query GetByID juga perlu diubah untuk konsistensi
	query := `
		SELECT 
			f.id, 
			f.nama_yayasan, 
			f.created_at, 
			f.updated_at,
			COUNT(t.id) as school_count
		FROM public.foundations f
		LEFT JOIN public.tenants t ON f.id = t.foundation_id
		WHERE f.id = $1
		GROUP BY f.id, f.nama_yayasan, f.created_at, f.updated_at
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var f Foundation
	err := row.Scan(&f.ID, &f.NamaYayasan, &f.CreatedAt, &f.UpdatedAt, &f.SchoolCount)
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
