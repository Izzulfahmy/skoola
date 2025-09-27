// file: backend/internal/penilaiansumatif/repository.go
package penilaiansumatif

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

// Repository defines the interface for database interactions.
type Repository interface {
	Create(ctx context.Context, schemaName string, input *PenilaianSumatif) (*PenilaianSumatif, error)
	Update(ctx context.Context, schemaName string, input *PenilaianSumatif) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetByTujuanPembelajaranID(ctx context.Context, schemaName string, tpID int) ([]PenilaianSumatif, error)
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository creates a new instance of postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, ps *PenilaianSumatif) (*PenilaianSumatif, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	ps.ID = uuid.New().String()
	query := `
		INSERT INTO penilaian_sumatif (id, tujuan_pembelajaran_id, ujian_id, jenis_ujian_id, nama_penilaian, tanggal_pelaksanaan, keterangan)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at
	`
	err := r.db.QueryRowContext(ctx, query, ps.ID, ps.TujuanPembelajaranID, ps.UjianID, ps.JenisUjianID, ps.NamaPenilaian, ps.TanggalPelaksanaan, ps.Keterangan).Scan(&ps.CreatedAt, &ps.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create penilaian sumatif: %w", err)
	}
	return ps, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, ps *PenilaianSumatif) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `
		UPDATE penilaian_sumatif SET
			jenis_ujian_id = $1,
			nama_penilaian = $2,
			tanggal_pelaksanaan = $3,
			keterangan = $4,
			updated_at = NOW()
		WHERE id = $5
	`
	_, err := r.db.ExecContext(ctx, query, ps.JenisUjianID, ps.NamaPenilaian, ps.TanggalPelaksanaan, ps.Keterangan, ps.ID)
	return err
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM penilaian_sumatif WHERE id = $1", id)
	return err
}

func (r *postgresRepository) GetByTujuanPembelajaranID(ctx context.Context, schemaName string, tpID int) ([]PenilaianSumatif, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
		SELECT 
			ps.id, ps.tujuan_pembelajaran_id, ps.ujian_id, ps.jenis_ujian_id, ps.nama_penilaian, 
			ps.tanggal_pelaksanaan, ps.keterangan, ps.created_at, ps.updated_at,
			ju.nama_ujian, ju.kode_ujian
		FROM penilaian_sumatif ps
		JOIN jenis_ujian ju ON ps.jenis_ujian_id = ju.id
		WHERE ps.tujuan_pembelajaran_id = $1
		ORDER BY ps.tanggal_pelaksanaan ASC, ps.created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, tpID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PenilaianSumatif
	for rows.Next() {
		var ps PenilaianSumatif
		if err := rows.Scan(
			&ps.ID, &ps.TujuanPembelajaranID, &ps.UjianID, &ps.JenisUjianID, &ps.NamaPenilaian,
			&ps.TanggalPelaksanaan, &ps.Keterangan, &ps.CreatedAt, &ps.UpdatedAt,
			&ps.NamaJenisUjian, &ps.KodeJenisUjian,
		); err != nil {
			return nil, err
		}
		results = append(results, ps)
	}
	return results, nil
}
