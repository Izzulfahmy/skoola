package ujianmaster

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Repository defines the operations for UjianMaster.
type Repository interface {
	Create(um UjianMaster) (UjianMaster, error)
	GetAllByTahunAjaran(tahunAjaranID uuid.UUID) ([]UjianMaster, error)
	GetByID(id uuid.UUID) (UjianMaster, error)
	Update(um UjianMaster) (UjianMaster, error)
	Delete(id uuid.UUID) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new UjianMaster repository.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// Create inserts a new UjianMaster record into the database.
func (r *repository) Create(um UjianMaster) (UjianMaster, error) {
	um.ID = uuid.New()
	um.CreatedAt = time.Now()
	um.UpdatedAt = time.Now()

	query := `
		INSERT INTO ujian_master (id, nama_paket_ujian, tahun_ajaran_id, jenis_ujian_id, durasi, jumlah_soal, keterangan, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(query, um.ID, um.NamaPaketUjian, um.TahunAjaranID, um.JenisUjianID, um.Durasi, um.JumlahSoal, um.Keterangan, um.CreatedAt, um.UpdatedAt)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal membuat paket ujian: %w", err)
	}
	return um, nil
}

// GetAllByTahunAjaran retrieves all UjianMaster records for a specific academic year.
func (r *repository) GetAllByTahunAjaran(tahunAjaranID uuid.UUID) ([]UjianMaster, error) {
	var results []UjianMaster
	query := `
        SELECT
            um.id,
            um.nama_paket_ujian,
            um.jenis_ujian_id,
            ju.nama_ujian,
            um.durasi,
            um.jumlah_soal,
            um.keterangan,
            um.created_at,
            um.updated_at
        FROM ujian_master um
        JOIN jenis_ujian ju ON um.jenis_ujian_id = ju.id
        WHERE um.tahun_ajaran_id = $1
        ORDER BY um.created_at DESC
    `
	rows, err := r.db.Query(query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal menjalankan query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var um UjianMaster
		if err := rows.Scan(
			&um.ID, &um.NamaPaketUjian, &um.JenisUjianID, &um.NamaJenisUjian, &um.Durasi, &um.JumlahSoal, &um.Keterangan, &um.CreatedAt, &um.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris: %w", err)
		}
		results = append(results, um)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error pada baris hasil: %w", err)
	}

	return results, nil
}

// GetByID retrieves a single UjianMaster by its ID.
func (r *repository) GetByID(id uuid.UUID) (UjianMaster, error) {
	var um UjianMaster
	query := `
		SELECT
			um.id, um.nama_paket_ujian, um.tahun_ajaran_id, um.jenis_ujian_id,
			ju.nama_ujian, um.durasi, um.jumlah_soal, um.keterangan,
			um.created_at, um.updated_at
		FROM ujian_master um
		JOIN jenis_ujian ju ON um.jenis_ujian_id = ju.id
		WHERE um.id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&um.ID, &um.NamaPaketUjian, &um.TahunAjaranID, &um.JenisUjianID,
		&um.NamaJenisUjian, &um.Durasi, &um.JumlahSoal, &um.Keterangan,
		&um.CreatedAt, &um.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return UjianMaster{}, errors.New("paket ujian tidak ditemukan")
		}
		return UjianMaster{}, fmt.Errorf("gagal mengambil paket ujian: %w", err)
	}
	return um, nil
}

// Update modifies an existing UjianMaster record.
func (r *repository) Update(um UjianMaster) (UjianMaster, error) {
	um.UpdatedAt = time.Now()
	query := `
		UPDATE ujian_master SET
			nama_paket_ujian = $2, jenis_ujian_id = $3, durasi = $4,
			jumlah_soal = $5, keterangan = $6, updated_at = $7
		WHERE id = $1
	`
	_, err := r.db.Exec(query, um.ID, um.NamaPaketUjian, um.JenisUjianID, um.Durasi, um.JumlahSoal, um.Keterangan, um.UpdatedAt)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal memperbarui paket ujian: %w", err)
	}
	return um, nil
}

// Delete removes an UjianMaster record from the database.
func (r *repository) Delete(id uuid.UUID) error {
	query := "DELETE FROM ujian_master WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("gagal menghapus paket ujian: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal mendapatkan jumlah baris yang terpengaruh: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("paket ujian tidak ditemukan untuk dihapus")
	}

	return nil
}
