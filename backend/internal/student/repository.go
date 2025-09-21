// file: backend/internal/student/repository.go
package student

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database siswa.
type Repository interface {
	Create(ctx context.Context, schemaName string, student *Student) error
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)
	Update(ctx context.Context, schemaName string, student *Student) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// --- Helper untuk scan kolom ---
func scanStudent(row interface{ Scan(...interface{}) error }) (*Student, error) {
	var s Student
	err := row.Scan(
		&s.ID, &s.CreatedAt, &s.UpdatedAt,
		&s.NIS, &s.NISN, &s.NomorUjianSekolah, &s.StatusSiswa,
		&s.NamaLengkap, &s.NamaPanggilan, &s.JenisKelamin, &s.TempatLahir, &s.TanggalLahir, &s.Agama, &s.Kewarganegaraan,
		&s.AlamatLengkap, &s.DesaKelurahan, &s.Kecamatan, &s.KotaKabupaten, &s.Provinsi, &s.KodePos,
		&s.NamaAyah, &s.NamaIbu, &s.NamaWali, &s.NomorKontakWali,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan
		}
		return nil, fmt.Errorf("gagal memindai data siswa: %w", err)
	}
	return &s, nil
}

// Kolom yang akan di-select (untuk konsistensi)
const studentColumns = `
	id, created_at, updated_at,
	nis, nisn, nomor_ujian_sekolah, status_siswa,
	nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan,
	alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos,
	nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali
`

func (r *postgresRepository) Create(ctx context.Context, schemaName string, student *Student) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := fmt.Sprintf(`
        INSERT INTO students (%s)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    `, studentColumns)

	_, err := r.db.ExecContext(ctx, query,
		student.ID, student.CreatedAt, student.UpdatedAt,
		student.NIS, student.NISN, student.NomorUjianSekolah, student.StatusSiswa,
		student.NamaLengkap, student.NamaPanggilan, student.JenisKelamin, student.TempatLahir, student.TanggalLahir, student.Agama, student.Kewarganegaraan,
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

	query := fmt.Sprintf("SELECT %s FROM students ORDER BY nama_lengkap ASC", studentColumns)
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all students: %w", err)
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		s, err := scanStudent(rows)
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

	query := fmt.Sprintf("SELECT %s FROM students WHERE id = $1", studentColumns)
	row := r.db.QueryRowContext(ctx, query, id)
	return scanStudent(row)
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, student *Student) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		UPDATE students SET
			updated_at = NOW(),
			nis = $1, nisn = $2, nomor_ujian_sekolah = $3, status_siswa = $4,
			nama_lengkap = $5, nama_panggilan = $6, jenis_kelamin = $7, tempat_lahir = $8, tanggal_lahir = $9, agama = $10, kewarganegaraan = $11,
			alamat_lengkap = $12, desa_kelurahan = $13, kecamatan = $14, kota_kabupaten = $15, provinsi = $16, kode_pos = $17,
			nama_ayah = $18, nama_ibu = $19, nama_wali = $20, nomor_kontak_wali = $21
		WHERE id = $22
	`
	result, err := r.db.ExecContext(ctx, query,
		student.NIS, student.NISN, student.NomorUjianSekolah, student.StatusSiswa,
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
