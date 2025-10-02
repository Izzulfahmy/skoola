// file: backend/internal/prestasi/repository.go
package prestasi

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database prestasi.
type Repository interface {
	Create(ctx context.Context, schemaName string, p *Prestasi) (*Prestasi, error)
	GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Prestasi, error)
	Delete(ctx context.Context, schemaName string, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, p *Prestasi) (*Prestasi, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
		INSERT INTO prestasi_siswa (id, tahun_ajaran_id, anggota_kelas_id, nama_prestasi, tingkat, peringkat, tanggal, deskripsi)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	err := r.db.QueryRowContext(ctx, query, p.ID, p.TahunAjaranID, p.AnggotaKelasID, p.NamaPrestasi, p.Tingkat, p.Peringkat, p.Tanggal, p.Deskripsi).Scan(&p.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal insert prestasi: %w", err)
	}

	return p, nil
}

func (r *postgresRepository) GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Prestasi, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
		SELECT 
			p.id, p.tahun_ajaran_id, p.anggota_kelas_id, p.nama_prestasi, p.tingkat, p.peringkat, 
			p.tanggal, p.deskripsi, p.created_at, p.updated_at,
			s.nama_lengkap as nama_siswa,
			k.nama_kelas
		FROM prestasi_siswa p
		JOIN anggota_kelas ak ON p.anggota_kelas_id = ak.id
		JOIN students s ON ak.student_id = s.id
		JOIN kelas k ON ak.kelas_id = k.id
		WHERE p.tahun_ajaran_id = $1
		ORDER BY p.tanggal DESC, s.nama_lengkap ASC
	`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all prestasi: %w", err)
	}
	defer rows.Close()

	var list []Prestasi
	for rows.Next() {
		var p Prestasi
		if err := rows.Scan(
			&p.ID, &p.TahunAjaranID, &p.AnggotaKelasID, &p.NamaPrestasi, &p.Tingkat, &p.Peringkat,
			&p.Tanggal, &p.Deskripsi, &p.CreatedAt, &p.UpdatedAt,
			&p.NamaSiswa, &p.NamaKelas,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai data prestasi: %w", err)
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `DELETE FROM prestasi_siswa WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
