// file: backend/internal/pembelajaran/repository.go
package pembelajaran

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	// Materi
	CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error)
	GetMateriByID(ctx context.Context, schemaName string, id int) (*MateriPembelajaran, error)
	GetAllMateriByPengajarKelas(ctx context.Context, schemaName string, pengajarKelasID string) ([]MateriPembelajaran, error)
	UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error
	DeleteMateri(ctx context.Context, schemaName string, id int) error

	// Tujuan Pembelajaran
	CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error)
	UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error
	DeleteTujuan(ctx context.Context, schemaName string, id int) error
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
	if err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	return nil
}

// === Implementasi Materi ===

func (r *postgresRepository) CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
		INSERT INTO materi_pembelajaran (pengajar_kelas_id, nama_materi, deskripsi, urutan)
		VALUES ($1, $2, $3, $4)
		RETURNING id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at
	`
	row := r.db.QueryRowContext(ctx, query, input.PengajarKelasID, input.NamaMateri, sql.NullString{String: input.Deskripsi, Valid: input.Deskripsi != ""}, input.Urutan)

	var m MateriPembelajaran
	if err := row.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &m.Deskripsi, &m.Urutan, &m.CreatedAt, &m.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data materi setelah dibuat: %w", err)
	}
	m.TujuanPembelajaran = []TujuanPembelajaran{} // Inisialisasi slice kosong
	return &m, nil
}

func (r *postgresRepository) GetMateriByID(ctx context.Context, schemaName string, id int) (*MateriPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	materiQuery := `SELECT id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at FROM materi_pembelajaran WHERE id = $1`
	row := r.db.QueryRowContext(ctx, materiQuery, id)

	var m MateriPembelajaran
	if err := row.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &m.Deskripsi, &m.Urutan, &m.CreatedAt, &m.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("gagal memindai materi by id: %w", err)
	}

	// Ambil semua tujuan pembelajaran terkait
	tpQuery := `SELECT id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at FROM tujuan_pembelajaran WHERE materi_pembelajaran_id = $1 ORDER BY urutan ASC, created_at ASC`
	rows, err := r.db.QueryContext(ctx, tpQuery, m.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal query tujuan pembelajaran: %w", err)
	}
	defer rows.Close()

	tps := []TujuanPembelajaran{}
	for rows.Next() {
		var tp TujuanPembelajaran
		if err := rows.Scan(&tp.ID, &tp.MateriPembelajaranID, &tp.DeskripsiTujuan, &tp.Urutan, &tp.CreatedAt, &tp.UpdatedAt); err != nil {
			return nil, fmt.Errorf("gagal memindai tujuan pembelajaran: %w", err)
		}
		tps = append(tps, tp)
	}
	m.TujuanPembelajaran = tps

	return &m, nil
}

func (r *postgresRepository) GetAllMateriByPengajarKelas(ctx context.Context, schemaName string, pengajarKelasID string) ([]MateriPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	// 1. Ambil semua materi
	materiQuery := `SELECT id, pengajar_kelas_id, nama_materi, deskripsi, urutan FROM materi_pembelajaran WHERE pengajar_kelas_id = $1 ORDER BY urutan ASC, created_at ASC`
	materiRows, err := r.db.QueryContext(ctx, materiQuery, pengajarKelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query materi: %w", err)
	}
	defer materiRows.Close()

	materiMap := make(map[int]*MateriPembelajaran)
	var materiList []*MateriPembelajaran
	for materiRows.Next() {
		var m MateriPembelajaran
		if err := materiRows.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &m.Deskripsi, &m.Urutan); err != nil {
			return nil, err
		}
		m.TujuanPembelajaran = []TujuanPembelajaran{} // Inisialisasi
		materiMap[m.ID] = &m
		materiList = append(materiList, &m)
	}

	// 2. Ambil semua tujuan pembelajaran untuk materi-materi tersebut
	tpQuery := `
		SELECT tp.id, tp.materi_pembelajaran_id, tp.deskripsi_tujuan, tp.urutan
		FROM tujuan_pembelajaran tp
		JOIN materi_pembelajaran mp ON tp.materi_pembelajaran_id = mp.id
		WHERE mp.pengajar_kelas_id = $1
		ORDER BY tp.urutan ASC, tp.created_at ASC
	`
	tpRows, err := r.db.QueryContext(ctx, tpQuery, pengajarKelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query tujuan pembelajaran: %w", err)
	}
	defer tpRows.Close()

	for tpRows.Next() {
		var tp TujuanPembelajaran
		if err := tpRows.Scan(&tp.ID, &tp.MateriPembelajaranID, &tp.DeskripsiTujuan, &tp.Urutan); err != nil {
			return nil, err
		}
		if materi, ok := materiMap[tp.MateriPembelajaranID]; ok {
			materi.TujuanPembelajaran = append(materi.TujuanPembelajaran, tp)
		}
	}

	// Konversi dari slice of pointers ke slice of values
	result := make([]MateriPembelajaran, len(materiList))
	for i, m := range materiList {
		result[i] = *m
	}

	return result, nil
}

func (r *postgresRepository) UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `
		UPDATE materi_pembelajaran SET
			nama_materi = $1, deskripsi = $2, urutan = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query, input.NamaMateri, sql.NullString{String: input.Deskripsi, Valid: input.Deskripsi != ""}, input.Urutan, id)
	return err
}

func (r *postgresRepository) DeleteMateri(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM materi_pembelajaran WHERE id = $1", id)
	return err
}

// === Implementasi Tujuan Pembelajaran ===

func (r *postgresRepository) CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}
	query := `
		INSERT INTO tujuan_pembelajaran (materi_pembelajaran_id, deskripsi_tujuan, urutan)
		VALUES ($1, $2, $3)
		RETURNING id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at
	`
	row := r.db.QueryRowContext(ctx, query, input.MateriPembelajaranID, input.DeskripsiTujuan, input.Urutan)
	var tp TujuanPembelajaran
	if err := row.Scan(&tp.ID, &tp.MateriPembelajaranID, &tp.DeskripsiTujuan, &tp.Urutan, &tp.CreatedAt, &tp.UpdatedAt); err != nil {
		return nil, err
	}
	return &tp, nil
}

func (r *postgresRepository) UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `
		UPDATE tujuan_pembelajaran SET
			deskripsi_tujuan = $1, urutan = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, input.DeskripsiTujuan, input.Urutan, id)
	return err
}

func (r *postgresRepository) DeleteTujuan(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM tujuan_pembelajaran WHERE id = $1", id)
	return err
}
