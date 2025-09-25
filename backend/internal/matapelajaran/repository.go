// file: backend/internal/matapelajaran/repository.go
package matapelajaran

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error)
	GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetAllTaught(ctx context.Context, schemaName string) ([]MataPelajaran, error)
	UpdateUrutan(ctx context.Context, schemaName string, orderedIDs []string) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) UpdateUrutan(ctx context.Context, schemaName string, orderedIDs []string) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE mata_pelajaran AS m
		SET urutan = new_order.new_urutan
		FROM (
			SELECT id, ordinality AS new_urutan
			FROM unnest($1::uuid[]) WITH ORDINALITY AS t(id, ordinality)
		) AS new_order
		WHERE m.id = new_order.id;
	`
	_, err = tx.ExecContext(ctx, query, pq.Array(orderedIDs))
	if err != nil {
		return fmt.Errorf("gagal update urutan mapel: %w", err)
	}

	return tx.Commit()
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, parent_id, kelompok_id) VALUES ($1, $2, $3, $4) RETURNING id, kode_mapel, nama_mapel, parent_id, kelompok_id, created_at, updated_at, urutan`
	row := r.db.QueryRowContext(ctx, query, input.KodeMapel, input.NamaMapel, input.ParentID, input.KelompokID)

	var mp MataPelajaran
	var parentID sql.NullString
	var kelompokID sql.NullInt32
	if err := row.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &parentID, &kelompokID, &mp.CreatedAt, &mp.UpdatedAt, &mp.Urutan); err != nil {
		return nil, fmt.Errorf("gagal memindai data mata pelajaran setelah dibuat: %w", err)
	}
	if parentID.Valid {
		mp.ParentID = &parentID.String
	}
	if kelompokID.Valid {
		id := int(kelompokID.Int32)
		mp.KelompokID = &id
	}

	return &mp, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT mp.id, mp.kode_mapel, mp.nama_mapel, mp.parent_id, mp.created_at, mp.updated_at, mp.urutan, mp.kelompok_id, kmp.nama_kelompok
		FROM mata_pelajaran mp
		LEFT JOIN kelompok_mata_pelajaran kmp ON mp.kelompok_id = kmp.id
		ORDER BY mp.urutan ASC, mp.nama_mapel ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all mata pelajaran: %w", err)
	}
	defer rows.Close()

	var list []MataPelajaran
	for rows.Next() {
		var mp MataPelajaran
		var parentID sql.NullString
		var kelompokID sql.NullInt32
		var namaKelompok sql.NullString
		if err := rows.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &parentID, &mp.CreatedAt, &mp.UpdatedAt, &mp.Urutan, &kelompokID, &namaKelompok); err != nil {
			return nil, fmt.Errorf("gagal memindai data mata pelajaran: %w", err)
		}
		if parentID.Valid {
			mp.ParentID = &parentID.String
		}
		if kelompokID.Valid {
			id := int(kelompokID.Int32)
			mp.KelompokID = &id
		}
		if namaKelompok.Valid {
			mp.NamaKelompok = &namaKelompok.String
		}
		list = append(list, mp)
	}
	return list, rows.Err()
}

func (r *postgresRepository) GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, kode_mapel, nama_mapel, parent_id, created_at, updated_at, urutan FROM mata_pelajaran WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	var mp MataPelajaran
	var parentID sql.NullString
	err := row.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &parentID, &mp.CreatedAt, &mp.UpdatedAt, &mp.Urutan)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Data tidak ditemukan
		}
		return nil, fmt.Errorf("gagal memindai data mata pelajaran by id: %w", err)
	}
	if parentID.Valid {
		mp.ParentID = &parentID.String
	}
	return &mp, nil
}

func (r *postgresRepository) Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE mata_pelajaran SET kode_mapel = $1, nama_mapel = $2, parent_id = $3, kelompok_id = $4, updated_at = NOW() WHERE id = $5`
	result, err := r.db.ExecContext(ctx, query, input.KodeMapel, input.NamaMapel, input.ParentID, input.KelompokID, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update: %w", err)
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
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM mata_pelajaran WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
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

func (r *postgresRepository) GetAllTaught(ctx context.Context, schemaName string) ([]MataPelajaran, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT id, kode_mapel, nama_mapel, parent_id, created_at, updated_at, urutan
		FROM mata_pelajaran 
		WHERE id NOT IN (SELECT DISTINCT parent_id FROM mata_pelajaran WHERE parent_id IS NOT NULL)
		ORDER BY urutan ASC, nama_mapel ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all taught mata pelajaran: %w", err)
	}
	defer rows.Close()

	var list []MataPelajaran
	for rows.Next() {
		var mp MataPelajaran
		var parentID sql.NullString
		if err := rows.Scan(&mp.ID, &mp.KodeMapel, &mp.NamaMapel, &parentID, &mp.CreatedAt, &mp.UpdatedAt, &mp.Urutan); err != nil {
			return nil, fmt.Errorf("gagal memindai data mata pelajaran: %w", err)
		}
		if parentID.Valid {
			mp.ParentID = &parentID.String
		}
		list = append(list, mp)
	}
	return list, rows.Err()
}
