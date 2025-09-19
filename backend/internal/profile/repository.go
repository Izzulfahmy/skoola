// file: backend/internal/profile/repository.go
package profile

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database profil sekolah.
type Repository interface {
	GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error)
	UpdateProfile(ctx context.Context, schemaName string, profile *ProfilSekolah) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// GetProfile mengambil data profil sekolah dari database berdasarkan schema.
func (r *postgresRepository) GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error) {
	// Set search_path agar query berjalan di schema yang benar
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
        SELECT id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id
        FROM profil_sekolah
        WHERE id = 1
    `
	row := r.db.QueryRowContext(ctx, query)

	var p ProfilSekolah
	err := row.Scan(
		&p.ID, &p.NPSN, &p.NamaSekolah, &p.Naungan, &p.Alamat, &p.Kelurahan, &p.Kecamatan,
		&p.KotaKabupaten, &p.Provinsi, &p.KodePos, &p.Telepon, &p.Email, &p.Website,
		&p.KepalaSekolah, &p.JenjangID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// Ini seharusnya tidak terjadi karena kita insert data default saat migrasi,
			// tapi ini adalah penanganan error yang baik.
			return nil, fmt.Errorf("profil sekolah tidak ditemukan")
		}
		return nil, fmt.Errorf("gagal memindai data profil sekolah: %w", err)
	}

	return &p, nil
}

// UpdateProfile memperbarui data profil sekolah di database.
func (r *postgresRepository) UpdateProfile(ctx context.Context, schemaName string, p *ProfilSekolah) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
        UPDATE profil_sekolah SET
            npsn = $1, nama_sekolah = $2, naungan = $3, alamat = $4, kelurahan = $5, kecamatan = $6,
            kota_kabupaten = $7, provinsi = $8, kode_pos = $9, telepon = $10, email = $11,
            website = $12, kepala_sekolah = $13, jenjang_id = $14
        WHERE id = 1
    `
	result, err := r.db.ExecContext(ctx, query,
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
		return sql.ErrNoRows // Profil tidak ditemukan untuk diupdate
	}

	return nil
}
