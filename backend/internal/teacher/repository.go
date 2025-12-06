// file: backend/internal/teacher/repository.go
package teacher

import (
	"context"
	"database/sql"
	"fmt"
	"skoola/internal/rombel" // <-- Impor paket rombel
)

type Querier interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
}

type Repository interface {
	Create(ctx context.Context, querier Querier, schemaName string, user *User, teacher *Teacher) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, teacher *Teacher) error
	Delete(ctx context.Context, schemaName string, teacherID string) error
	GetByEmail(ctx context.Context, schemaName string, email string) (*User, error)
	GetPublicUserByEmail(ctx context.Context, email string) (*User, error)
	GetAdminBySchema(ctx context.Context, schemaName string) (*User, error)
	GetTeacherByUserID(ctx context.Context, schemaName string, userID string) (*Teacher, error)
	UpdateUserEmail(ctx context.Context, schemaName string, userID string, newEmail string) error
	UpdateUserPassword(ctx context.Context, schemaName string, userID string, hashedPassword string) error
	GetHistoryByTeacherID(ctx context.Context, schemaName string, teacherID string) ([]RiwayatKepegawaian, error)
	CreateHistory(ctx context.Context, schemaName string, history *RiwayatKepegawaian) error
	UpdateHistory(ctx context.Context, schemaName string, history *RiwayatKepegawaian) error
	DeleteHistory(ctx context.Context, schemaName string, historyID string) error
	// --- FUNGSI BARU ---
	GetKelasByTeacherID(ctx context.Context, schemaName string, teacherID string, tahunAjaranID string) ([]rombel.Kelas, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{
		db: db,
	}
}

// --- IMPLEMENTASI FUNGSI BARU (DIPERBAIKI) ---
func (r *postgresRepository) GetKelasByTeacherID(ctx context.Context, schemaName string, teacherID string, tahunAjaranID string) ([]rombel.Kelas, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	// PERBAIKAN: Menggunakan Subquery IN (...) alih-alih JOIN langsung untuk menghindari duplikasi
	// jika guru mengajar lebih dari 1 mapel di kelas yang sama.
	query := `
		SELECT
			k.id, k.nama_kelas, k.tahun_ajaran_id, k.tingkatan_id, k.wali_kelas_id,
			k.created_at, k.updated_at,
			t.nama_tingkatan,
			guru.nama_lengkap as nama_wali_kelas,
			ta.nama_tahun_ajaran,
			ta.semester,
			(SELECT COUNT(*) FROM anggota_kelas ak WHERE ak.kelas_id = k.id) as jumlah_siswa,
			(SELECT COUNT(DISTINCT pk.teacher_id) FROM pengajar_kelas pk WHERE pk.kelas_id = k.id) as jumlah_pengajar
		FROM kelas k
		LEFT JOIN tingkatan t ON k.tingkatan_id = t.id
		LEFT JOIN teachers guru ON k.wali_kelas_id = guru.id
		LEFT JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
		WHERE k.tahun_ajaran_id = $2
		AND k.id IN (
			SELECT pk.kelas_id 
			FROM pengajar_kelas pk 
			WHERE pk.teacher_id = $1
		)
		ORDER BY t.urutan, k.nama_kelas
	`
	// Perhatikan urutan argumen tetap: $1 = teacherID, $2 = tahunAjaranID
	rows, err := r.db.QueryContext(ctx, query, teacherID, tahunAjaranID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []rombel.Kelas
	for rows.Next() {
		var k rombel.Kelas
		err := rows.Scan(
			&k.ID, &k.NamaKelas, &k.TahunAjaranID, &k.TingkatanID, &k.WaliKelasID,
			&k.CreatedAt, &k.UpdatedAt,
			&k.NamaTingkatan, &k.NamaWaliKelas,
			&k.NamaTahunAjaran, &k.Semester,
			&k.JumlahSiswa,
			&k.JumlahPengajar,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, k)
	}
	return list, nil
}

func (r *postgresRepository) UpdateHistory(ctx context.Context, schemaName string, history *RiwayatKepegawaian) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		UPDATE riwayat_kepegawaian
		SET status = $1, tanggal_mulai = $2, tanggal_selesai = $3, keterangan = $4, updated_at = NOW()
		WHERE id = $5
	`
	result, err := r.db.ExecContext(ctx, query,
		history.Status,
		history.TanggalMulai,
		history.TanggalSelesai,
		history.Keterangan,
		history.ID,
	)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update history: %w", err)
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

func (r *postgresRepository) DeleteHistory(ctx context.Context, schemaName string, historyID string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM riwayat_kepegawaian WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, historyID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete history: %w", err)
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

func (r *postgresRepository) CreateHistory(ctx context.Context, schemaName string, history *RiwayatKepegawaian) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		INSERT INTO riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query,
		history.ID,
		history.TeacherID,
		history.Status,
		history.TanggalMulai,
		history.TanggalSelesai,
		history.Keterangan,
	)
	if err != nil {
		return fmt.Errorf("gagal memasukkan data riwayat: %w", err)
	}
	return nil
}

func (r *postgresRepository) GetHistoryByTeacherID(ctx context.Context, schemaName string, teacherID string) ([]RiwayatKepegawaian, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		SELECT id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at
		FROM riwayat_kepegawaian
		WHERE teacher_id = $1
		ORDER BY tanggal_mulai DESC
	`
	rows, err := r.db.QueryContext(ctx, query, teacherID)
	if err != nil {
		return nil, fmt.Errorf("gagal query get history by teacher id: %w", err)
	}
	defer rows.Close()
	var histories []RiwayatKepegawaian
	for rows.Next() {
		var h RiwayatKepegawaian
		if err := rows.Scan(&h.ID, &h.TeacherID, &h.Status, &h.TanggalMulai, &h.TanggalSelesai, &h.Keterangan, &h.CreatedAt, &h.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data riwayat: %w", err)
		}
		histories = append(histories, h)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris riwayat: %w", err)
	}
	return histories, nil
}

func (r *postgresRepository) Create(ctx context.Context, querier Querier, schemaName string, user *User, teacher *Teacher) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := querier.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	userQuery := `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err := querier.ExecContext(ctx, userQuery, user.ID, user.Email, user.PasswordHash, user.Role)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel users: %w", err)
	}
	teacherQuery := `
		INSERT INTO teachers (
			id, user_id, nama_lengkap, nip_nuptk, no_hp, alamat_lengkap,
			nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir,
			agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan,
			kode_pos
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
		)`
	_, err = querier.ExecContext(ctx, teacherQuery,
		teacher.ID, user.ID, teacher.NamaLengkap, teacher.NipNuptk, teacher.NoHP, teacher.AlamatLengkap,
		teacher.NamaPanggilan, teacher.GelarAkademik, teacher.JenisKelamin, teacher.TempatLahir, teacher.TanggalLahir,
		teacher.Agama, teacher.Kewarganegaraan, teacher.Provinsi, teacher.KotaKabupaten, teacher.Kecamatan, teacher.DesaKelurahan,
		teacher.KodePos,
	)
	if err != nil {
		return fmt.Errorf("gagal memasukkan ke tabel teachers: %w", err)
	}
	historyQuery := `
		INSERT INTO riwayat_kepegawaian (teacher_id, status, tanggal_mulai)
		VALUES ($1, 'Aktif', NOW())
	`
	_, err = querier.ExecContext(ctx, historyQuery, teacher.ID)
	if err != nil {
		return fmt.Errorf("gagal membuat riwayat kepegawaian pertama: %w", err)
	}
	return nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		WITH LatestStatus AS (
			SELECT
				teacher_id,
				status,
				ROW_NUMBER() OVER(PARTITION BY teacher_id ORDER BY tanggal_mulai DESC) as rn
			FROM riwayat_kepegawaian
		),
		TeachingDuration AS (
			SELECT
				teacher_id,
				SUM(
					COALESCE(tanggal_selesai, CURRENT_DATE) - tanggal_mulai
				) as total_days
			FROM riwayat_kepegawaian
			WHERE status = 'Aktif'
			GROUP BY teacher_id
		)
		SELECT 
			t.id, t.user_id, u.email, t.nama_lengkap, t.created_at, t.updated_at,
			t.nip_nuptk, t.no_hp, t.alamat_lengkap, t.nama_panggilan, t.gelar_akademik,
			t.jenis_kelamin, t.tempat_lahir, t.tanggal_lahir, t.agama, t.kewarganegaraan,
			t.provinsi, t.kota_kabupaten, t.kecamatan, t.desa_kelurahan, t.kode_pos,
			ls.status AS status_saat_ini,
			CASE
				WHEN td.total_days IS NULL THEN '0 hari'
				ELSE 
					(td.total_days / 365)::int || ' tahun ' || ((td.total_days % 365) / 30)::int || ' bulan'
			END AS lama_mengajar
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		LEFT JOIN LatestStatus ls ON t.id = ls.teacher_id AND ls.rn = 1
		LEFT JOIN TeachingDuration td ON t.id = td.teacher_id
		WHERE u.role = 'teacher'
		ORDER BY t.nama_lengkap ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal mengeksekusi query get all teachers: %w", err)
	}
	defer rows.Close()
	var teachers []Teacher
	for rows.Next() {
		var teacher Teacher
		err := rows.Scan(
			&teacher.ID, &teacher.UserID, &teacher.Email, &teacher.NamaLengkap, &teacher.CreatedAt, &teacher.UpdatedAt,
			&teacher.NipNuptk, &teacher.NoHP, &teacher.AlamatLengkap, &teacher.NamaPanggilan, &teacher.GelarAkademik,
			&teacher.JenisKelamin, &teacher.TempatLahir, &teacher.TanggalLahir, &teacher.Agama, &teacher.Kewarganegaraan,
			&teacher.Provinsi, &teacher.KotaKabupaten, &teacher.Kecamatan, &teacher.DesaKelurahan, &teacher.KodePos,
			&teacher.StatusSaatIni, &teacher.LamaMengajar,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal memindai data guru: %w", err)
		}
		teachers = append(teachers, teacher)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("terjadi error saat iterasi baris data guru: %w", err)
	}
	return teachers, nil
}

func (r *postgresRepository) getTeacherDetails(ctx context.Context, schemaName string, whereClause string, args ...interface{}) (*Teacher, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	baseQuery := `
		WITH LatestStatus AS (
			SELECT
				teacher_id,
				status,
				ROW_NUMBER() OVER(PARTITION BY teacher_id ORDER BY tanggal_mulai DESC) as rn
			FROM riwayat_kepegawaian
		),
		TeachingDuration AS (
			SELECT
				teacher_id,
				SUM(
					COALESCE(tanggal_selesai, CURRENT_DATE) - tanggal_mulai
				) as total_days
			FROM riwayat_kepegawaian
			WHERE status = 'Aktif'
			GROUP BY teacher_id
		)
		SELECT 
			t.id, t.user_id, u.email, t.nama_lengkap, t.created_at, t.updated_at,
			t.nip_nuptk, t.no_hp, t.alamat_lengkap, t.nama_panggilan, t.gelar_akademik,
			t.jenis_kelamin, t.tempat_lahir, t.tanggal_lahir, t.agama, t.kewarganegaraan,
			t.provinsi, t.kota_kabupaten, t.kecamatan, t.desa_kelurahan, t.kode_pos,
			ls.status AS status_saat_ini,
			CASE
				WHEN td.total_days IS NULL THEN '0 hari'
				ELSE 
					(td.total_days / 365)::int || ' tahun ' || ((td.total_days % 365) / 30)::int || ' bulan'
			END AS lama_mengajar
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		LEFT JOIN LatestStatus ls ON t.id = ls.teacher_id AND ls.rn = 1
		LEFT JOIN TeachingDuration td ON t.id = td.teacher_id
	`

	finalQuery := baseQuery + " " + whereClause
	row := r.db.QueryRowContext(ctx, finalQuery, args...)
	var teacher Teacher
	err := row.Scan(
		&teacher.ID, &teacher.UserID, &teacher.Email, &teacher.NamaLengkap, &teacher.CreatedAt, &teacher.UpdatedAt,
		&teacher.NipNuptk, &teacher.NoHP, &teacher.AlamatLengkap, &teacher.NamaPanggilan, &teacher.GelarAkademik,
		&teacher.JenisKelamin, &teacher.TempatLahir, &teacher.TanggalLahir, &teacher.Agama, &teacher.Kewarganegaraan,
		&teacher.Provinsi, &teacher.KotaKabupaten, &teacher.Kecamatan, &teacher.DesaKelurahan, &teacher.KodePos,
		&teacher.StatusSaatIni, &teacher.LamaMengajar,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai detail guru: %w", err)
	}
	return &teacher, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	return r.getTeacherDetails(ctx, schemaName, "WHERE t.id = $1", id)
}

func (r *postgresRepository) GetTeacherByUserID(ctx context.Context, schemaName string, userID string) (*Teacher, error) {
	return r.getTeacherDetails(ctx, schemaName, "WHERE t.user_id = $1", userID)
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, teacher *Teacher) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	teacherQuery := `
		UPDATE teachers
		SET 
			nama_lengkap = $1, nip_nuptk = $2, no_hp = $3, alamat_lengkap = $4,
			nama_panggilan = $5, gelar_akademik = $6, jenis_kelamin = $7, tempat_lahir = $8, tanggal_lahir = $9,
			agama = $10, kewarganegaraan = $11, provinsi = $12, kota_kabupaten = $13, kecamatan = $14, desa_kelurahan = $15,
			kode_pos = $16, updated_at = NOW()
		WHERE id = $17
	`
	_, err = tx.ExecContext(ctx, teacherQuery,
		teacher.NamaLengkap, teacher.NipNuptk, teacher.NoHP, teacher.AlamatLengkap,
		teacher.NamaPanggilan, teacher.GelarAkademik, teacher.JenisKelamin, teacher.TempatLahir, teacher.TanggalLahir,
		teacher.Agama, teacher.Kewarganegaraan, teacher.Provinsi, teacher.KotaKabupaten, teacher.Kecamatan, teacher.DesaKelurahan,
		teacher.KodePos, teacher.ID,
	)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update teacher: %w", err)
	}
	userQuery := `UPDATE users SET email = $1 WHERE id = $2`
	result, err := tx.ExecContext(ctx, userQuery, teacher.Email, teacher.UserID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update user email: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal memeriksa baris yang terpengaruh: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return tx.Commit()
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, teacherID string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `DELETE FROM users WHERE id = (SELECT user_id FROM teachers WHERE id = $1)`
	result, err := r.db.ExecContext(ctx, query, teacherID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete: %w", err)
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

func (r *postgresRepository) GetByEmail(ctx context.Context, schemaName string, email string) (*User, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `SELECT id, email, password_hash, role FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data user by email: %w", err)
	}
	return &user, nil
}

func (r *postgresRepository) GetPublicUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, email, password_hash, role FROM public.users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data public user by email: %w", err)
	}
	return &user, nil
}

func (r *postgresRepository) GetAdminBySchema(ctx context.Context, schemaName string) (*User, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `SELECT id, email, password_hash, role FROM users WHERE role = 'admin' LIMIT 1`
	row := r.db.QueryRowContext(ctx, query)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("tidak ada admin yang ditemukan di skema %s", schemaName)
		}
		return nil, fmt.Errorf("gagal memindai data admin: %w", err)
	}
	return &user, nil
}

func (r *postgresRepository) UpdateUserEmail(ctx context.Context, schemaName string, userID string, newEmail string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, newEmail, userID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update email: %w", err)
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

func (r *postgresRepository) UpdateUserPassword(ctx context.Context, schemaName string, userID string, hashedPassword string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, hashedPassword, userID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update password: %w", err)
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
