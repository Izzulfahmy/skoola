// file: backend/internal/tahunajaran/repository.go
package tahunajaran

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, ta *TahunAjaran) (*TahunAjaran, error)
	GetAll(ctx context.Context, schemaName string) ([]TahunAjaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*TahunAjaran, error)
	Update(ctx context.Context, schemaName string, ta *TahunAjaran) error
	Delete(ctx context.Context, schemaName string, id string) error
	DeactivateAllOthers(ctx context.Context, tx *sql.Tx, schemaName string, currentID string) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

const selectQuery = `
	SELECT 
		ta.id, ta.nama_tahun_ajaran, ta.semester, ta.status, ta.metode_absensi,
		ta.kepala_sekolah_id, t.nama_lengkap as nama_kepala_sekolah,
		ta.created_at, ta.updated_at
	FROM tahun_ajaran ta
	LEFT JOIN teachers t ON ta.kepala_sekolah_id = t.id
`

func (r *postgresRepository) Create(ctx context.Context, schemaName string, ta *TahunAjaran) (*TahunAjaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		INSERT INTO tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id) 
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	err := r.db.QueryRowContext(ctx, query, ta.ID, ta.NamaTahunAjaran, ta.Semester, ta.Status, ta.MetodeAbsensi, ta.KepalaSekolahID).Scan(&ta.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal insert tahun ajaran: %w", err)
	}

	return r.GetByID(ctx, schemaName, ta.ID)
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]TahunAjaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := selectQuery + " ORDER BY ta.nama_tahun_ajaran DESC, ta.semester DESC"
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all tahun ajaran: %w", err)
	}
	defer rows.Close()

	var list []TahunAjaran
	for rows.Next() {
		var t TahunAjaran
		if err := rows.Scan(&t.ID, &t.NamaTahunAjaran, &t.Semester, &t.Status, &t.MetodeAbsensi, &t.KepalaSekolahID, &t.NamaKepalaSekolah, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai data tahun ajaran: %w", err)
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*TahunAjaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := selectQuery + " WHERE ta.id = $1"
	row := r.db.QueryRowContext(ctx, query, id)

	var t TahunAjaran
	err := row.Scan(&t.ID, &t.NamaTahunAjaran, &t.Semester, &t.Status, &t.MetodeAbsensi, &t.KepalaSekolahID, &t.NamaKepalaSekolah, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai data tahun ajaran by id: %w", err)
	}
	return &t, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, ta *TahunAjaran) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		UPDATE tahun_ajaran SET 
			nama_tahun_ajaran = $1, semester = $2, status = $3, metode_absensi = $4, kepala_sekolah_id = $5, updated_at = NOW() 
		WHERE id = $6
	`
	result, err := r.db.ExecContext(ctx, query, ta.NamaTahunAjaran, ta.Semester, ta.Status, ta.MetodeAbsensi, ta.KepalaSekolahID, ta.ID)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, schemaName string, id string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM tahun_ajaran WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// DeactivateAllOthers menonaktifkan semua tahun ajaran lain jika ada yang di-set menjadi 'Aktif'.
func (r *postgresRepository) DeactivateAllOthers(ctx context.Context, tx *sql.Tx, schemaName string, currentID string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE tahun_ajaran SET status = 'Tidak Aktif' WHERE id != $1 AND status = 'Aktif'`
	_, err := tx.ExecContext(ctx, query, currentID)
	if err != nil {
		return fmt.Errorf("gagal menonaktifkan tahun ajaran lainnya: %w", err)
	}
	return nil
}
