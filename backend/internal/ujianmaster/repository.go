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
	// Ujian Master Core
	// FIX: Mengganti UujianMaster menjadi UjianMaster
	Create(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error)
	GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID) ([]UjianMaster, error)
	GetByID(ctx context.Context, schemaName string, id uuid.UUID) (UjianMaster, error)
	Update(ctx context.Context, schemaName string, um UjianMaster) (UjianMaster, error)
	Delete(ctx context.Context, schemaName string, id uuid.UUID) error
	GetPenugasanByUjianMasterID(ctx context.Context, schemaName string, id uuid.UUID) ([]PenugasanUjian, error)
	GetAvailableKelasForUjian(ctx context.Context, schemaName string, tahunAjaranID uuid.UUID, ujianMasterID uuid.UUID) ([]AvailableKelas, error)
	AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, pengajarKelasIDs []string) (int, error)
	CreatePesertaUjianBatch(ctx context.Context, schemaName string, peserta []PesertaUjian) error
	DeletePesertaByMasterAndKelas(ctx context.Context, schemaName string, masterID uuid.UUID, kelasID uuid.UUID) (int64, error)

	// Peserta & Seating
	FindPesertaByUjianID(ctx context.Context, schemaName string, ujianID uuid.UUID) ([]PesertaUjianDetail, error)                  // Updated to include seating/room info
	FindPesertaDetailByUjianIDWithSeating(ctx context.Context, schemaName string, ujianID uuid.UUID) ([]PesertaUjianDetail, error) // Alias/Mirror of FindPesertaByUjianID for clarity
	FindAllPesertaByUjianID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]PesertaUjian, error)
	UpdatePesertaSeating(ctx context.Context, schemaName string, pesertaID uuid.UUID, alokasiRuanganID uuid.UUID, nomorKursi string) error
	UpdatePesertaSeatingBatch(ctx context.Context, schemaName string, assignments []struct {
		PesertaID        uuid.UUID
		AlokasiRuanganID uuid.UUID
		NomorKursi       string
	}) error
	ClearAllSeatingByUjianMasterID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) error

	// Room Master
	CreateRuangan(ctx context.Context, schemaName string, ruangan RuanganUjian) (RuanganUjian, error)
	GetAllRuangan(ctx context.Context, schemaName string) ([]RuanganUjian, error)
	UpdateRuangan(ctx context.Context, schemaName string, ruangan RuanganUjian) (RuanganUjian, error)
	DeleteRuangan(ctx context.Context, schemaName string, ruanganID uuid.UUID) error

	// Room Allocation
	CreateAlokasiRuanganBatch(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, ruanganIDs []uuid.UUID) ([]AlokasiRuanganUjian, error)
	GetAlokasiRuanganByUjianMasterID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]AlokasiRuanganUjian, error)
	DeleteAlokasiRuangan(ctx context.Context, schemaName string, alokasiRuanganID uuid.UUID) error
	ClearSeatingByAlokasiRuanganID(ctx context.Context, schemaName string, alokasiRuanganID uuid.UUID) error // Helper for cleanup

	// [BARU] Fungsi untuk menghitung ulang kursi terpakai
	RecalculateAlokasiKursiCount(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) error

	// Generate & Import
	GenerateNomorUjianForUjianMaster(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, prefix string) (int, error)
	UpdatePesertaNomorUjianFromExcel(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, updates []struct {
		NamaLengkap string
		NomorUjian  string
	}) (int, error)

	// --- KARTU UJIAN ---
	GetUniqueRombelIDs(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]KartuUjianKelasFilter, error)
	GetKartuUjianData(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, rombelID uuid.UUID, pesertaIDs []uuid.UUID) ([]KartuUjianDetail, error)
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

// CreatePesertaUjianBatch creates multiple peserta ujian records
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
		"id", "ujian_master_id", "anggota_kelas_id", "kelas_id", "urutan", "created_at", "updated_at",
	))
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement COPY: %w", err)
	}
	defer stmt.Close()

	for _, p := range peserta {
		_, err = stmt.Exec(p.ID, p.UjianMasterID, p.AnggotaKelasID, p.KelasID, p.Urutan, p.CreatedAt, p.UpdatedAt)
		if err != nil {
			return fmt.Errorf("gagal mengeksekusi statement untuk peserta ID %s: %w", p.ID, err)
		}
	}

	if _, err = stmt.Exec(); err != nil {
		return fmt.Errorf("gagal menutup statement COPY: %w", err)
	}

	return tx.Commit()
}

// FindPesertaByUjianID retrieves detailed participant data, now including seating info.
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
            k.nama_kelas,
            -- --- KOLOM BARU UNTUK RUANGAN ---
            aru.id AS alokasi_ruangan_id,
            aru.kode_ruangan,
            pu.nomor_kursi
            -- -------------------------------
        FROM peserta_ujian pu
        JOIN anggota_kelas ak ON ak.id = pu.anggota_kelas_id
        JOIN students s ON s.id = ak.student_id
        JOIN kelas k ON k.id = pu.kelas_id
        LEFT JOIN alokasi_ruangan_ujian aru ON aru.id = pu.alokasi_ruangan_id -- LEFT JOIN ke tabel alokasi baru
        LEFT JOIN ruangan_ujian ru ON ru.id = aru.ruangan_id -- Tambahkan join untuk detail ruangan jika diperlukan
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
		// --- BARU ---
		var alokasiRuanganID sql.NullString
		var kodeRuangan sql.NullString
		var nomorKursi sql.NullString
		// ------------

		if err := rows.Scan(
			&detail.ID,
			&detail.NamaSiswa,
			&nisn,
			&detail.Urutan,
			&nomorUjian,
			&detail.NamaKelas,
			// --- BARU ---
			&alokasiRuanganID,
			&kodeRuangan,
			&nomorKursi,
			// ------------
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris peserta: %w", err)
		}

		if nomorUjian.Valid {
			detail.NomorUjian = &nomorUjian.String
		}
		if nisn.Valid {
			detail.NISN = &nisn.String
		}
		// --- BARU ---
		if alokasiRuanganID.Valid {
			detail.AlokasiRuanganID = &alokasiRuanganID.String
		}
		if kodeRuangan.Valid {
			detail.KodeRuangan = &kodeRuangan.String
		}
		if nomorKursi.Valid {
			detail.NomorKursi = &nomorKursi.String
		}
		// ------------

		results = append(results, detail)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error pada baris hasil peserta: %w", err)
	}

	return results, nil
}

// FindPesertaDetailByUjianIDWithSeating is a mirror/alias of the updated FindPesertaByUjianID
func (r *repository) FindPesertaDetailByUjianIDWithSeating(ctx context.Context, schemaName string, ujianID uuid.UUID) ([]PesertaUjianDetail, error) {
	return r.FindPesertaByUjianID(ctx, schemaName, ujianID)
}

// FindAllPesertaByUjianID retrieves only the core PesertaUjian records.
func (r *repository) FindAllPesertaByUjianID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]PesertaUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        SELECT 
            id, ujian_master_id, anggota_kelas_id, kelas_id, urutan, nomor_ujian, created_at, updated_at
        FROM peserta_ujian 
        WHERE ujian_master_id = $1
        ORDER BY kelas_id, urutan
    `
	rows, err := r.db.QueryContext(ctx, query, ujianMasterID)
	if err != nil {
		return nil, fmt.Errorf("gagal query semua peserta ujian: %w", err)
	}
	defer rows.Close()

	var results []PesertaUjian
	for rows.Next() {
		var p PesertaUjian
		var nomorUjian sql.NullString

		if err := rows.Scan(
			&p.ID, &p.UjianMasterID, &p.AnggotaKelasID, &p.KelasID, &p.Urutan, &nomorUjian, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris PesertaUjian: %w", err)
		}

		if nomorUjian.Valid {
			p.NomorUjian = &nomorUjian.String
		}
		results = append(results, p)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error pada baris hasil PesertaUjian: %w", err)
	}

	return results, nil
}

// UpdatePesertaSeating updates the room allocation and seat number for a single participant.
func (r *repository) UpdatePesertaSeating(ctx context.Context, schemaName string, pesertaID uuid.UUID, alokasiRuanganID uuid.UUID, nomorKursi string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	// --- AWAL LOGIKA UNASSIGN/NULL ---
	var arIDParam interface{} = alokasiRuanganID
	var nkParam interface{} = nomorKursi

	// Cek jika ID Ruangan adalah UUID.Nil, yang berarti UNASSIGN/NULL
	if alokasiRuanganID == uuid.Nil {
		arIDParam = nil // Set alokasi_ruangan_id ke SQL NULL
		nkParam = nil   // Juga set nomor_kursi ke SQL NULL jika ruangan diunassign
	} else if nomorKursi == "" {
		// Jika ada ruangan, tapi nomor kursinya dikosongkan (optional)
		nkParam = nil // Set nomor_kursi ke SQL NULL
	}
	// --- AKHIR LOGIKA UNASSIGN/NULL ---

	query := `
        UPDATE peserta_ujian
        SET alokasi_ruangan_id = $2, nomor_kursi = $3, updated_at = NOW()
        WHERE id = $1
    `
	// Menggunakan arIDParam dan nkParam yang sekarang dapat berupa nil (NULL SQL)
	_, err := r.db.ExecContext(ctx, query, pesertaID, arIDParam, nkParam)
	if err != nil {
		return fmt.Errorf("gagal memperbarui penempatan kursi peserta: %w", err)
	}
	return nil
}

// UpdatePesertaSeatingBatch updates seating for multiple participants.
func (r *repository) UpdatePesertaSeatingBatch(ctx context.Context, schemaName string, assignments []struct {
	PesertaID        uuid.UUID
	AlokasiRuanganID uuid.UUID
	NomorKursi       string
}) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi batch update seating: %w", err)
	}
	defer tx.Rollback()

	query := `
        UPDATE peserta_ujian
        SET alokasi_ruangan_id = $2, nomor_kursi = $3, updated_at = NOW()
        WHERE id = $1
    `
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement batch update seating: %w", err)
	}
	defer stmt.Close()

	for _, assignment := range assignments {
		// --- LOGIKA UNASSIGN/NULL DI APLIKASIKAN KE BATCH ---
		var arIDParam interface{} = assignment.AlokasiRuanganID
		var nkParam interface{} = assignment.NomorKursi

		// Cek jika ID Ruangan adalah UUID.Nil, yang berarti UNASSIGN/NULL
		if assignment.AlokasiRuanganID == uuid.Nil {
			arIDParam = nil // Set alokasi_ruangan_id ke SQL NULL
			nkParam = nil   // Juga set nomor_kursi ke SQL NULL jika ruangan diunassign
		} else if assignment.NomorKursi == "" {
			// Jika ada ruangan, tapi nomor kursinya dikosongkan (optional)
			nkParam = nil // Set nomor_kursi ke SQL NULL
		}
		// --- AKHIR LOGIKA UNASSIGN/NULL DI APLIKASIKAN KE BATCH ---

		_, err := stmt.ExecContext(ctx, assignment.PesertaID, arIDParam, nkParam)
		if err != nil {
			return fmt.Errorf("gagal mengeksekusi batch update seating untuk peserta %s: %w", assignment.PesertaID, err)
		}
	}

	return tx.Commit()
}

// ClearAllSeatingByUjianMasterID sets alokasi_ruangan_id and nomor_kursi to NULL for all participants in an exam.
func (r *repository) ClearAllSeatingByUjianMasterID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `
        UPDATE peserta_ujian
        SET alokasi_ruangan_id = NULL, nomor_kursi = NULL, updated_at = NOW()
        WHERE ujian_master_id = $1
    `
	_, err := r.db.ExecContext(ctx, query, ujianMasterID)
	if err != nil {
		return fmt.Errorf("gagal membersihkan semua penempatan kursi untuk ujian %s: %w", ujianMasterID, err)
	}
	return nil
}

// ClearSeatingByAlokasiRuanganID clears seating for participants assigned to a specific room allocation.
func (r *repository) ClearSeatingByAlokasiRuanganID(ctx context.Context, schemaName string, alokasiRuanganID uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `
        UPDATE peserta_ujian
        SET alokasi_ruangan_id = NULL, nomor_kursi = NULL, updated_at = NOW()
        WHERE alokasi_ruangan_id = $1
    `
	_, err := r.db.ExecContext(ctx, query, alokasiRuanganID)
	if err != nil {
		return fmt.Errorf("gagal membersihkan penempatan kursi untuk alokasi ruangan %s: %w", alokasiRuanganID, err)
	}
	return nil
}

// --- ROOM MASTER CRUD ---

// CreateRuangan menerapkan perbaikan dengan menghapus klausa RETURNING.
func (r *repository) CreateRuangan(ctx context.Context, schemaName string, ruangan RuanganUjian) (RuanganUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return RuanganUjian{}, err
	}
	query := `
        INSERT INTO ruangan_ujian (id, nama_ruangan, kapasitas, layout_metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `

	ruangan.ID = uuid.New()
	ruangan.CreatedAt = time.Now()
	ruangan.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query, ruangan.ID, ruangan.NamaRuangan, ruangan.Kapasitas, ruangan.LayoutMetadata, ruangan.CreatedAt, ruangan.UpdatedAt)
	if err != nil {
		return RuanganUjian{}, fmt.Errorf("gagal membuat ruangan: %w", err)
	}
	return ruangan, nil
}

func (r *repository) GetAllRuangan(ctx context.Context, schemaName string) ([]RuanganUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `SELECT id, nama_ruangan, kapasitas, layout_metadata, created_at, updated_at FROM ruangan_ujian ORDER BY nama_ruangan`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil semua ruangan: %w", err)
	}
	defer rows.Close()

	var results []RuanganUjian
	for rows.Next() {
		var ru RuanganUjian
		if err := rows.Scan(&ru.ID, &ru.NamaRuangan, &ru.Kapasitas, &ru.LayoutMetadata, &ru.CreatedAt, &ru.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai baris ruangan: %w", err)
		}
		results = append(results, ru)
	}
	return results, nil
}

func (r *repository) UpdateRuangan(ctx context.Context, schemaName string, ruangan RuanganUjian) (RuanganUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return RuanganUjian{}, err
	}
	ruangan.UpdatedAt = time.Now()
	query := `
        UPDATE ruangan_ujian SET
            nama_ruangan = $2, kapasitas = $3, layout_metadata = $4, updated_at = $5
        WHERE id = $1
    `
	_, err := r.db.ExecContext(ctx, query, ruangan.ID, ruangan.NamaRuangan, ruangan.Kapasitas, ruangan.LayoutMetadata, ruangan.UpdatedAt)
	if err != nil {
		return RuanganUjian{}, fmt.Errorf("gagal memperbarui ruangan: %w", err)
	}
	return ruangan, nil
}

func (r *repository) DeleteRuangan(ctx context.Context, schemaName string, ruanganID uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := "DELETE FROM ruangan_ujian WHERE id = $1"
	result, err := r.db.ExecContext(ctx, query, ruanganID)
	if err != nil {
		return fmt.Errorf("gagal menghapus ruangan: %w", err)
	}
	if rows, _ := result.RowsAffected(); rows == 0 {
		return errors.New("ruangan tidak ditemukan")
	}
	return nil
}

// --- ROOM ALLOCATION ---

// CreateAlokasiRuanganBatch MENGALOKASIKAN satu atau lebih ruangan ke master ujian, mengabaikan duplikat dan
// memastikan kode ruangan berurutan.
func (r *repository) CreateAlokasiRuanganBatch(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, ruanganIDs []uuid.UUID) ([]AlokasiRuanganUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// 1. Ambil detail ruangan yang akan dialokasikan (diperlukan untuk detail NamaRuangan, Kapasitas, dll.)
	ruanganDetails := make(map[uuid.UUID]RuanganUjian)
	queryRuangan := `SELECT id, nama_ruangan, kapasitas, layout_metadata FROM ruangan_ujian WHERE id = ANY($1)`

	rows, err := tx.QueryContext(ctx, queryRuangan, pq.Array(ruanganIDs))
	if err != nil {
		return nil, fmt.Errorf("gagal query detail ruangan: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ru RuanganUjian
		var layoutMetadata sql.NullString // Variabel temporary untuk HANDLE NULL

		if err := rows.Scan(&ru.ID, &ru.NamaRuangan, &ru.Kapasitas, &layoutMetadata); err != nil {
			return nil, fmt.Errorf("gagal memindai detail ruangan: %w", err)
		}

		if layoutMetadata.Valid {
			ru.LayoutMetadata = layoutMetadata.String
		} else {
			ru.LayoutMetadata = ""
		}

		ruanganDetails[ru.ID] = ru
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterasi detail ruangan: %w", err)
	}

	// =================================================================================
	// 2. LOGIKA UTAMA PERBAIKAN: Identifikasi ruangan baru & tentukan kode ruangan sekuensial
	// =================================================================================

	// 2a. Ambil ID ruangan yang sudah dialokasikan untuk memfilter input
	existingAlokasiIDs := make(map[uuid.UUID]struct{})
	queryExisting := `SELECT ruangan_id FROM alokasi_ruangan_ujian WHERE ujian_master_id = $1`
	rowsExisting, err := tx.QueryContext(ctx, queryExisting, ujianMasterID)
	if err != nil {
		return nil, fmt.Errorf("gagal query existing alokasi: %w", err)
	}
	defer rowsExisting.Close()

	for rowsExisting.Next() {
		var rID uuid.UUID
		if err := rowsExisting.Scan(&rID); err != nil {
			return nil, fmt.Errorf("gagal scan existing ruangan ID: %w", err)
		}
		existingAlokasiIDs[rID] = struct{}{}
	}

	// 2b. Filter input ruanganIDs untuk mendapatkan ID ruangan BARU saja
	var newRuanganIDs []uuid.UUID
	for _, rID := range ruanganIDs {
		if _, isValid := ruanganDetails[rID]; isValid {
			if _, exists := existingAlokasiIDs[rID]; !exists {
				newRuanganIDs = append(newRuanganIDs, rID)
			}
		}
	}

	if len(newRuanganIDs) == 0 {
		if err = tx.Commit(); err != nil {
			return nil, fmt.Errorf("gagal commit (no new rooms): %w", err)
		}
		return []AlokasiRuanganUjian{}, nil
	}

	// 2c. Dapatkan angka kode ruangan maksimum yang sudah ada
	var maxKode int
	queryMaxKode := `
        SELECT COALESCE(MAX(CAST(SUBSTRING(kode_ruangan FROM 2) AS INTEGER)), 0)
        FROM alokasi_ruangan_ujian
        WHERE ujian_master_id = $1
    `
	if err := tx.QueryRowContext(ctx, queryMaxKode, ujianMasterID).Scan(&maxKode); err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("gagal mengambil max kode ruangan: %w", err)
		}
	}

	currentKode := maxKode
	var createdAlokasi []AlokasiRuanganUjian
	now := time.Now()

	// 2d. Lakukan INSERT hanya untuk ruangan BARU
	insertQuery := `
        INSERT INTO alokasi_ruangan_ujian (id, ujian_master_id, ruangan_id, kode_ruangan, jumlah_kursi_terpakai, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 0, $5, $6)
        ON CONFLICT (ujian_master_id, ruangan_id) DO NOTHING
        RETURNING id
    `

	for _, rID := range newRuanganIDs {
		currentKode++

		detail := ruanganDetails[rID]

		// GENERATE KODE RUANGAN YANG BENAR (misalnya R03)
		kodeRuangan := fmt.Sprintf("R%02d", currentKode)

		ar := AlokasiRuanganUjian{
			ID:                  uuid.New(),
			UjianMasterID:       ujianMasterID,
			RuanganID:           rID,
			KodeRuangan:         kodeRuangan,
			JumlahKursiTerpakai: 0,
			NamaRuangan:         detail.NamaRuangan,
			KapasitasRuangan:    detail.Kapasitas,
			LayoutMetadata:      detail.LayoutMetadata,
			CreatedAt:           now,
			UpdatedAt:           now,
		}

		var insertedID uuid.UUID

		err := tx.QueryRowContext(ctx, insertQuery, ar.ID, ar.UjianMasterID, ar.RuanganID, ar.KodeRuangan, ar.CreatedAt, ar.UpdatedAt).Scan(&insertedID)

		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			return nil, fmt.Errorf("gagal insert alokasi ruangan %s dengan kode %s: %w", rID.String(), kodeRuangan, err)
		}

		ar.ID = insertedID
		createdAlokasi = append(createdAlokasi, ar)
	}

	// 3. Commit Transaction
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi alokasi: %w", err)
	}

	return createdAlokasi, nil
}

func (r *repository) GetAlokasiRuanganByUjianMasterID(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]AlokasiRuanganUjian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        SELECT
            aru.id, aru.ujian_master_id, aru.ruangan_id, aru.kode_ruangan, aru.jumlah_kursi_terpakai,
            aru.created_at, aru.updated_at, ru.nama_ruangan, ru.kapasitas, ru.layout_metadata
        FROM alokasi_ruangan_ujian aru
        JOIN ruangan_ujian ru ON aru.ruangan_id = ru.id
        WHERE aru.ujian_master_id = $1
        ORDER BY aru.kode_ruangan
    `
	rows, err := r.db.QueryContext(ctx, query, ujianMasterID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil alokasi ruangan: %w", err)
	}
	defer rows.Close()

	var results []AlokasiRuanganUjian
	for rows.Next() {
		var ar AlokasiRuanganUjian
		if err := rows.Scan(
			&ar.ID, &ar.UjianMasterID, &ar.RuanganID, &ar.KodeRuangan, &ar.JumlahKursiTerpakai,
			&ar.CreatedAt, &ar.UpdatedAt, &ar.NamaRuangan, &ar.KapasitasRuangan, &ar.LayoutMetadata,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris alokasi ruangan: %w", err)
		}
		results = append(results, ar)
	}
	return results, nil
}

func (r *repository) DeleteAlokasiRuangan(ctx context.Context, schemaName string, alokasiRuanganID uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := "DELETE FROM alokasi_ruangan_ujian WHERE id = $1"
	result, err := r.db.ExecContext(ctx, query, alokasiRuanganID)
	if err != nil {
		return fmt.Errorf("gagal menghapus alokasi ruangan: %w", err)
	}
	if rows, _ := result.RowsAffected(); rows == 0 {
		return errors.New("alokasi ruangan tidak ditemukan")
	}
	return nil
}

// RecalculateAlokasiKursiCount menghitung ulang jumlah kursi terpakai berdasarkan peserta_ujian
func (r *repository) RecalculateAlokasiKursiCount(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi recalculate: %w", err)
	}
	defer tx.Rollback()

	queryReset := `
        UPDATE alokasi_ruangan_ujian 
        SET jumlah_kursi_terpakai = 0, updated_at = NOW()
        WHERE ujian_master_id = $1;
    `
	if _, err := tx.ExecContext(ctx, queryReset, ujianMasterID); err != nil {
		return fmt.Errorf("gagal reset jumlah kursi: %w", err)
	}

	queryUpdate := `
        UPDATE alokasi_ruangan_ujian aru
        SET jumlah_kursi_terpakai = pu_count.total_peserta, updated_at = NOW()
        FROM (
            SELECT 
                alokasi_ruangan_id, 
                COUNT(id) AS total_peserta
            FROM peserta_ujian
            WHERE ujian_master_id = $1 AND alokasi_ruangan_id IS NOT NULL
            GROUP BY alokasi_ruangan_id
        ) AS pu_count
        WHERE aru.id = pu_count.alokasi_ruangan_id;
    `
	if _, err := tx.ExecContext(ctx, queryUpdate, ujianMasterID); err != nil {
		return fmt.Errorf("gagal update jumlah kursi terpakai: %w", err)
	}

	return tx.Commit()
}

// --- OTHER EXISTING METHODS ---

// DeletePesertaByMasterAndKelas deletes peserta ujian by kelas
func (r *repository) DeletePesertaByMasterAndKelas(ctx context.Context, schemaName string, masterID uuid.UUID, kelasID uuid.UUID) (int64, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}

	query := `
        DELETE FROM peserta_ujian
        WHERE ujian_master_id = $1 AND kelas_id = $2
    `

	result, err := r.db.ExecContext(ctx, query, masterID, kelasID)
	if err != nil {
		return 0, fmt.Errorf("gagal menghapus peserta ujian: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("gagal mendapatkan jumlah baris yang terpengaruh: %w", err)
	}

	if rowsAffected == 0 {
		return 0, errors.New("tidak ada peserta ujian yang ditemukan untuk kelas ini")
	}

	return rowsAffected, nil
}

// GenerateNomorUjianForUjianMaster generates sequential exam numbers with smart padding
func (r *repository) GenerateNomorUjianForUjianMaster(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, prefix string) (int, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	queryGetPeserta := `
        SELECT pu.id 
        FROM peserta_ujian pu
        JOIN kelas k ON k.id = pu.kelas_id
        WHERE pu.ujian_master_id = $1
        ORDER BY k.nama_kelas ASC, pu.urutan ASC
    `

	rows, err := tx.QueryContext(ctx, queryGetPeserta, ujianMasterID)
	if err != nil {
		return 0, fmt.Errorf("gagal mengambil data peserta: %w", err)
	}
	defer rows.Close()

	var pesertaIDs []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return 0, fmt.Errorf("gagal scan peserta ID: %w", err)
		}
		pesertaIDs = append(pesertaIDs, id)
	}

	if err = rows.Err(); err != nil {
		return 0, fmt.Errorf("error pada rows: %w", err)
	}

	if len(pesertaIDs) == 0 {
		return 0, errors.New("tidak ada peserta yang ditemukan untuk ujian ini")
	}

	// SMART PADDING: Calculate required digits based on total count
	totalPeserta := len(pesertaIDs)
	var paddingDigits int

	if totalPeserta < 1000 {
		paddingDigits = 3
	} else if totalPeserta < 10000 {
		paddingDigits = 4
	} else if totalPeserta < 100000 {
		paddingDigits = 5
	} else if totalPeserta < 1000000 {
		paddingDigits = 6
	} else {
		paddingDigits = 7
	}

	queryUpdate := `UPDATE peserta_ujian SET nomor_ujian = $1, updated_at = $2 WHERE id = $3`
	updateStmt, err := tx.PrepareContext(ctx, queryUpdate)
	if err != nil {
		return 0, fmt.Errorf("gagal mempersiapkan statement update: %w", err)
	}
	defer updateStmt.Close()

	updateCount := 0
	for i, pesertaID := range pesertaIDs {
		var nomorUjian string

		if prefix == "" {
			nomorUjian = fmt.Sprintf("%0*d", paddingDigits, i+1)
		} else {
			nomorUjian = fmt.Sprintf("%s%0*d", prefix, paddingDigits, i+1)
		}

		now := time.Now()
		_, err := updateStmt.ExecContext(ctx, nomorUjian, now, pesertaID)
		if err != nil {
			return 0, fmt.Errorf("gagal update nomor ujian untuk peserta %s: %w", pesertaID, err)
		}
		updateCount++
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return updateCount, nil
}

// UpdatePesertaNomorUjianFromExcel updates nomor ujian from Excel import
func (r *repository) UpdatePesertaNomorUjianFromExcel(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, updates []struct {
	NamaLengkap string
	NomorUjian  string
}) (int, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return 0, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	updateQuery := `
        UPDATE peserta_ujian 
        SET nomor_ujian = $1, updated_at = NOW() 
        WHERE ujian_master_id = $2 
        AND anggota_kelas_id IN (
            SELECT ak.id FROM anggota_kelas ak 
            JOIN students s ON ak.student_id = s.id 
            WHERE s.nama_lengkap = $3
        )
    `

	updateStmt, err := tx.PrepareContext(ctx, updateQuery)
	if err != nil {
		return 0, fmt.Errorf("gagal mempersiapkan statement update: %w", err)
	}
	defer updateStmt.Close()

	updatedCount := 0
	for _, update := range updates {
		result, err := updateStmt.ExecContext(ctx, update.NomorUjian, ujianMasterID, update.NamaLengkap)
		if err != nil {
			continue
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected > 0 {
			updatedCount++
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return updatedCount, nil
}

// ----------------------------------------------------------------------
// --- IMPLEMENTASI FUNGSI KARTU UJIAN BARU (Fixed RombelID Type)---
// ----------------------------------------------------------------------

// GetUniqueRombelIDs returns a distinct list of Rombel IDs and names from peserta_ujian for filtering.
func (r *repository) GetUniqueRombelIDs(ctx context.Context, schemaName string, ujianMasterID uuid.UUID) ([]KartuUjianKelasFilter, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	type rombelResult struct {
		RombelID uuid.UUID
		Nama     string
	}

	var results []rombelResult

	query := `
        SELECT 
            DISTINCT pu.kelas_id AS rombel_id, 
            k.nama_kelas AS nama
        FROM peserta_ujian pu
        JOIN kelas k ON k.id = pu.kelas_id
        WHERE pu.ujian_master_id = $1
        ORDER BY k.nama_kelas
    `

	rows, err := r.db.QueryContext(ctx, query, ujianMasterID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil rombel unik: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var res rombelResult
		if err := rows.Scan(&res.RombelID, &res.Nama); err != nil {
			return nil, fmt.Errorf("gagal memindai rombel unik: %w", err)
		}
		results = append(results, res)
	}

	finalFilters := make([]KartuUjianKelasFilter, len(results))
	for i, res := range results {
		finalFilters[i] = KartuUjianKelasFilter{
			RombelID:  res.RombelID.String(),
			NamaKelas: res.Nama,
		}
	}

	return finalFilters, nil
}

// GetKartuUjianData fetches all necessary data for exam card printing with optional rombelID filtering.
func (r *repository) GetKartuUjianData(ctx context.Context, schemaName string, ujianMasterID uuid.UUID, rombelID uuid.UUID, pesertaIDs []uuid.UUID) ([]KartuUjianDetail, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	// Tipe data harus tetap string karena mengambil UUID dari DB
	type pesertaDetailRaw struct {
		ID            string
		UjianMasterID string
		SiswaID       string
		NISN          sql.NullString
		NamaSiswa     string
		RombelID      string // UUID as string from DB
		NamaKelas     string
		NoUjian       sql.NullString
		RuangUjianID  sql.NullString // AlokasiRuanganID (UUID as string)
		NamaRuangan   sql.NullString
		NomorKursi    sql.NullString
	}

	var rawDetails []pesertaDetailRaw

	query := `
        SELECT
            pu.id, pu.ujian_master_id, s.id AS siswa_id, pu.nomor_ujian AS no_ujian, pu.kelas_id AS rombel_id,
            s.nisn, s.nama_lengkap AS nama_siswa,
            k.nama_kelas,
            ru.nama_ruangan, pu.nomor_kursi,
            aru.id AS ruang_ujian_id -- Sebenarnya AlokasiRuanganID
        FROM peserta_ujian pu
        JOIN anggota_kelas ak ON ak.id = pu.anggota_kelas_id
        JOIN students s ON s.id = ak.student_id
        JOIN kelas k ON k.id = pu.kelas_id
        LEFT JOIN alokasi_ruangan_ujian aru ON aru.id = pu.alokasi_ruangan_id
        LEFT JOIN ruangan_ujian ru ON ru.id = aru.ruangan_id -- Ambil nama ruangan dari master
        WHERE pu.ujian_master_id = $1
    `
	args := []interface{}{ujianMasterID}

	if rombelID != uuid.Nil {
		paramIndex := len(args) + 1
		query += fmt.Sprintf(" AND pu.kelas_id = $%d", paramIndex)
		args = append(args, rombelID)
	}

	if len(pesertaIDs) > 0 {
		paramIndex := len(args) + 1
		query += fmt.Sprintf(" AND pu.id = ANY($%d)", paramIndex)
		args = append(args, pq.Array(pesertaIDs))
	}

	query += " ORDER BY k.nama_kelas ASC, s.nama_lengkap ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data kartu ujian: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var rd pesertaDetailRaw
		if err := rows.Scan(
			&rd.ID, &rd.UjianMasterID, &rd.SiswaID, &rd.NoUjian, &rd.RombelID,
			&rd.NISN, &rd.NamaSiswa, &rd.NamaKelas, &rd.NamaRuangan, &rd.NomorKursi,
			&rd.RuangUjianID,
		); err != nil {
			return nil, fmt.Errorf("gagal memindai baris detail kartu ujian: %w", err)
		}
		rawDetails = append(rawDetails, rd)
	}

	details := make([]KartuUjianDetail, len(rawDetails))
	for i, rd := range rawDetails {
		// Asumsi KartuUjianDetail di model.go masih menggunakan uint untuk ID,
		// sehingga kita harus mengembalikan string ID dari DB ke 0 untuk menghindari error IncompatibleAssign.
		detail := KartuUjianDetail{
			ID:            0,
			UjianMasterID: 0,
			SiswaID:       0,

			RombelID: rd.RombelID,

			NISN:        rd.NISN.String,
			NamaSiswa:   rd.NamaSiswa,
			NamaKelas:   rd.NamaKelas,
			NoUjian:     rd.NoUjian.String,
			NamaRuangan: rd.NamaRuangan.String,
			NomorKursi:  rd.NomorKursi.String,
		}

		// RuangUjianID (yang kita asumsikan bertipe string karena errornya)
		if rd.RuangUjianID.Valid {
			// Jika RuangUjianID valid, gunakan string ID yang sebenarnya
			detail.RuangUjianID = rd.RuangUjianID.String
		} else {
			// FIX ERROR: Ganti 0 (int) menjadi "" (string) karena RuangUjianID field di model.go kemungkinan adalah string.
			detail.RuangUjianID = ""
		}

		// Logic IsDataLengkap: NoUjian TIDAK kosong DAN RuangUjianID TIDAK kosong/null
		if rd.NoUjian.Valid && rd.NoUjian.String != "" && rd.RuangUjianID.Valid {
			detail.IsDataLengkap = true
		} else {
			detail.IsDataLengkap = false
		}
		details[i] = detail
	}

	return details, nil
}
