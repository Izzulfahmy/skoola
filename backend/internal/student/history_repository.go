// file: backend/internal/student/history_repository.go
package student

import (
	"context"
	"database/sql"
	"fmt"
)

// HistoryRepository mendefinisikan interface untuk interaksi database riwayat akademik.
type HistoryRepository interface {
	Create(ctx context.Context, schemaName string, history *RiwayatAkademik) error
	GetByStudentID(ctx context.Context, schemaName string, studentID string) ([]RiwayatAkademik, error)
	Update(ctx context.Context, schemaName string, history *RiwayatAkademik) error
	Delete(ctx context.Context, schemaName string, historyID string) error
	GetByID(ctx context.Context, schemaName string, historyID string) (*RiwayatAkademik, error)
}

type historyPostgresRepository struct {
	db *sql.DB
}

func NewHistoryRepository(db *sql.DB) HistoryRepository {
	return &historyPostgresRepository{db: db}
}

func (r *historyPostgresRepository) Create(ctx context.Context, schemaName string, h *RiwayatAkademik) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		INSERT INTO riwayat_akademik (id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, h.ID, h.StudentID, h.Status, h.TanggalKejadian, h.KelasTingkat, h.Keterangan)
	return err
}

func (r *historyPostgresRepository) GetByStudentID(ctx context.Context, schemaName string, studentID string) ([]RiwayatAkademik, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		SELECT id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan, created_at, updated_at
		FROM riwayat_akademik WHERE student_id = $1 ORDER BY tanggal_kejadian DESC, created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []RiwayatAkademik
	for rows.Next() {
		var h RiwayatAkademik
		if err := rows.Scan(&h.ID, &h.StudentID, &h.Status, &h.TanggalKejadian, &h.KelasTingkat, &h.Keterangan, &h.CreatedAt, &h.UpdatedAt); err != nil {
			return nil, err
		}
		histories = append(histories, h)
	}
	return histories, nil
}

func (r *historyPostgresRepository) GetByID(ctx context.Context, schemaName string, historyID string) (*RiwayatAkademik, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan, created_at, updated_at FROM riwayat_akademik WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, historyID)

	var h RiwayatAkademik
	err := row.Scan(&h.ID, &h.StudentID, &h.Status, &h.TanggalKejadian, &h.KelasTingkat, &h.Keterangan, &h.CreatedAt, &h.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &h, nil
}

func (r *historyPostgresRepository) Update(ctx context.Context, schemaName string, h *RiwayatAkademik) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `
		UPDATE riwayat_akademik SET status = $1, tanggal_kejadian = $2, kelas_tingkat = $3, keterangan = $4, updated_at = NOW()
		WHERE id = $5
	`
	_, err := r.db.ExecContext(ctx, query, h.Status, h.TanggalKejadian, h.KelasTingkat, h.Keterangan, h.ID)
	return err
}

func (r *historyPostgresRepository) Delete(ctx context.Context, schemaName string, historyID string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `DELETE FROM riwayat_akademik WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, historyID)
	return err
}
