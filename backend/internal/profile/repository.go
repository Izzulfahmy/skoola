package profile

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error)
	UpdateProfile(ctx context.Context, schemaName string, profile *ProfilSekolah) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

func (r *postgresRepository) GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error) {
	query := fmt.Sprintf(`
		SELECT id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id
		FROM %q.profil_sekolah
		WHERE id = 1
	`, schemaName)

	row := r.db.QueryRowContext(ctx, query)

	var p ProfilSekolah
	err := row.Scan(
		&p.ID, &p.NPSN, &p.NamaSekolah, &p.Naungan, &p.Alamat, &p.Kelurahan, &p.Kecamatan,
		&p.KotaKabupaten, &p.Provinsi, &p.KodePos, &p.Telepon, &p.Email, &p.Website,
		&p.KepalaSekolah, &p.JenjangID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("profil sekolah tidak ditemukan")
		}
		return nil, fmt.Errorf("gagal memindai data profil sekolah: %w", err)
	}

	return &p, nil
}

func (r *postgresRepository) UpdateProfile(ctx context.Context, schemaName string, p *ProfilSekolah) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	query := fmt.Sprintf(`
        UPDATE %q.profil_sekolah SET
            npsn = $1, nama_sekolah = $2, naungan = $3, alamat = $4, kelurahan = $5, kecamatan = $6,
            kota_kabupaten = $7, provinsi = $8, kode_pos = $9, telepon = $10, email = $11,
            website = $12, kepala_sekolah = $13, jenjang_id = $14
        WHERE id = 1
    `, schemaName)

	result, err := tx.ExecContext(ctx, query,
		p.NPSN, p.NamaSekolah, p.Naungan, p.Alamat, p.Kelurahan, p.Kecamatan,
		p.KotaKabupaten, p.Provinsi, p.KodePos, p.Telepon, p.Email,
		p.Website, p.KepalaSekolah, p.JenjangID,
	)

	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update profil: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	querySync := `UPDATE public.tenants SET nama_sekolah = $1 WHERE schema_name = $2`
	_, err = tx.ExecContext(ctx, querySync, p.NamaSekolah, schemaName)
	if err != nil {
		return fmt.Errorf("gagal sinkronisasi nama sekolah ke public.tenants: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return nil
}
