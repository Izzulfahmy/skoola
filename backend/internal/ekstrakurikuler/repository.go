// file: backend/internal/ekstrakurikuler/repository.go
package ekstrakurikuler

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error)
	GetAll(ctx context.Context, schemaName string) ([]Ekstrakurikuler, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertEkstrakurikulerInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type postgresRepository struct {
	db *sql.DB
}

// NewRepository membuat instance baru dari postgresRepository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) setSchema(ctx context.Context, schemaName string) error {
	_, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName))
	return err
}

func (r *postgresRepository) Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        INSERT INTO ekstrakurikuler (nama_kegiatan, deskripsi)
        VALUES ($1, $2)
        RETURNING id, nama_kegiatan, deskripsi, created_at, updated_at
    `
	row := r.db.QueryRowContext(ctx, query, input.NamaKegiatan, input.Deskripsi)

	var ekskul Ekstrakurikuler
	if err := row.Scan(&ekskul.ID, &ekskul.NamaKegiatan, &ekskul.Deskripsi, &ekskul.CreatedAt, &ekskul.UpdatedAt); err != nil {
		return nil, err
	}
	return &ekskul, nil
}

func (r *postgresRepository) GetAll(ctx context.Context, schemaName string) ([]Ekstrakurikuler, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `SELECT id, nama_kegiatan, deskripsi, created_at, updated_at FROM ekstrakurikuler ORDER BY nama_kegiatan ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Ekstrakurikuler
	for rows.Next() {
		var e Ekstrakurikuler
		if err := rows.Scan(&e.ID, &e.NamaKegiatan, &e.Deskripsi, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
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
