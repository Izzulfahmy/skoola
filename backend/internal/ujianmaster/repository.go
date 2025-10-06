package ujianmaster

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// Repository defines the operations for UjianMaster and its related entities.
type Repository interface {
	Create(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error)
	GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID) ([]UjianMaster, error)
	GetByID(ctx context.Context, schemaName string, id uuid.UUID) (UjianMaster, error)
	Update(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error)
	Delete(ctx context.Context, schemaName string, id uuid.UUID) error
	GetPenugasanByUjianMasterID(ctx context.Context, schemaName string, id uuid.UUID) ([]PenugasanUjian, error)
	GetAvailableKelasForUjian(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID, ujianMasterID uuid.UUID) ([]AvailableKelas, error)
	AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, pengajarKelasIDs []string) (int, error)
	CreatePesertaUjianBatch(ctx context.Context, schemaName string, peserta []PesertaUjian) error
	FindPesertaByUjianID(ctx context.Context, schemaName string, ujianID uuid.UUID) ([]PesertaUjianDetail, error)
	// --- BARU: Mendefinisikan fungsi hapus peserta per kelas ---
	DeletePesertaByMasterAndKelas(ctx context.Context, schemaName string, masterID uuid.UUID, kelasID string) (int64, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new UjianMaster repository.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

// Create inserts a new UjianMaster record into the database.
func (r *repository) Create(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return UjianMaster{}, err
	}
	um.ID = uuid.New()
	um.CreatedAt = time.Now()
	um.UpdatedAt = time.Now()

	query := `
        INSERT INTO ujian_master (id, nama_paket_ujian, tahun_ajaran_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
    `
	_, err := r.db.ExecContext(ctx, query, um.ID, um.NamaPaketUjian, um.TahunAjaranID, um.CreatedAt, um.UpdatedAt)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal membuat paket ujian: %w", err)
	}
	return um, nil
}

// GetAllByTahunAjaran retrieves all UjianMaster records for a specific academic year.
func (r *repository) GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID) ([]UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	var results []UjianMaster
	query := `
        SELECT
            id,
            nama_paket_ujian,
            created_at,
            updated_at,
            tahun_ajaran_id
        FROM ujian_master
        WHERE tahun_ajaran_id = $1
        ORDER BY created_at DESC
    `
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal menjalankan query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var um UjianMaster
		if err := rows.Scan(
			&um.ID, &um.NamaPaketUjian, &um.CreatedAt, &um.UpdatedAt, &um.TahunAjaranID,
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
func (r *repository) GetByID(ctx context.Context, schemaName string, id uuid.UUID) (UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return UjianMaster{}, err
	}
	var um UjianMaster
	query := `
        SELECT
            id, nama_paket_ujian, tahun_ajaran_id,
            created_at, updated_at
        FROM ujian_master
        WHERE id = $1
    `
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&um.ID, &um.NamaPaketUjian, &um.TahunAjaranID,
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
func (r *repository) Update(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return UjianMaster{}, err
	}
	um.UpdatedAt = time.Now()
	query := `
        UPDATE ujian_master SET
            nama_paket_ujian = $2, updated_at = $3
        WHERE id = $1
    `
	_, err := r.db.ExecContext(ctx, query, um.ID, um.NamaPaketUjian, um.UpdatedAt)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal memperbarui paket ujian: %w", err)
	}
	return um, nil
}

// Delete removes an UjianMaster record from the database.
func (r *repository) Delete(ctx context.Context, schemaName string, id uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := "DELETE FROM ujian_master WHERE id = $1"
	result, err := r.db.ExecContext(ctx, query, id)
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

func (r *repository) GetPenugasanByUjianMasterID(ctx context.Context, schemaName string, id uuid.UUID) ([]PenugasanUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        SELECT
            pk.id as pengajar_kelas_id,
            k.id as kelas_id,
            k.nama_kelas,
            mp.nama_mapel,
            t.nama_lengkap as nama_guru
        FROM ujian u
        JOIN pengajar_kelas pk ON u.pengajar_kelas_id = pk.id
        JOIN kelas k ON pk.kelas_id = k.id
        JOIN mata_pelajaran mp ON pk.mata_pelajaran_id = mp.id
        JOIN teachers t ON pk.teacher_id = t.id
        WHERE u.ujian_master_id = $1
        ORDER BY k.nama_kelas, mp.nama_mapel
    `
	rows, err := r.db.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var penugasan []PenugasanUjian
	for rows.Next() {
		var p PenugasanUjian
		if err := rows.Scan(&p.PengajarKelasID, &p.KelasID, &p.NamaKelas, &p.NamaMapel, &p.NamaGuru); err != nil {
			return nil, err
		}
		penugasan = append(penugasan, p)
	}
	return penugasan, nil
}

func (r *repository) GetAvailableKelasForUjian(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID, ujianMasterID uuid.UUID) ([]AvailableKelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        SELECT
            k.id as kelas_id,
            k.nama_kelas,
            pk.id as pengajar_kelas_id,
            mp.nama_mapel || ' (' || t.nama_lengkap || ')' as mapel_guru
        FROM pengajar_kelas pk
        JOIN kelas k ON pk.kelas_id = k.id
        JOIN mata_pelajaran mp ON pk.mata_pelajaran_id = mp.id
        JOIN teachers t ON pk.teacher_id = t.id
        WHERE k.tahun_ajaran_id = $1
        AND pk.id NOT IN (
            SELECT pengajar_kelas_id FROM ujian WHERE ujian_master_id = $2
        )
        ORDER BY k.nama_kelas, mp.nama_mapel
    `

	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID, ujianMasterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	kelasMap := make(map[string]*AvailableKelas)
	var kelasOrder []string

	for rows.Next() {
		var kelasID, namaKelas, pengajarKelasID, mapelGuru string
		if err := rows.Scan(&kelasID, &namaKelas, &pengajarKelasID, &mapelGuru); err != nil {
			return nil, err
		}

		if _, exists := kelasMap[kelasID]; !exists {
			kelasMap[kelasID] = &AvailableKelas{Value: kelasID, Label: namaKelas, Children: []AvailableMapel{}}
			kelasOrder = append(kelasOrder, kelasID)
		}
		kelasMap[kelasID].Children = append(kelasMap[kelasID].Children, AvailableMapel{Value: pengajarKelasID, Label: mapelGuru})
	}

	var results []AvailableKelas
	for _, kelasID := range kelasOrder {
		results = append(results, *kelasMap[kelasID])
	}

	return results, nil
}

func (r *repository) AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, pengajarKelasIDs []string) (int, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, pq.CopyIn("ujian", "pengajar_kelas_id", "ujian_master_id"))
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	for _, pkID := range pengajarKelasIDs {
		_, err := stmt.Exec(pkID, ujianMasterID)
		if err != nil {
			return 0, err
		}
	}

	_, err = stmt.Exec()
	if err != nil {
		return 0, err
	}

	if err = tx.Commit(); err != nil {
		return 0, err
	}

	return len(pengajarKelasIDs), nil
}

func (r *repository) CreatePesertaUjianBatch(ctx context.Context, schemaName string, peserta []PesertaUjian) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, pq.CopyIn(
		"peserta_ujian",
		"id", "ujian_master_id", "anggota_kelas_id", "urutan", "created_at", "updated_at",
	))
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement COPY: %w", err)
	}
	defer stmt.Close()

	for _, p := range peserta {
		_, err = stmt.Exec(p.ID, p.UjianMasterID, p.AnggotaKelasID, p.Urutan, p.CreatedAt, p.UpdatedAt)
		if err != nil {
			return fmt.Errorf("gagal mengeksekusi statement untuk peserta ID %s: %w", p.ID, err)
		}
	}

	if _, err = stmt.Exec(); err != nil {
		return fmt.Errorf("gagal menutup statement COPY: %w", err)
	}

	return tx.Commit()
}

func (r *repository) FindPesertaByUjianID(ctx context.Context, schemaName string, ujianID uuid.UUID) ([]PesertaUjianDetail, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        SELECT
            pu.id,
            s.nama_lengkap as nama_siswa,
            s.nisn,
            pu.urutan,
            pu.nomor_ujian,
            k.nama_kelas
        FROM peserta_ujian pu
        JOIN anggota_kelas ak ON ak.id = pu.anggota_kelas_id
        JOIN students s ON s.id = ak.student_id
        JOIN kelas k ON k.id = ak.kelas_id
        WHERE pu.ujian_master_id = $1
        ORDER BY k.nama_kelas, pu.urutan
    `

	rows, err := r.db.QueryContext(ctx, query, ujianID)
	if err != nil {
		return nil, fmt.Errorf("gagal query peserta ujian: %w", err)
	}
	defer rows.Close()

	var results []PesertaUjianDetail
	for rows.Next() {
		var detail PesertaUjianDetail
		var nomorUjian sql.NullString
		var nisn sql.NullString

		if err := rows.Scan(
			&detail.ID,
			&detail.NamaSiswa,
			&nisn,
			&detail.Urutan,
			&nomorUjian,
			&detail.NamaKelas,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris peserta: %w", err)
		}

		if nomorUjian.Valid {
			detail.NomorUjian = &nomorUjian.String
		}
		if nisn.Valid {
			detail.NISN = &nisn.String
		}

		results = append(results, detail)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error pada baris hasil peserta: %w", err)
	}

	return results, nil
}

// Implementasi DeletePesertaByMasterAndKelas
//
// Fungsi ini bertanggung jawab menghapus semua entri `peserta_ujian` yang terhubung ke `ujian_master` tertentu dan termasuk dalam `kelas` tertentu.
func (r *repository) DeletePesertaByMasterAndKelas(ctx context.Context, schemaName string, masterID uuid.UUID, kelasID string) (int64, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}

	query := `
        DELETE FROM peserta_ujian
        WHERE id IN (
            SELECT pu.id
            FROM peserta_ujian pu
            JOIN anggota_kelas ak ON ak.id = pu.anggota_kelas_id
            WHERE pu.ujian_master_id = $1 AND ak.kelas_id = $2
        )
    `
	result, err := r.db.ExecContext(ctx, query, masterID, kelasID)
	if err != nil {
		return 0, fmt.Errorf("gagal menghapus peserta ujian berdasarkan kelas: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("gagal mendapatkan jumlah baris yang terpengaruh: %w", err)
	}

	return rowsAffected, nil
}
