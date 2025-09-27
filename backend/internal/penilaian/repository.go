// file: backend/internal/penilaian/repository.go
package penilaian

import (
	"context"
	"database/sql"
	"fmt"
	"skoola/internal/pembelajaran" // Import paket pembelajaran
	"time"

	"github.com/lib/pq"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	GetPenilaianLengkap(ctx context.Context, schemaName string, kelasID string, pengajarKelasID string) (*FullPenilaianData, []pembelajaran.RencanaPembelajaranItem, error)
	UpsertNilaiBulk(ctx context.Context, schemaName string, input BulkUpsertNilaiInput) error
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

func (r *postgresRepository) GetPenilaianLengkap(ctx context.Context, schemaName string, kelasID string, pengajarKelasID string) (*FullPenilaianData, []pembelajaran.RencanaPembelajaranItem, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, nil, err
	}

	// 1. Ambil struktur Rencana Pembelajaran (Materi & Ujian)
	pembelajaranRepo := pembelajaran.NewRepository(r.db)
	rencanaList, err := pembelajaranRepo.GetAllRencanaPembelajaran(ctx, schemaName, pengajarKelasID)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil struktur rencana pembelajaran: %w", err)
	}

	// 2. Ambil daftar siswa dalam kelas
	siswaQuery := `
		SELECT ak.id, s.nama_lengkap, s.nis
		FROM anggota_kelas ak
		JOIN students s ON ak.student_id = s.id
		WHERE ak.kelas_id = $1
		ORDER BY ak.urutan ASC, s.nama_lengkap ASC
	`
	rowsSiswa, err := r.db.QueryContext(ctx, siswaQuery, kelasID)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil data siswa: %w", err)
	}
	defer rowsSiswa.Close()

	var siswaList []PenilaianSiswaData
	anggotaKelasIDs := []string{}
	for rowsSiswa.Next() {
		var psd PenilaianSiswaData
		if err := rowsSiswa.Scan(&psd.AnggotaKelasID, &psd.NamaSiswa, &psd.NIS); err != nil {
			return nil, nil, fmt.Errorf("gagal memindai data siswa: %w", err)
		}
		psd.NilaiFormatif = make(map[int]NilaiSiswa)
		psd.NilaiSumatif = make(map[string]NilaiSumatifSiswa)
		siswaList = append(siswaList, psd)
		anggotaKelasIDs = append(anggotaKelasIDs, psd.AnggotaKelasID)
	}
	if err = rowsSiswa.Err(); err != nil {
		return nil, nil, err
	}

	if len(siswaList) == 0 {
		return &FullPenilaianData{Siswa: siswaList}, rencanaList, nil
	}

	siswaMap := make(map[string]*PenilaianSiswaData)
	for i := range siswaList {
		siswaMap[siswaList[i].AnggotaKelasID] = &siswaList[i]
	}

	var lastUpdated *time.Time

	// 3. Ambil nilai formatif yang sudah ada
	nilaiFormatifQuery := `
		SELECT anggota_kelas_id, tujuan_pembelajaran_id, nilai, updated_at
		FROM penilaian
		WHERE anggota_kelas_id = ANY($1)
	`
	rowsNilaiFormatif, err := r.db.QueryContext(ctx, nilaiFormatifQuery, pq.Array(anggotaKelasIDs))
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil data nilai formatif: %w", err)
	}
	defer rowsNilaiFormatif.Close()

	for rowsNilaiFormatif.Next() {
		var anggotaID string
		var tpID int
		var nilai sql.NullFloat64
		var updatedAt time.Time
		if err := rowsNilaiFormatif.Scan(&anggotaID, &tpID, &nilai, &updatedAt); err != nil {
			return nil, nil, fmt.Errorf("gagal memindai data nilai formatif: %w", err)
		}
		if siswa, ok := siswaMap[anggotaID]; ok {
			var nilaiPtr *float64
			if nilai.Valid {
				nilaiPtr = &nilai.Float64
			}
			siswa.NilaiFormatif[tpID] = NilaiSiswa{Nilai: nilaiPtr, UpdatedAt: &updatedAt}
		}
		if lastUpdated == nil || updatedAt.After(*lastUpdated) {
			lastUpdated = &updatedAt
		}
	}

	// 4. Ambil nilai sumatif yang sudah ada
	nilaiSumatifQuery := `
		SELECT anggota_kelas_id, penilaian_sumatif_id, nilai, updated_at
		FROM nilai_sumatif_siswa
		WHERE anggota_kelas_id = ANY($1)
	`
	rowsNilaiSumatif, err := r.db.QueryContext(ctx, nilaiSumatifQuery, pq.Array(anggotaKelasIDs))
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil data nilai sumatif: %w", err)
	}
	defer rowsNilaiSumatif.Close()

	for rowsNilaiSumatif.Next() {
		var anggotaID, psID string
		var nilai sql.NullFloat64
		var updatedAt time.Time
		if err := rowsNilaiSumatif.Scan(&anggotaID, &psID, &nilai, &updatedAt); err != nil {
			return nil, nil, fmt.Errorf("gagal memindai data nilai sumatif: %w", err)
		}
		if siswa, ok := siswaMap[anggotaID]; ok {
			var nilaiPtr *float64
			if nilai.Valid {
				nilaiPtr = &nilai.Float64
			}
			siswa.NilaiSumatif[psID] = NilaiSumatifSiswa{Nilai: nilaiPtr, UpdatedAt: &updatedAt}
		}
		if lastUpdated == nil || updatedAt.After(*lastUpdated) {
			lastUpdated = &updatedAt
		}
	}

	return &FullPenilaianData{Siswa: siswaList, LastUpdated: lastUpdated}, rencanaList, nil
}

func (r *postgresRepository) UpsertNilaiBulk(ctx context.Context, schemaName string, input BulkUpsertNilaiInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// Upsert Nilai Formatif
	if len(input.NilaiFormatif) > 0 {
		stmtFormatif, err := tx.PrepareContext(ctx, `
			INSERT INTO penilaian (anggota_kelas_id, tujuan_pembelajaran_id, nilai)
			VALUES ($1, $2, $3)
			ON CONFLICT (anggota_kelas_id, tujuan_pembelajaran_id)
			DO UPDATE SET nilai = EXCLUDED.nilai, updated_at = NOW()
		`)
		if err != nil {
			return fmt.Errorf("gagal mempersiapkan statement formatif: %w", err)
		}
		defer stmtFormatif.Close()
		for _, p := range input.NilaiFormatif {
			if _, err := stmtFormatif.ExecContext(ctx, p.AnggotaKelasID, p.TujuanPembelajaranID, p.Nilai); err != nil {
				return fmt.Errorf("gagal upsert nilai formatif: %w", err)
			}
		}
	}

	// Upsert Nilai Sumatif
	if len(input.NilaiSumatif) > 0 {
		stmtSumatif, err := tx.PrepareContext(ctx, `
			INSERT INTO nilai_sumatif_siswa (anggota_kelas_id, penilaian_sumatif_id, nilai)
			VALUES ($1, $2, $3)
			ON CONFLICT (anggota_kelas_id, penilaian_sumatif_id)
			DO UPDATE SET nilai = EXCLUDED.nilai, updated_at = NOW()
		`)
		if err != nil {
			return fmt.Errorf("gagal mempersiapkan statement sumatif: %w", err)
		}
		defer stmtSumatif.Close()
		for _, p := range input.NilaiSumatif {
			if _, err := stmtSumatif.ExecContext(ctx, p.AnggotaKelasID, p.PenilaianSumatifID, p.Nilai); err != nil {
				return fmt.Errorf("gagal upsert nilai sumatif: %w", err)
			}
		}
	}

	return tx.Commit()
}
