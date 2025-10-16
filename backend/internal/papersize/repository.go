package papersize

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertPaperSizeInput) (*PaperSize, error)
	GetAll(ctx context.Context, schemaName string) ([]PaperSize, error)
	GetByID(ctx context.Context, schemaName string, id string) (*PaperSize, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertPaperSizeInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

// Implementasi CRUD
func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertPaperSizeInput) (*PaperSize, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	newID := uuid.New().String()
	query := `
        INSERT INTO paper_size (id, nama_kertas, satuan, panjang, lebar, margin_atas, margin_bawah, margin_kiri, margin_kanan)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING created_at, updated_at
    `
	now := time.Now()
	err := r.db.QueryRowContext(ctx, query, newID, input.NamaKertas, input.Satuan, input.Panjang, input.Lebar, input.MarginAtas, input.MarginBawah, input.MarginKiri, input.MarginKanan).Scan(&now, &now)

	if err != nil {
		return nil, fmt.Errorf("gagal memuat data paper size setelah dibuat: %w", err)
	}

	return r.GetByID(ctx, schemaName, newID)
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]PaperSize, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, nama_kertas, satuan, panjang, lebar, margin_atas, margin_bawah, margin_kiri, margin_kanan, created_at, updated_at FROM paper_size ORDER BY nama_kertas ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all paper size: %w", err)
	}
	defer rows.Close()

	var list []PaperSize
	for rows.Next() {
		var p PaperSize
		if err := rows.Scan(&p.ID, &p.NamaKertas, &p.Satuan, &p.Panjang, &p.Lebar, &p.MarginAtas, &p.MarginBawah, &p.MarginKiri, &p.MarginKanan, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data paper size: %w", err)
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*PaperSize, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `SELECT id, nama_kertas, satuan, panjang, lebar, margin_atas, margin_bawah, margin_kiri, margin_kanan, created_at, updated_at FROM paper_size WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var p PaperSize
	err := row.Scan(&p.ID, &p.NamaKertas, &p.Satuan, &p.Panjang, &p.Lebar, &p.MarginAtas, &p.MarginBawah, &p.MarginKiri, &p.MarginKanan, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data paper size by id: %w", err)
	}
	return &p, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id string, input UpsertPaperSizeInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `
        UPDATE paper_size SET 
            nama_kertas = $1, satuan = $2, panjang = $3, lebar = $4, 
            margin_atas = $5, margin_bawah = $6, margin_kiri = $7, margin_kanan = $8, 
            updated_at = NOW() 
        WHERE id = $9
    `
	result, err := r.db.ExecContext(ctx, query, input.NamaKertas, input.Satuan, input.Panjang, input.Lebar, input.MarginAtas, input.MarginBawah, input.MarginKiri, input.MarginKanan, id)
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
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `DELETE FROM paper_size WHERE id = $1`
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
