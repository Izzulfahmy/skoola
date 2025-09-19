// file: backend/internal/tenant/repository.go
package tenant

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
)

type Repository interface {
	CreateTenantSchema(ctx context.Context, tx *sql.Tx, input RegisterTenantInput) error
	GetAll(ctx context.Context) ([]Tenant, error)
	DeleteTenantBySchema(ctx context.Context, schemaName string) error // <-- TAMBAHKAN INI
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// --- FUNGSI BARU UNTUK MENGHAPUS TENANT ---
func (r *postgresRepository) DeleteTenantBySchema(ctx context.Context, schemaName string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback() // Rollback otomatis jika ada error

	// Langkah 1: Hapus skema sekolah beserta semua isinya (tabel, data, dll)
	dropSchemaQuery := fmt.Sprintf("DROP SCHEMA %q CASCADE", schemaName)
	if _, err := tx.ExecContext(ctx, dropSchemaQuery); err != nil {
		return fmt.Errorf("gagal menghapus skema %s: %w", schemaName, err)
	}

	// Langkah 2: Hapus catatan sekolah dari tabel publik
	deleteTenantQuery := `DELETE FROM public.tenants WHERE schema_name = $1`
	result, err := tx.ExecContext(ctx, deleteTenantQuery, schemaName)
	if err != nil {
		return fmt.Errorf("gagal menghapus dari tabel public.tenants: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows // Menandakan tenant tidak ditemukan untuk dihapus
	}

	// Jika kedua langkah berhasil, commit transaksi
	return tx.Commit()
}

// --- FUNGSI-FUNGSI LAMA DI BAWAH INI TETAP SAMA ---

func (r *postgresRepository) GetAll(ctx context.Context) ([]Tenant, error) {
	query := `SELECT id, nama_sekolah, schema_name, created_at, updated_at FROM public.tenants ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all tenants: %w", err)
	}
	defer rows.Close()

	var tenants []Tenant
	for rows.Next() {
		var t Tenant
		if err := rows.Scan(&t.ID, &t.NamaSekolah, &t.SchemaName, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data tenant: %w", err)
		}
		tenants = append(tenants, t)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data tenant: %w", err)
	}
	return tenants, nil
}

func (r *postgresRepository) CreateTenantSchema(ctx context.Context, tx *sql.Tx, input RegisterTenantInput) error {
	queryInsertTenant := `INSERT INTO public.tenants (nama_sekolah, schema_name) VALUES ($1, $2)`
	_, err := tx.ExecContext(ctx, queryInsertTenant, input.NamaSekolah, input.SchemaName)
	if err != nil {
		return fmt.Errorf("gagal insert ke tabel public.tenants: %w", err)
	}

	_, err = tx.ExecContext(ctx, fmt.Sprintf("CREATE SCHEMA %q", input.SchemaName))
	if err != nil {
		return fmt.Errorf("gagal membuat schema baru: %w", err)
	}

	migrationPath, err := filepath.Abs("./db/migrations/001_initial_schema.sql")
	if err != nil {
		return fmt.Errorf("gagal mendapatkan path absolut file migrasi: %w", err)
	}
	migrationSQL, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("gagal membaca file migrasi: %w", err)
	}

	_, err = tx.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", input.SchemaName))
	if err != nil {
		return fmt.Errorf("gagal mengatur search_path untuk schema baru: %w", err)
	}

	_, err = tx.ExecContext(ctx, string(migrationSQL))
	if err != nil {
		_, _ = tx.ExecContext(ctx, "SET search_path TO public")
		return fmt.Errorf("gagal menjalankan migrasi untuk schema baru: %w", err)
	}

	_, err = tx.ExecContext(ctx, "SET search_path TO public")
	if err != nil {
		return fmt.Errorf("gagal mereset search_path: %w", err)
	}

	return nil
}
