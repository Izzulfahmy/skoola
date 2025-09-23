// file: backend/internal/student/repository.go
package student

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database siswa.
type Repository interface {
	Create(ctx context.Context, tx *sql.Tx, schemaName string, student *Student) error
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)
	Update(ctx context.Context, schemaName string, student *Student) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetAvailableStudentsByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Student, error) // <-- TAMBAHKAN INI
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// Kolom yang akan di-select (untuk konsistensi)
const studentColumns = `
	s.id, s.created_at, s.updated_at,
	s.nis, s.nisn, s.nomor_ujian_sekolah,
	s.nama_lengkap, s.nama_panggilan, s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.agama, s.kewarganegaraan,
	s.alamat_lengkap, s.desa_kelurahan, s.kecamatan, s.kota_kabupaten, s.provinsi, s.kode_pos,
	s.nama_ayah, s.nama_ibu, s.nama_wali, s.nomor_kontak_wali
`

// Query untuk mengambil detail siswa beserta status dan info kelasnya
const studentDetailQuery = `
	WITH LatestStatus AS (
		SELECT
			student_id,
			status,
			ROW_NUMBER() OVER(PARTITION BY student_id ORDER BY tanggal_kejadian DESC, created_at DESC) as rn
		FROM riwayat_akademik
	),
	CurrentKelas AS (
		SELECT
			ak.student_id,
			k.id as kelas_id,
			k.nama_kelas
		FROM anggota_kelas ak
		JOIN kelas k ON ak.kelas_id = k.id
		JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
		WHERE ta.status = 'Aktif' -- Bisa disesuaikan jika perlu
	)
	SELECT ` + studentColumns + `, 
		ls.status AS status_saat_ini,
		ck.kelas_id,
		ck.nama_kelas
	FROM students s
	LEFT JOIN LatestStatus ls ON s.id = ls.student_id AND ls.rn = 1
	LEFT JOIN CurrentKelas ck ON s.id = ck.student_id
`

func scanStudentDetail(row interface{ Scan(...interface{}) error }) (*Student, error) {
	var s Student
	err := row.Scan(
		&s.ID, &s.CreatedAt, &s.UpdatedAt,
		&s.NIS, &s.NISN, &s.NomorUjianSekolah,
		&s.NamaLengkap, &s.NamaPanggilan, &s.JenisKelamin, &s.TempatLahir, &s.TanggalLahir, &s.Agama, &s.Kewarganegaraan,
		&s.AlamatLengkap, &s.DesaKelurahan, &s.Kecamatan, &s.KotaKabupaten, &s.Provinsi, &s.KodePos,
		&s.NamaAyah, &s.NamaIbu, &s.NamaWali, &s.NomorKontakWali,
		&s.StatusSaatIni,
		&s.KelasID, &s.NamaKelas, // <-- TAMBAHKAN INI
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data detail siswa: %w", err)
	}
	return &s, nil
}

// --- FUNGSI BARU ---
func (r *postgresRepository) GetAvailableStudentsByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Student, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT s.id, s.nama_lengkap, s.nis, s.nama_panggilan
		FROM students s
		-- Subquery untuk mendapatkan status terakhir siswa
		JOIN (
			SELECT student_id, status
			FROM (
				SELECT student_id, status, ROW_NUMBER() OVER(PARTITION BY student_id ORDER BY tanggal_kejadian DESC, created_at DESC) as rn
				FROM riwayat_akademik
			) ls
			WHERE ls.rn = 1
		) AS latest_status ON s.id = latest_status.student_id
		-- Pastikan siswa tidak ada di rombel manapun pada TAHUN AJARAN YANG SEDANG DIPILIH
		WHERE 
			latest_status.status = 'Aktif' AND
			s.id NOT IN (
				SELECT ak.student_id
				FROM anggota_kelas ak
				JOIN kelas k ON ak.kelas_id = k.id
				WHERE k.tahun_ajaran_id = $1
			)
		ORDER BY s.nama_lengkap ASC;
	`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal query get available students: %w", err)
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var s Student
		// Hanya scan kolom yang dibutuhkan untuk Transfer list
		if err := rows.Scan(&s.ID, &s.NamaLengkap, &s.NIS, &s.NamaPanggilan); err != nil {
			return nil, fmt.Errorf("gagal memindai data available student: %w", err)
		}
		students = append(students, s)
	}
	return students, rows.Err()
}

// Create sekarang menerima Querier (bisa DB atau TX)
func (r *postgresRepository) Create(ctx context.Context, tx *sql.Tx, schemaName string, student *Student) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
        INSERT INTO students (
			id, nis, nisn, nomor_ujian_sekolah, nama_lengkap, nama_panggilan,
			jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan,
			alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos,
			nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali
		)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    `

	_, err := tx.ExecContext(ctx, query,
		student.ID, student.NIS, student.NISN, student.NomorUjianSekolah, student.NamaLengkap, student.NamaPanggilan,
		student.JenisKelamin, student.TempatLahir, student.TanggalLahir, student.Agama, student.Kewarganegaraan,
		student.AlamatLengkap, student.DesaKelurahan, student.Kecamatan, student.KotaKabupaten, student.Provinsi, student.KodePos,
		student.NamaAyah, student.NamaIbu, student.NamaWali, student.NomorKontakWali,
	)
	if err != nil {
		return fmt.Errorf("gagal memasukkan data siswa: %w", err)
	}
	return nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Student, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := studentDetailQuery + " ORDER BY s.nama_lengkap ASC"
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all students: %w", err)
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		s, err := scanStudentDetail(rows)
		if err != nil {
			return nil, err
		}
		students = append(students, *s)
	}
	return students, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*Student, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := studentDetailQuery + " WHERE s.id = $1"
	row := r.db.QueryRowContext(ctx, query, id)
	return scanStudentDetail(row)
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, student *Student) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		UPDATE students SET
			updated_at = NOW(),
			nis = $1, nisn = $2, nomor_ujian_sekolah = $3,
			nama_lengkap = $4, nama_panggilan = $5, jenis_kelamin = $6, tempat_lahir = $7, tanggal_lahir = $8, agama = $9, kewarganegaraan = $10,
			alamat_lengkap = $11, desa_kelurahan = $12, kecamatan = $13, kota_kabupaten = $14, provinsi = $15, kode_pos = $16,
			nama_ayah = $17, nama_ibu = $18, nama_wali = $19, nomor_kontak_wali = $20
		WHERE id = $21
	`
	result, err := r.db.ExecContext(ctx, query,
		student.NIS, student.NISN, student.NomorUjianSekolah,
		student.NamaLengkap, student.NamaPanggilan, student.JenisKelamin, student.TempatLahir, student.TanggalLahir, student.Agama, student.Kewarganegaraan,
		student.AlamatLengkap, student.DesaKelurahan, student.Kecamatan, student.KotaKabupaten, student.Provinsi, student.KodePos,
		student.NamaAyah, student.NamaIbu, student.NamaWali, student.NomorKontakWali,
		student.ID,
	)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update student: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM students WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete student: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
