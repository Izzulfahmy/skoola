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
	GetPenugasanByMasterID(ctx context.Context, schemaName string, ujianMasterID string) ([]PenugasanDetail, error)
	GetAvailableKelas(ctx context.Context, schemaName string, tahunAjaranID string, ujianMasterID string) ([]AvailableKelas, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// Fungsi ini penting dan harus ada.
func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, um *UjianMaster) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `INSERT INTO ujian_master (id, tahun_ajaran_id, nama_paket_ujian, jenis_ujian_id, durasi, jumlah_soal, keterangan) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, um.ID, um.TahunAjaranID, um.NamaPaketUjian, um.JenisUjianID, um.Durasi, um.JumlahSoal, um.Keterangan)
	return err
}

func (r *postgresRepository) GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	// PERBAIKAN: Nama skema dihapus dari query karena sudah di-handle oleh setSchema
	query := `
        SELECT um.id, um.nama_paket_ujian, um.jenis_ujian_id, ju.nama_jenis_ujian, um.durasi, um.jumlah_soal, um.keterangan, um.created_at, um.updated_at
        FROM ujian_master um
        JOIN jenis_ujian ju ON um.jenis_ujian_id = ju.id
        WHERE um.tahun_ajaran_id = $1
        ORDER BY um.created_at DESC
    `
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal menjalankan query: %w", err)
	}
	defer rows.Close()

	var results []UjianMaster
	for rows.Next() {
		var um UjianMaster
		if err := rows.Scan(
			&um.ID, &um.NamaPaketUjian, &um.JenisUjianID, &um.NamaJenisUjian, &um.Durasi, &um.JumlahSoal, &um.Keterangan, &um.CreatedAt, &um.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris: %w", err)
		}
		results = append(results, um)
	}
	return results, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, tahun_ajaran_id, nama_paket_ujian FROM ujian_master WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	var um UjianMaster
	err := row.Scan(&um.ID, &um.TahunAjaranID, &um.NamaPaketUjian)
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
	query := `UPDATE ujian_master SET nama_paket_ujian = $1, jenis_ujian_id = $2, durasi = $3, jumlah_soal = $4, keterangan = $5, updated_at = NOW() WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, um.NamaPaketUjian, um.JenisUjianID, um.Durasi, um.JumlahSoal, um.Keterangan, um.ID)
	return err
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM ujian_master WHERE id = $1", id)
	return err
}

func (r *postgresRepository) GetPenugasanByMasterID(ctx context.Context, schemaName string, ujianMasterID string) ([]PenugasanDetail, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
		SELECT pk.id, k.nama_kelas, mp.nama_mapel, t.nama_lengkap
		FROM ujian u
		JOIN pengajar_kelas pk ON u.pengajar_kelas_id = pk.id
		JOIN kelas k ON pk.kelas_id = k.id
		JOIN mata_pelajaran mp ON pk.mata_pelajaran_id = mp.id
		JOIN teachers t ON pk.teacher_id = t.id
		WHERE u.ujian_master_id = $1
		ORDER BY k.nama_kelas, mp.nama_mapel
	`
	rows, err := r.db.QueryContext(ctx, query, ujianMasterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PenugasanDetail
	for rows.Next() {
		var pd PenugasanDetail
		if err := rows.Scan(&pd.PengajarKelasID, &pd.NamaKelas, &pd.NamaMapel, &pd.NamaGuru); err != nil {
			return nil, err
		}
		results = append(results, pd)
	}
	return results, nil
}

func (r *postgresRepository) GetAvailableKelas(ctx context.Context, schemaName string, tahunAjaranID string, ujianMasterID string) ([]AvailableKelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
		WITH AssignedPengajar AS (
            SELECT pengajar_kelas_id
            FROM ujian
            WHERE ujian_master_id = $2
        )
        SELECT 
            DISTINCT ON (jp.id, t.id, mp.id, pk.id)
            jp.id as jenjang_id, jp.nama_jenjang,
            t.id as tingkatan_id, t.nama_tingkatan,
            mp.id as mapel_id, mp.nama_mapel,
            pk.id as pengajar_kelas_id, th.nama_lengkap as nama_guru
        FROM pengajar_kelas pk
        JOIN kelas k ON pk.kelas_id = k.id
        JOIN tingkatan t ON k.tingkatan_id = t.id
        JOIN jenjang_pendidikan jp ON t.jenjang_id = jp.id
        JOIN mata_pelajaran mp ON pk.mata_pelajaran_id = mp.id
        JOIN teachers th ON pk.teacher_id = th.id
        WHERE k.tahun_ajaran_id = $1
          AND pk.id NOT IN (SELECT pengajar_kelas_id FROM AssignedPengajar)
        ORDER BY jp.id, t.id, mp.id, pk.id;
    `
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID, ujianMasterID)
	if err != nil {
		return nil, fmt.Errorf("gagal query available kelas: %w", err)
	}
	defer rows.Close()

	tingkatanMap := make(map[string]*AvailableKelas)
	mapelMap := make(map[string]*AvailableMapel)

	for rows.Next() {
		var jenjangID, tingkatanID int
		var jenjangNama, tingkatanNama, mapelID, mapelNama, pengajarKelasID, namaGuru string

		if err := rows.Scan(&jenjangID, &jenjangNama, &tingkatanID, &tingkatanNama, &mapelID, &mapelNama, &pengajarKelasID, &namaGuru); err != nil {
			return nil, fmt.Errorf("gagal scan available kelas row: %w", err)
		}

		tingkatanKey := fmt.Sprintf("%d-%d", jenjangID, tingkatanID)
		if _, ok := tingkatanMap[tingkatanKey]; !ok {
			newTingkatan := AvailableKelas{
				Value:    tingkatanKey,
				Label:    fmt.Sprintf("%s - %s", jenjangNama, tingkatanNama),
				Children: []AvailableMapel{},
			}
			tingkatanMap[tingkatanKey] = &newTingkatan
		}

		mapelKey := fmt.Sprintf("%s-%s", tingkatanKey, mapelID)
		if _, ok := mapelMap[mapelKey]; !ok {
			newMapel := AvailableMapel{
				Value:    mapelID,
				Label:    mapelNama,
				Children: []AvailablePengajar{},
			}
			mapelMap[mapelKey] = &newMapel
			tingkatanMap[tingkatanKey].Children = append(tingkatanMap[tingkatanKey].Children, newMapel)
		}

		mapelMap[mapelKey].Children = append(mapelMap[mapelKey].Children, AvailablePengajar{
			Value: pengajarKelasID,
			Label: namaGuru,
		})
	}

	var result []AvailableKelas
	for _, v := range tingkatanMap {
		result = append(result, *v)
	}

	return result, nil
}
