// file: backend/internal/presensi/repository.go
package presensi

import (
	"context"
	"database/sql"
	"fmt"
	"skoola/internal/rombel"
	"time"

	"github.com/lib/pq"
)

// Repository mendefinisikan interface untuk interaksi database presensi.
type Repository interface {
	GetPresensiByKelasAndMonth(ctx context.Context, schemaName string, kelasID string, year int, month int) ([]*PresensiSiswa, error)
	UpsertPresensiBulk(ctx context.Context, schemaName string, tanggal time.Time, data []PresensiData) error
	DeletePresensiBulk(ctx context.Context, schemaName string, tanggal time.Time, anggotaKelasIDs []string) error // <-- TAMBAHKAN INI
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

// --- FUNGSI BARU ---
func (r *postgresRepository) DeletePresensiBulk(ctx context.Context, schemaName string, tanggal time.Time, anggotaKelasIDs []string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `
		DELETE FROM presensi 
		WHERE tanggal = $1 AND anggota_kelas_id = ANY($2)
	`
	_, err := r.db.ExecContext(ctx, query, tanggal, pq.Array(anggotaKelasIDs))
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi delete bulk: %w", err)
	}
	return nil
}

// --- FUNGSI LAMA (TIDAK BERUBAH) ---
func (r *postgresRepository) GetPresensiByKelasAndMonth(ctx context.Context, schemaName string, kelasID string, year int, month int) ([]*PresensiSiswa, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	anggotaRepo := rombel.NewRepository(r.db)
	anggotaList, err := anggotaRepo.GetAllAnggotaByKelas(ctx, schemaName, kelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil anggota kelas: %w", err)
	}
	if len(anggotaList) == 0 {
		return []*PresensiSiswa{}, nil
	}
	resultMap := make(map[string]*PresensiSiswa)
	anggotaIDs := make([]string, len(anggotaList))
	for i, anggota := range anggotaList {
		anggotaIDs[i] = anggota.ID
		resultMap[anggota.ID] = &PresensiSiswa{
			AnggotaKelasID:  anggota.ID,
			NamaSiswa:       anggota.NamaLengkap,
			NIS:             anggota.NIS,
			PresensiPerHari: make(map[int]PresensiHari),
		}
	}
	endDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC).AddDate(0, 1, 0)
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)

	query := `
		SELECT anggota_kelas_id, tanggal, status, catatan
		FROM presensi
		WHERE anggota_kelas_id = ANY($1) AND tanggal >= $2 AND tanggal < $3
	`
	rows, err := r.db.QueryContext(ctx, query, pq.Array(anggotaIDs), startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("gagal query data presensi: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var p Presensi
		var t time.Time
		if err := rows.Scan(&p.AnggotaKelasID, &t, &p.Status, &p.Catatan); err != nil {
			return nil, fmt.Errorf("gagal memindai data presensi: %w", err)
		}
		if siswa, ok := resultMap[p.AnggotaKelasID]; ok {
			siswa.PresensiPerHari[t.Day()] = PresensiHari{
				Status:  p.Status,
				Catatan: p.Catatan,
			}
		}
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error saat iterasi data presensi: %w", err)
	}
	finalResult := make([]*PresensiSiswa, 0, len(resultMap))
	for _, anggota := range anggotaList {
		if val, ok := resultMap[anggota.ID]; ok {
			finalResult = append(finalResult, val)
		}
	}
	return finalResult, nil
}
func (r *postgresRepository) UpsertPresensiBulk(ctx context.Context, schemaName string, tanggal time.Time, data []PresensiData) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO presensi (anggota_kelas_id, tanggal, status, catatan)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (anggota_kelas_id, tanggal)
		DO UPDATE SET status = EXCLUDED.status, catatan = EXCLUDED.catatan, updated_at = NOW()
	`)
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement: %w", err)
	}
	defer stmt.Close()

	for _, item := range data {
		if _, err := stmt.ExecContext(ctx, item.AnggotaKelasID, tanggal, item.Status, item.Catatan); err != nil {
			return fmt.Errorf("gagal upsert presensi untuk anggota %s: %w", item.AnggotaKelasID, err)
		}
	}

	return tx.Commit()
}
