// file: backend/internal/tingkatan/repository.go
package tingkatan

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertTingkatanInput) (*Tingkatan, error)
	GetAll(ctx context.Context, schemaName string) ([]Tingkatan, error)
	GetByID(ctx context.Context, schemaName string, id int) (*Tingkatan, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertTingkatanInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertTingkatanInput) (*Tingkatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO tingkatan (nama_tingkatan, urutan) VALUES ($1, $2) RETURNING id, nama_tingkatan, urutan, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.NamaTingkatan, input.Urutan)

	var t Tingkatan
	if err := row.Scan(&t.ID, &t.NamaTingkatan, &t.Urutan, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data tingkatan setelah dibuat: %w", err)
	}
	return &t, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Tingkatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_tingkatan, urutan, created_at, updated_at FROM tingkatan ORDER BY urutan ASC, nama_tingkatan ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all tingkatan: %w", err)
	}
	defer rows.Close()

	var tingkatanList []Tingkatan
	for rows.Next() {
		var t Tingkatan
		if err := rows.Scan(&t.ID, &t.NamaTingkatan, &t.Urutan, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data tingkatan: %w", err)
		}
		tingkatanList = append(tingkatanList, t)
	}
	return tingkatanList, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id int) (*Tingkatan, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_tingkatan, urutan, created_at, updated_at FROM tingkatan WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var t Tingkatan
	err := row.Scan(&t.ID, &t.NamaTingkatan, &t.Urutan, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan, bukan error
		}
		return nil, fmt.Errorf("gagal memindai data tingkatan by id: %w", err)
	}
	return &t, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertTingkatanInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE tingkatan SET nama_tingkatan = $1, urutan = $2, updated_at = NOW() WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.NamaTingkatan, input.Urutan, id)
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

	query := `DELETE FROM tingkatan WHERE id = $1`
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
