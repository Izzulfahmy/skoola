// backend/internal/ujianmaster/repository.go
package ujianmaster

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	Create(ctx context.Context, schemaName string, um *UjianMaster) error
	GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error)
	GetByID(ctx context.Context, schemaName string, id string) (*UjianMaster, error)
	Update(ctx context.Context, schemaName string, um *UjianMaster) error
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

func (r *postgresRepository) Create(ctx context.Context, schemaName string, um *UjianMaster) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `INSERT INTO ujian_master (id, tahun_ajaran_id, nama_paket_ujian) VALUES ($1, $2, $3)`
	_, err := r.db.ExecContext(ctx, query, um.ID, um.TahunAjaranID, um.NamaPaketUjian)
	return err
}

func (r *postgresRepository) GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, tahun_ajaran_id, nama_paket_ujian, created_at, updated_at FROM ujian_master WHERE tahun_ajaran_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []UjianMaster
	for rows.Next() {
		var um UjianMaster
		if err := rows.Scan(&um.ID, &um.TahunAjaranID, &um.NamaPaketUjian, &um.CreatedAt, &um.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, um)
	}
	return list, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, tahun_ajaran_id, nama_paket_ujian, created_at, updated_at FROM ujian_master WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	var um UjianMaster
	err := row.Scan(&um.ID, &um.TahunAjaranID, &um.NamaPaketUjian, &um.CreatedAt, &um.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &um, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, um *UjianMaster) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `UPDATE ujian_master SET nama_paket_ujian = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, um.NamaPaketUjian, um.ID)
	return err
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM ujian_master WHERE id = $1", id)
	return err
}
