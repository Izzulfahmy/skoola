// file: backend/internal/ekstrakurikuler/repository.go
package ekstrakurikuler

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Repository interface {
	// Master Ekstrakurikuler
	Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error)
	GetAll(ctx context.Context, schemaName string, tahunAjaranID string) ([]Ekstrakurikuler, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertEkstrakurikulerInput) error
	Delete(ctx context.Context, schemaName string, id int) error

	// Sesi Ekstrakurikuler
	GetOrCreateSesi(ctx context.Context, schemaName string, ekskulID int, tahunAjaranID string) (*EkstrakurikulerSesi, error)
	UpdateSesiDetail(ctx context.Context, schemaName string, sesiID int, input UpdateSesiDetailInput) error

	// Anggota
	GetAnggotaBySesiID(ctx context.Context, schemaName string, sesiID int) ([]EkstrakurikulerAnggota, error)
	AddAnggota(ctx context.Context, schemaName string, sesiID int, studentIDs []string) error
	RemoveAnggota(ctx context.Context, schemaName string, anggotaID int) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

// --- Implementasi Master Ekstrakurikuler ---
func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `INSERT INTO ekstrakurikuler (nama_kegiatan, deskripsi) VALUES ($1, $2) RETURNING id, nama_kegiatan, deskripsi, created_at, updated_at`
	row := r.db.QueryRowContext(ctx, query, input.NamaKegiatan, input.Deskripsi)
	var ekskul Ekstrakurikuler
	if err := row.Scan(&ekskul.ID, &ekskul.NamaKegiatan, &ekskul.Deskripsi, &ekskul.CreatedAt, &ekskul.UpdatedAt); err != nil {
		return nil, err
	}
	return &ekskul, nil
}

// FIX: Implementasi GetAll dengan JOIN
func (r *postgresRepository) GetAll(ctx context.Context, schemaName string, tahunAjaranID string) ([]Ekstrakurikuler, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
		SELECT 
			e.id, e.nama_kegiatan, e.deskripsi, e.created_at, e.updated_at,
			t.nama_lengkap AS nama_pembina,
			(SELECT COUNT(*) FROM ekstrakurikuler_anggota ea WHERE ea.sesi_id = es.id) AS jumlah_anggota
		FROM ekstrakurikuler e
		LEFT JOIN ekstrakurikuler_sesi es ON e.id = es.ekstrakurikuler_id AND es.tahun_ajaran_id = $1
		LEFT JOIN teachers t ON es.pembina_id = t.id
		ORDER BY e.nama_kegiatan ASC
	`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Ekstrakurikuler
	for rows.Next() {
		var e Ekstrakurikuler
		var namaPembina sql.NullString
		var jumlahAnggota sql.NullInt32

		if err := rows.Scan(
			&e.ID, &e.NamaKegiatan, &e.Deskripsi, &e.CreatedAt, &e.UpdatedAt,
			&namaPembina,
			&jumlahAnggota,
		); err != nil {
			return nil, err
		}

		// Map sql.NullString/Int ke *string/*int di model Ekstrakurikuler
		if namaPembina.Valid {
			e.NamaPembina = &namaPembina.String
		}
		if jumlahAnggota.Valid {
			tempCount := int(jumlahAnggota.Int32)
			e.JumlahAnggota = &tempCount
		}

		list = append(list, e)
	}
	return list, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id int, input UpsertEkstrakurikulerInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `UPDATE ekstrakurikuler SET nama_kegiatan = $1, deskripsi = $2, updated_at = NOW() WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.NamaKegiatan, input.Deskripsi, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `DELETE FROM ekstrakurikuler WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// --- Implementasi Sesi (Tetap sama, sudah benar dari sebelumnya) ---
func (r *postgresRepository) GetOrCreateSesi(ctx context.Context, schemaName string, ekskulID int, tahunAjaranID string) (*EkstrakurikulerSesi, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
		SELECT 
			es.id, es.ekstrakurikuler_id, es.tahun_ajaran_id, es.pembina_id,
			t.nama_lengkap,
			(SELECT COUNT(*) FROM ekstrakurikuler_anggota ea WHERE ea.sesi_id = es.id) as jumlah_anggota
		FROM ekstrakurikuler_sesi es
		LEFT JOIN teachers t ON es.pembina_id = t.id
		WHERE es.ekstrakurikuler_id = $1 AND es.tahun_ajaran_id = $2
	`
	row := r.db.QueryRowContext(ctx, query, ekskulID, tahunAjaranID)
	var sesi EkstrakurikulerSesi
	err := row.Scan(&sesi.ID, &sesi.EkstrakurikulerID, &sesi.TahunAjaranID, &sesi.PembinaID, &sesi.NamaPembina, &sesi.JumlahAnggota)

	if err == sql.ErrNoRows {
		insertQuery := `
			INSERT INTO ekstrakurikuler_sesi (ekstrakurikuler_id, tahun_ajaran_id)
			VALUES ($1, $2)
			RETURNING id, ekstrakurikuler_id, tahun_ajaran_id, pembina_id
		`
		insertRow := r.db.QueryRowContext(ctx, insertQuery, ekskulID, tahunAjaranID)
		if err := insertRow.Scan(&sesi.ID, &sesi.EkstrakurikulerID, &sesi.TahunAjaranID, &sesi.PembinaID); err != nil {
			return nil, err
		}
		sesi.JumlahAnggota = 0
		return &sesi, nil
	} else if err != nil {
		return nil, err
	}

	return &sesi, nil
}

func (r *postgresRepository) UpdateSesiDetail(ctx context.Context, schemaName string, sesiID int, input UpdateSesiDetailInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `UPDATE ekstrakurikuler_sesi SET pembina_id = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, input.PembinaID, sesiID)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// --- Implementasi Anggota (Tetap sama) ---
func (r *postgresRepository) GetAnggotaBySesiID(ctx context.Context, schemaName string, sesiID int) ([]EkstrakurikulerAnggota, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        SELECT 
            ea.id, ea.sesi_id, ea.student_id,
            s.nis, s.nisn, s.nama_lengkap
        FROM ekstrakurikuler_anggota ea
        JOIN students s ON ea.student_id = s.id
        WHERE ea.sesi_id = $1
        ORDER BY s.nama_lengkap
    `
	rows, err := r.db.QueryContext(ctx, query, sesiID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var anggota []EkstrakurikulerAnggota
	for rows.Next() {
		var a EkstrakurikulerAnggota
		if err := rows.Scan(&a.ID, &a.SesiID, &a.StudentID, &a.Student.NIS, &a.Student.NISN, &a.Student.NamaLengkap); err != nil {
			return nil, err
		}
		anggota = append(anggota, a)
	}
	return anggota, nil
}

func (r *postgresRepository) AddAnggota(ctx context.Context, schemaName string, sesiID int, studentIDs []string) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	// Menggunakan ON CONFLICT DO NOTHING untuk menghindari error jika siswa sudah ada
	var valueStrings []string
	var valueArgs []interface{}
	i := 1
	for _, id := range studentIDs {
		valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d)", i, i+1))
		valueArgs = append(valueArgs, sesiID, id)
		i += 2
	}

	query := fmt.Sprintf(`
        INSERT INTO ekstrakurikuler_anggota (sesi_id, student_id) 
        VALUES %s 
        ON CONFLICT (sesi_id, student_id) DO NOTHING
    `, strings.Join(valueStrings, ","))

	_, err := r.db.ExecContext(ctx, query, valueArgs...)
	return err
}

func (r *postgresRepository) RemoveAnggota(ctx context.Context, schemaName string, anggotaID int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	query := `DELETE FROM ekstrakurikuler_anggota WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, anggotaID)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
