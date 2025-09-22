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
	GetTenantsWithoutNaungan(ctx context.Context) ([]Tenant, error)
	DeleteTenantBySchema(ctx context.Context, schemaName string) error
	ApplyMigrationToSchema(ctx context.Context, schemaName string, migrationSQL []byte) error
	CheckSchemaExists(ctx context.Context, schemaName string) (bool, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// --- FUNGSI BARU UNTUK MENGAMBIL TENANT TANPA NAUNGAN ---
func (r *postgresRepository) GetTenantsWithoutNaungan(ctx context.Context) ([]Tenant, error) {
	query := `
		SELECT 
			t.id, t.nama_sekolah, t.schema_name, t.naungan_id, n.nama_naungan, t.created_at, t.updated_at 
		FROM public.tenants t
		LEFT JOIN public.naungan n ON t.naungan_id = n.id
		WHERE t.naungan_id IS NULL
		ORDER BY t.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all tenants without naungan: %w", err)
	}
	defer rows.Close()

	var tenants []Tenant
	for rows.Next() {
		var t Tenant
		var naunganID, namaNaungan sql.NullString

		if err := rows.Scan(&t.ID, &t.NamaSekolah, &t.SchemaName, &naunganID, &namaNaungan, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data tenant: %w", err)
		}

		if naunganID.Valid {
			t.NaunganID = &naunganID.String
		}
		if namaNaungan.Valid {
			t.NamaNaungan = &namaNaungan.String
		}

		tenants = append(tenants, t)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data tenant: %w", err)
	}
	return tenants, nil
}

func (r *postgresRepository) CreateTenantSchema(ctx context.Context, tx *sql.Tx, input RegisterTenantInput) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO public.tenants (nama_sekolah, schema_name, naungan_id) VALUES ($1, $2, $3)`, input.NamaSekolah, input.SchemaName, input.NaunganID)
	if err != nil {
		return fmt.Errorf("gagal insert ke tabel public.tenants: %w", err)
	}
	_, err = tx.ExecContext(ctx, fmt.Sprintf("CREATE SCHEMA %q", input.SchemaName))
	if err != nil {
		return fmt.Errorf("gagal membuat schema baru: %w", err)
	}

	_, err = tx.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", input.SchemaName))
	if err != nil {
		return fmt.Errorf("gagal mengatur search_path untuk schema baru: %w", err)
	}

	// Menjalankan migrasi yang sudah ada untuk skema tenant baru
	migrationPaths := []string{
		"./db/migrations/001_initial_schema.sql",
		"./db/migrations/002_add_school_profile.sql",
		"./db/migrations/003_add_teacher_details.sql",
		"./db/migrations/004_add_employment_history.sql",
		"./db/migrations/006_enhance_students_table.sql",
		"./db/migrations/007_add_academic_history.sql",
		"./db/migrations/008_add_jenjang_pendidikan.sql",
		"./db/migrations/009_add_jabatan.sql", // <-- TAMBAHKAN MIGRASI BARU DI SINI
	}

	for _, path := range migrationPaths {
		absPath, err := filepath.Abs(path)
		if err != nil {
			return fmt.Errorf("gagal mendapatkan path absolut untuk %s: %w", path, err)
		}
		migrationSQL, err := os.ReadFile(absPath)
		if err != nil {
			return fmt.Errorf("gagal membaca file migrasi %s: %w", path, err)
		}
		if _, err := tx.ExecContext(ctx, string(migrationSQL)); err != nil {
			return fmt.Errorf("gagal menjalankan migrasi %s: %w", path, err)
		}
	}

	updateNameQuery := `UPDATE profil_sekolah SET nama_sekolah = $1 WHERE id = 1`
	if _, err := tx.ExecContext(ctx, updateNameQuery, input.NamaSekolah); err != nil {
		return fmt.Errorf("gagal update nama sekolah di profil: %w", err)
	}

	_, err = tx.ExecContext(ctx, "SET search_path TO public")
	if err != nil {
		return fmt.Errorf("gagal mereset search_path: %w", err)
	}

	return nil
}

func (r *postgresRepository) GetAll(ctx context.Context) ([]Tenant, error) {
	query := `
		SELECT 
			t.id, t.nama_sekolah, t.schema_name, t.naungan_id, n.nama_naungan, t.created_at, t.updated_at 
		FROM public.tenants t
		LEFT JOIN public.naungan n ON t.naungan_id = n.id
		ORDER BY t.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all tenants: %w", err)
	}
	defer rows.Close()

	var tenants []Tenant
	for rows.Next() {
		var t Tenant
		var naunganID, namaNaungan sql.NullString

		if err := rows.Scan(&t.ID, &t.NamaSekolah, &t.SchemaName, &naunganID, &namaNaungan, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data tenant: %w", err)
		}

		if naunganID.Valid {
			t.NaunganID = &naunganID.String
		}
		if namaNaungan.Valid {
			t.NamaNaungan = &namaNaungan.String
		}

		tenants = append(tenants, t)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data tenant: %w", err)
	}
	return tenants, nil
}

func (r *postgresRepository) CheckSchemaExists(ctx context.Context, schemaName string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM public.tenants WHERE schema_name = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, schemaName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("gagal memeriksa keberadaan schema: %w", err)
	}
	return exists, nil
}

func (r *postgresRepository) ApplyMigrationToSchema(ctx context.Context, schemaName string, migrationSQL []byte) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi untuk migrasi: %w", err)
	}
	defer tx.Rollback()

	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur search_path untuk migrasi: %w", err)
	}

	if _, err := tx.ExecContext(ctx, string(migrationSQL)); err != nil {
		return fmt.Errorf("gagal menjalankan migrasi untuk skema %s: %w", schemaName, err)
	}

	return tx.Commit()
}

func (r *postgresRepository) DeleteTenantBySchema(ctx context.Context, schemaName string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	dropSchemaQuery := fmt.Sprintf("DROP SCHEMA %q CASCADE", schemaName)
	if _, err := tx.ExecContext(ctx, dropSchemaQuery); err != nil {
		return fmt.Errorf("gagal menghapus skema %s: %w", schemaName, err)
	}

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
		return sql.ErrNoRows
	}

	return tx.Commit()
}
