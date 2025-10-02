// file: backend/internal/rombel/repository.go
package rombel

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// Repository mendefinisikan interface untuk interaksi database rombel.
type Repository interface {
	// --- Kelas (Rombel) ---
	CreateKelas(ctx context.Context, schemaName string, kelas *Kelas) (*Kelas, error)
	UpdateKelas(ctx context.Context, schemaName string, kelas *Kelas) (*Kelas, error)
	DeleteKelas(ctx context.Context, schemaName string, kelasID string) error
	GetKelasByID(ctx context.Context, schemaName string, kelasID string) (*Kelas, error)
	GetAllKelasByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kelas, error)

	// --- Anggota Kelas (Siswa) ---
	AddAnggotaKelas(ctx context.Context, schemaName string, kelasID string, studentIDs []string) error
	RemoveAnggotaKelas(ctx context.Context, schemaName string, anggotaID string) error
	GetAllAnggotaByKelas(ctx context.Context, schemaName string, kelasID string) ([]AnggotaKelas, error)
	UpdateAnggotaKelasUrutan(ctx context.Context, schemaName string, orderedIDs []string) error

	// --- Pengajar Kelas (Guru) ---
	CreatePengajarKelas(ctx context.Context, schemaName string, pengajar *PengajarKelas) (*PengajarKelas, error)
	RemovePengajarKelas(ctx context.Context, schemaName string, pengajarID string) error
	GetAllPengajarByKelas(ctx context.Context, schemaName string, kelasID string) ([]PengajarKelas, error)
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// setSchema mengatur search_path untuk tenant yang benar.
func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	if err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	return nil
}

// --- Implementasi Kelas (Rombel) ---

func (r *postgresRepository) CreateKelas(ctx context.Context, schemaName string, k *Kelas) (*Kelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        INSERT INTO kelas (id, nama_kelas, tahun_ajaran_id, tingkatan_id, wali_kelas_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at, updated_at
    `
	err := r.db.QueryRowContext(ctx, query, k.ID, k.NamaKelas, k.TahunAjaranID, k.TingkatanID, k.WaliKelasID).Scan(&k.ID, &k.CreatedAt, &k.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat kelas: %w", err)
	}
	return k, nil
}

func (r *postgresRepository) UpdateKelas(ctx context.Context, schemaName string, k *Kelas) (*Kelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        UPDATE kelas SET
            nama_kelas = $1,
            tingkatan_id = $2,
            wali_kelas_id = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING updated_at
    `
	err := r.db.QueryRowContext(ctx, query, k.NamaKelas, k.TingkatanID, k.WaliKelasID, k.ID).Scan(&k.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("gagal memperbarui kelas: %w", err)
	}
	return k, nil
}

func (r *postgresRepository) DeleteKelas(ctx context.Context, schemaName string, kelasID string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM kelas WHERE id = $1", kelasID)
	return err
}

func (r *postgresRepository) GetKelasByID(ctx context.Context, schemaName string, kelasID string) (*Kelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	// TOTAL 15 KOLOM
	query := `
        SELECT
            k.id, k.nama_kelas, k.tahun_ajaran_id, k.tingkatan_id, k.wali_kelas_id,
            k.created_at, k.updated_at,
            t.nama_tingkatan,
            t.jenjang_id, -- Kolom ke-9
            j.nama_jenjang, -- Kolom ke-10
            guru.nama_lengkap as nama_wali_kelas,
            ta.nama_tahun_ajaran,
            ta.semester,
            (SELECT COUNT(*) FROM anggota_kelas ak WHERE ak.kelas_id = k.id) as jumlah_siswa,
            (SELECT COUNT(*) FROM pengajar_kelas pk WHERE pk.kelas_id = k.id) as jumlah_pengajar
        FROM kelas k
        LEFT JOIN tingkatan t ON k.tingkatan_id = t.id
        LEFT JOIN jenjang_pendidikan j ON t.jenjang_id = j.id
        LEFT JOIN teachers guru ON k.wali_kelas_id = guru.id
        LEFT JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
        WHERE k.id = $1
    `
	row := r.db.QueryRowContext(ctx, query, kelasID)
	var k Kelas
	// PASTIKAN JUMLAH SCAN SAMA DENGAN 15 VARIABEL
	err := row.Scan(
		&k.ID, &k.NamaKelas, &k.TahunAjaranID, &k.TingkatanID, &k.WaliKelasID,
		&k.CreatedAt, &k.UpdatedAt,
		&k.NamaTingkatan,
		&k.JenjangID,
		&k.NamaJenjang,
		&k.NamaWaliKelas,
		&k.NamaTahunAjaran, &k.Semester,
		&k.JumlahSiswa,
		&k.JumlahPengajar,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &k, nil
}

func (r *postgresRepository) GetAllKelasByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	// TOTAL 15 KOLOM
	query := `
        SELECT
            k.id, k.nama_kelas, k.tahun_ajaran_id, k.tingkatan_id, k.wali_kelas_id,
            k.created_at, k.updated_at,
            t.nama_tingkatan,
            t.jenjang_id, -- Kolom ke-9
            j.nama_jenjang, -- Kolom ke-10
            guru.nama_lengkap as nama_wali_kelas,
            ta.nama_tahun_ajaran,
            ta.semester,
            (SELECT COUNT(*) FROM anggota_kelas ak WHERE ak.kelas_id = k.id) as jumlah_siswa,
            (SELECT COUNT(*) FROM pengajar_kelas pk WHERE pk.kelas_id = k.id) as jumlah_pengajar
        FROM kelas k
        LEFT JOIN tingkatan t ON k.tingkatan_id = t.id
        LEFT JOIN jenjang_pendidikan j ON t.jenjang_id = j.id
        LEFT JOIN teachers guru ON k.wali_kelas_id = guru.id
        LEFT JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
        WHERE k.tahun_ajaran_id = $1
        ORDER BY t.urutan, k.nama_kelas
    `
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Kelas
	for rows.Next() {
		var k Kelas
		// PASTIKAN JUMLAH SCAN SAMA DENGAN 15 VARIABEL
		err := rows.Scan(
			&k.ID, &k.NamaKelas, &k.TahunAjaranID, &k.TingkatanID, &k.WaliKelasID,
			&k.CreatedAt, &k.UpdatedAt,
			&k.NamaTingkatan,
			&k.JenjangID,
			&k.NamaJenjang,
			&k.NamaWaliKelas,
			&k.NamaTahunAjaran, &k.Semester,
			&k.JumlahSiswa,
			&k.JumlahPengajar,
		)
		if err != nil {
			// Ini akan mencetak error internal SQL jika terjadi mismatch kolom
			return nil, fmt.Errorf("gagal scan baris kelas: %w", err)
		}
		list = append(list, k)
	}
	return list, nil
}

// --- Implementasi Anggota Kelas ---

func (r *postgresRepository) AddAnggotaKelas(ctx context.Context, schemaName string, kelasID string, studentIDs []string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var maxUrutan sql.NullInt64
	err = tx.QueryRowContext(ctx, "SELECT MAX(urutan) FROM anggota_kelas WHERE kelas_id = $1", kelasID).Scan(&maxUrutan)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("gagal mendapatkan urutan maksimal: %w", err)
	}

	currentUrutan := 0
	if maxUrutan.Valid {
		currentUrutan = int(maxUrutan.Int64)
	}

	stmt, err := tx.PrepareContext(ctx, "INSERT INTO anggota_kelas (id, kelas_id, student_id, urutan) VALUES ($1, $2, $3, $4)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, studentID := range studentIDs {
		currentUrutan++
		_, err := stmt.ExecContext(ctx, uuid.New().String(), kelasID, studentID, currentUrutan)
		if err != nil {
			return fmt.Errorf("gagal menambahkan siswa dengan ID %s: %w", studentID, err)
		}
	}

	return tx.Commit()
}

func (r *postgresRepository) RemoveAnggotaKelas(ctx context.Context, schemaName string, anggotaID string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM anggota_kelas WHERE id = $1", anggotaID)
	return err
}

func (r *postgresRepository) GetAllAnggotaByKelas(ctx context.Context, schemaName string, kelasID string) ([]AnggotaKelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        SELECT ak.id, ak.student_id, ak.urutan, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin
        FROM anggota_kelas ak
        JOIN students s ON ak.student_id = s.id
        WHERE ak.kelas_id = $1
        ORDER BY ak.urutan ASC, s.nama_lengkap ASC
    `
	rows, err := r.db.QueryContext(ctx, query, kelasID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AnggotaKelas
	for rows.Next() {
		var a AnggotaKelas
		err := rows.Scan(&a.ID, &a.StudentID, &a.Urutan, &a.NIS, &a.NISN, &a.NamaLengkap, &a.JenisKelamin)
		if err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, nil
}

func (r *postgresRepository) UpdateAnggotaKelasUrutan(ctx context.Context, schemaName string, orderedIDs []string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	query := `
        UPDATE anggota_kelas AS ak
        SET urutan = new_order.new_urutan
        FROM (
            SELECT id, ordinality AS new_urutan
            FROM unnest($1::uuid[]) WITH ORDINALITY AS t(id, ordinality)
        ) AS new_order
        WHERE ak.id = new_order.id;
    `
	_, err = tx.ExecContext(ctx, query, pq.Array(orderedIDs))
	if err != nil {
		return fmt.Errorf("gagal update urutan anggota kelas: %w", err)
	}

	return tx.Commit()
}

// --- Implementasi Pengajar Kelas ---

func (r *postgresRepository) CreatePengajarKelas(ctx context.Context, schemaName string, p *PengajarKelas) (*PengajarKelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        INSERT INTO pengajar_kelas (id, kelas_id, teacher_id, mata_pelajaran_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
    `
	err := r.db.QueryRowContext(ctx, query, uuid.New().String(), p.KelasID, p.TeacherID, p.MataPelajaranID).Scan(&p.ID, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat pengajar kelas: %w", err)
	}
	return p, nil
}

func (r *postgresRepository) RemovePengajarKelas(ctx context.Context, schemaName string, pengajarID string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM pengajar_kelas WHERE id = $1", pengajarID)
	return err
}

func (r *postgresRepository) GetAllPengajarByKelas(ctx context.Context, schemaName string, kelasID string) ([]PengajarKelas, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
        SELECT pk.id, pk.teacher_id, pk.mata_pelajaran_id, t.nama_lengkap, mp.nama_mapel, mp.kode_mapel
        FROM pengajar_kelas pk
        JOIN teachers t ON pk.teacher_id = t.id
        JOIN mata_pelajaran mp ON pk.mata_pelajaran_id = mp.id
        WHERE pk.kelas_id = $1
        ORDER BY mp.nama_mapel ASC
    `
	rows, err := r.db.QueryContext(ctx, query, kelasID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []PengajarKelas
	for rows.Next() {
		var p PengajarKelas
		err := rows.Scan(&p.ID, &p.TeacherID, &p.MataPelajaranID, &p.NamaGuru, &p.NamaMapel, &p.KodeMapel)
		if err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}
