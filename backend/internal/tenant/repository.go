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

func (r *postgresRepository) CreateTenantSchema(ctx context.Context, tx *sql.Tx, input RegisterTenantInput) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO public.tenants (nama_sekolah, schema_name) VALUES ($1, $2)`, input.NamaSekolah, input.SchemaName)
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

	// Menjalankan migrasi 001
	migrationPath1, err := filepath.Abs("./db/migrations/001_initial_schema.sql")
	if err != nil {
		return fmt.Errorf("gagal path migrasi 001: %w", err)
	}
	migrationSQL1, err := os.ReadFile(migrationPath1)
	if err != nil {
		return fmt.Errorf("gagal baca migrasi 001: %w", err)
	}
	if _, err := tx.ExecContext(ctx, string(migrationSQL1)); err != nil {
		return fmt.Errorf("gagal menjalankan migrasi 001: %w", err)
	}

	// Menjalankan migrasi 002
	migrationPath2, err := filepath.Abs("./db/migrations/002_add_school_profile.sql")
	if err != nil {
		return fmt.Errorf("gagal path migrasi 002: %w", err)
	}
	migrationSQL2, err := os.ReadFile(migrationPath2)
	if err != nil {
		return fmt.Errorf("gagal baca migrasi 002: %w", err)
	}
	if _, err := tx.ExecContext(ctx, string(migrationSQL2)); err != nil {
		return fmt.Errorf("gagal menjalankan migrasi 002: %w", err)
	}

	// Menjalankan migrasi 003
	migrationPath3, err := filepath.Abs("./db/migrations/003_add_teacher_details.sql")
	if err != nil {
		return fmt.Errorf("gagal path migrasi 003: %w", err)
	}
	migrationSQL3, err := os.ReadFile(migrationPath3)
	if err != nil {
		return fmt.Errorf("gagal baca migrasi 003: %w", err)
	}
	if _, err := tx.ExecContext(ctx, string(migrationSQL3)); err != nil {
		return fmt.Errorf("gagal menjalankan migrasi 003: %w", err)
	}

	// --- TAMBAHAN KODE DI SINI ---
	// Menjalankan migrasi 004 untuk riwayat kepegawaian
	migrationPath4, err := filepath.Abs("./db/migrations/004_add_employment_history.sql")
	if err != nil {
		return fmt.Errorf("gagal path migrasi 004: %w", err)
	}
	migrationSQL4, err := os.ReadFile(migrationPath4)
	if err != nil {
		return fmt.Errorf("gagal baca migrasi 004: %w", err)
	}
	if _, err := tx.ExecContext(ctx, string(migrationSQL4)); err != nil {
		return fmt.Errorf("gagal menjalankan migrasi 004: %w", err)
	}
	// --- AKHIR TAMBAHAN ---

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

// --- FUNGSI LAINNYA TETAP SAMA ---
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
