// file: backend/internal/foundation/repository.go
package foundation

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	Create(ctx context.Context, naungan *Naungan) error
	GetAll(ctx context.Context) ([]Naungan, error)
	GetByID(ctx context.Context, id string) (*Naungan, error)
	Update(ctx context.Context, naungan *Naungan) error
	Delete(ctx context.Context, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) GetAll(ctx context.Context) ([]Naungan, error) {
	query := `
		SELECT 
			n.id, 
			n.nama_naungan, 
			n.created_at, 
			n.updated_at,
			COUNT(t.id) as school_count
		FROM public.naungan n
		LEFT JOIN public.tenants t ON n.id = t.naungan_id
		GROUP BY n.id, n.nama_naungan, n.created_at, n.updated_at
		ORDER BY n.nama_naungan ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all naungan: %w", err)
	}
	defer rows.Close()

	var naunganList []Naungan
	for rows.Next() {
		var n Naungan
		if err := rows.Scan(&n.ID, &n.NamaNaungan, &n.CreatedAt, &n.UpdatedAt, &n.SchoolCount); err != nil {
			return nil, fmt.Errorf("gagal memindai data naungan: %w", err)
		}
		naunganList = append(naunganList, n)
	}
	return naunganList, rows.Err()
}

func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	queryTenants := `SELECT schema_name FROM public.tenants WHERE naungan_id = $1`
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

	deleteTenantsQuery := `DELETE FROM public.tenants WHERE naungan_id = $1`
	if _, err := tx.ExecContext(ctx, deleteTenantsQuery, id); err != nil {
		return fmt.Errorf("gagal menghapus dari tabel public.tenants: %w", err)
	}

	deleteNaunganQuery := `DELETE FROM public.naungan WHERE id = $1`
	result, err := tx.ExecContext(ctx, deleteNaunganQuery, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete naungan: %w", err)
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
func (r *postgresRepository) Create(ctx context.Context, n *Naungan) error {
	query := `INSERT INTO public.naungan (id, nama_naungan) VALUES ($1, $2)`
	_, err := r.db.ExecContext(ctx, query, n.ID, n.NamaNaungan)
	if err != nil {
		return fmt.Errorf("gagal insert ke tabel public.naungan: %w", err)
	}
	return nil
}
func (r *postgresRepository) GetByID(ctx context.Context, id string) (*Naungan, error) {
	query := `
		SELECT 
			n.id, 
			n.nama_naungan, 
			n.created_at, 
			n.updated_at,
			COUNT(t.id) as school_count
		FROM public.naungan n
		LEFT JOIN public.tenants t ON n.id = t.naungan_id
		WHERE n.id = $1
		GROUP BY n.id, n.nama_naungan, n.created_at, n.updated_at
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var n Naungan
	err := row.Scan(&n.ID, &n.NamaNaungan, &n.CreatedAt, &n.UpdatedAt, &n.SchoolCount)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data naungan by id: %w", err)
	}
	return &n, nil
}
func (r *postgresRepository) Update(ctx context.Context, n *Naungan) error {
	query := `UPDATE public.naungan SET nama_naungan = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, n.NamaNaungan, n.ID)
	if err != nil {
		return fmt.Errorf("gagal eksekusi query update naungan: %w", err)
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
