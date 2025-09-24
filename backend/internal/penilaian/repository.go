// file: backend/internal/penilaian/repository.go
package penilaian

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	GetPenilaianByTP(ctx context.Context, schemaName string, kelasID string, tpIDs []int) (*FullPenilaianData, error)
	UpsertNilai(ctx context.Context, schemaName string, input BulkPenilaianInput) error
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

func (r *postgresRepository) GetPenilaianByTP(ctx context.Context, schemaName string, kelasID string, tpIDs []int) (*FullPenilaianData, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	// 1. Ambil daftar siswa dalam kelas tersebut
	siswaQuery := `
		SELECT ak.id, s.nama_lengkap, s.nis
		FROM anggota_kelas ak
		JOIN students s ON ak.student_id = s.id
		WHERE ak.kelas_id = $1
		ORDER BY s.nama_lengkap ASC
	`
	rowsSiswa, err := r.db.QueryContext(ctx, siswaQuery, kelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa: %w", err)
	}
	defer rowsSiswa.Close()

	penilaianDataMap := make(map[string]*PenilaianData)
	var siswaList []*PenilaianData

	for rowsSiswa.Next() {
		var pd PenilaianData
		if err := rowsSiswa.Scan(&pd.AnggotaKelasID, &pd.NamaSiswa, &pd.NIS); err != nil {
			return nil, fmt.Errorf("gagal memindai data siswa: %w", err)
		}
		pd.Nilai = make(map[int]*float64)
		penilaianDataMap[pd.AnggotaKelasID] = &pd
		siswaList = append(siswaList, &pd)
	}
	if err = rowsSiswa.Err(); err != nil {
		return nil, err
	}
	if len(tpIDs) == 0 {
		finalResult := make([]PenilaianData, len(siswaList))
		for i, s := range siswaList {
			finalResult[i] = *s
		}
		return &FullPenilaianData{Siswa: finalResult}, nil
	}

	// 2. Ambil nilai yang sudah ada untuk siswa dan TP yang dipilih
	args := []interface{}{kelasID}
	placeholders := make([]string, len(tpIDs))
	for i, id := range tpIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	nilaiQuery := fmt.Sprintf(`
		SELECT p.anggota_kelas_id, p.tujuan_pembelajaran_id, p.nilai, p.updated_at
		FROM penilaian p
		JOIN anggota_kelas ak ON p.anggota_kelas_id = ak.id
		WHERE ak.kelas_id = $1 AND p.tujuan_pembelajaran_id IN (%s)
	`, strings.Join(placeholders, ","))

	rowsNilai, err := r.db.QueryContext(ctx, nilaiQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data nilai: %w", err)
	}
	defer rowsNilai.Close()

	var lastUpdated *time.Time
	for rowsNilai.Next() {
		var anggotaID string
		var tpID int
		var nilai sql.NullFloat64
		var updatedAt time.Time
		if err := rowsNilai.Scan(&anggotaID, &tpID, &nilai, &updatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data nilai: %w", err)
		}
		if pd, ok := penilaianDataMap[anggotaID]; ok {
			if nilai.Valid {
				val := nilai.Float64
				pd.Nilai[tpID] = &val
			}
		}
		if lastUpdated == nil || updatedAt.After(*lastUpdated) {
			lastUpdated = &updatedAt
		}
	}
	if err = rowsNilai.Err(); err != nil {
		return nil, err
	}

	finalResult := make([]PenilaianData, len(siswaList))
	for i, s := range siswaList {
		finalResult[i] = *s
	}

	return &FullPenilaianData{Siswa: finalResult, LastUpdated: lastUpdated}, nil
}

func (r *postgresRepository) UpsertNilai(ctx context.Context, schemaName string, input BulkPenilaianInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO penilaian (anggota_kelas_id, tujuan_pembelajaran_id, nilai)
		VALUES ($1, $2, $3)
		ON CONFLICT (anggota_kelas_id, tujuan_pembelajaran_id)
		DO UPDATE SET nilai = EXCLUDED.nilai, updated_at = NOW()
	`)
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement: %w", err)
	}
	defer stmt.Close()

	for _, p := range input.Penilaian {
		if _, err := stmt.ExecContext(ctx, p.AnggotaKelasID, p.TujuanPembelajaranID, p.Nilai); err != nil {
			return fmt.Errorf("gagal upsert nilai untuk siswa %s: %w", p.AnggotaKelasID, err)
		}
	}

	return tx.Commit()
}
