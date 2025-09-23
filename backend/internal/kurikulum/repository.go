// file: backend/internal/kurikulum/repository.go
package kurikulum

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	// Kurikulum
	GetAllKurikulum(ctx context.Context, schemaName string) ([]Kurikulum, error)
	GetAllKurikulumByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kurikulum, error)
	CreateKurikulum(ctx context.Context, schemaName string, input UpsertKurikulumInput) (*Kurikulum, error)
	UpdateKurikulum(ctx context.Context, schemaName string, id int, input UpsertKurikulumInput) error
	DeleteKurikulum(ctx context.Context, schemaName string, id int) error
	AddKurikulumToTahunAjaran(ctx context.Context, schemaName string, input AddKurikulumToTahunAjaranInput) error // <-- TAMBAHKAN FUNGSI BARU DI INTERFACE

	// Fase
	GetAllFase(ctx context.Context, schemaName string) ([]Fase, error)
	CreateFase(ctx context.Context, schemaName string, input UpsertFaseInput) (*Fase, error)

	// Pemetaan
	GetFaseTingkatanByKurikulum(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int) ([]FaseTingkatan, error)
	CreatePemetaan(ctx context.Context, schemaName string, input PemetaanInput) error
	DeletePemetaan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int, tingkatanID int) error

	// Tingkatan
	GetAllTingkatan(ctx context.Context, schemaName string) ([]Tingkatan, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// --- FUNGSI BARU UNTUK MENAMBAHKAN ASOSIASI ---
func (r *postgresRepository) AddKurikulumToTahunAjaran(ctx context.Context, schemaName string, input AddKurikulumToTahunAjaranInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}
	query := `INSERT INTO tahun_ajaran_kurikulum (tahun_ajaran_id, kurikulum_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, input.TahunAjaranID, input.KurikulumID)
	return err
}

// --- PERBAIKI FUNGSI INI UNTUK MENGAMBIL DATA DARI TABEL ASOSIASI ---
func (r *postgresRepository) GetAllKurikulumByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kurikulum, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `
		SELECT k.id, k.nama_kurikulum, k.deskripsi
		FROM kurikulum k
		JOIN tahun_ajaran_kurikulum tak ON k.id = tak.kurikulum_id
		WHERE tak.tahun_ajaran_id = $1
		ORDER BY k.nama_kurikulum ASC
	`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all kurikulum by tahun ajaran: %w", err)
	}
	defer rows.Close()

	var kurikulumList []Kurikulum
	for rows.Next() {
		var k Kurikulum
		if err := rows.Scan(&k.ID, &k.NamaKurikulum, &k.Deskripsi); err != nil {
			return nil, fmt.Errorf("gagal memindai data kurikulum: %w", err)
		}
		kurikulumList = append(kurikulumList, k)
	}
	return kurikulumList, rows.Err()
}

// GetAllKurikulum mengambil semua data master kurikulum.
func (r *postgresRepository) GetAllKurikulum(ctx context.Context, schemaName string) ([]Kurikulum, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `SELECT id, nama_kurikulum, deskripsi FROM kurikulum ORDER BY nama_kurikulum ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query get all kurikulum: %w", err)
	}
	defer rows.Close()

	var kurikulumList []Kurikulum
	for rows.Next() {
		var k Kurikulum
		if err := rows.Scan(&k.ID, &k.NamaKurikulum, &k.Deskripsi); err != nil {
			return nil, fmt.Errorf("gagal memindai data kurikulum: %w", err)
		}
		kurikulumList = append(kurikulumList, k)
	}
	return kurikulumList, rows.Err()
}

// CreateKurikulum membuat data master kurikulum baru.
func (r *postgresRepository) CreateKurikulum(ctx context.Context, schemaName string, input UpsertKurikulumInput) (*Kurikulum, error) {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `INSERT INTO kurikulum (nama_kurikulum, deskripsi) VALUES ($1, $2) RETURNING id, nama_kurikulum, deskripsi`
	row := r.db.QueryRowContext(ctx, query, input.NamaKurikulum, input.Deskripsi)

	var k Kurikulum
	if err := row.Scan(&k.ID, &k.NamaKurikulum, &k.Deskripsi); err != nil {
		return nil, fmt.Errorf("gagal memindai data kurikulum setelah dibuat: %w", err)
	}
	return &k, nil
}

// UpdateKurikulum memperbarui data master kurikulum.
func (r *postgresRepository) UpdateKurikulum(ctx context.Context, schemaName string, id int, input UpsertKurikulumInput) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `UPDATE kurikulum SET nama_kurikulum = $1, deskripsi = $2 WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, input.NamaKurikulum, input.Deskripsi, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query update kurikulum: %w", err)
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

// DeleteKurikulum menghapus data master kurikulum.
func (r *postgresRepository) DeleteKurikulum(ctx context.Context, schemaName string, id int) error {
	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := r.db.ExecContext(ctx, setSchemaQuery); err != nil {
		return fmt.Errorf("gagal mengatur skema tenant: %w", err)
	}

	query := `DELETE FROM kurikulum WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi query delete kurikulum: %w", err)
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

// === METODE FASE ===
func (r *postgresRepository) GetAllFase(ctx context.Context, schemaName string) ([]Fase, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, "SELECT id, nama_fase, deskripsi FROM fase ORDER BY nama_fase ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var fases []Fase
	for rows.Next() {
		var f Fase
		if err := rows.Scan(&f.ID, &f.NamaFase, &f.Deskripsi); err != nil {
			return nil, err
		}
		fases = append(fases, f)
	}
	return fases, nil
}

func (r *postgresRepository) CreateFase(ctx context.Context, schemaName string, input UpsertFaseInput) (*Fase, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, err
	}
	row := r.db.QueryRowContext(ctx, "INSERT INTO fase (nama_fase, deskripsi) VALUES ($1, $2) RETURNING id, nama_fase, deskripsi", input.NamaFase, input.Deskripsi)
	var f Fase
	if err := row.Scan(&f.ID, &f.NamaFase, &f.Deskripsi); err != nil {
		return nil, err
	}
	return &f, nil
}

// === METODE PEMETAAN ===
func (r *postgresRepository) GetFaseTingkatanByKurikulum(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int) ([]FaseTingkatan, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, err
	}
	query := `
		SELECT f.id, f.nama_fase, f.deskripsi, t.id, t.nama_tingkatan
		FROM pemetaan_kurikulum pk
		JOIN fase f ON pk.fase_id = f.id
		JOIN tingkatan t ON pk.tingkatan_id = t.id
		WHERE pk.tahun_ajaran_id = $1 AND pk.kurikulum_id = $2
		ORDER BY t.urutan, t.nama_tingkatan ASC
	`
	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID, kurikulumID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var results []FaseTingkatan
	for rows.Next() {
		var ft FaseTingkatan
		if err := rows.Scan(&ft.ID, &ft.NamaFase, &ft.Deskripsi, &ft.TingkatanID, &ft.NamaTingkatan); err != nil {
			return nil, err
		}
		results = append(results, ft)
	}
	return results, nil
}

func (r *postgresRepository) CreatePemetaan(ctx context.Context, schemaName string, input PemetaanInput) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return err
	}

	// Pertama, pastikan asosiasi antara tahun ajaran dan kurikulum ada
	assocQuery := `
        INSERT INTO tahun_ajaran_kurikulum (tahun_ajaran_id, kurikulum_id)
        VALUES ($1, $2)
        ON CONFLICT (tahun_ajaran_id, kurikulum_id) DO NOTHING
    `
	if _, err := tx.ExecContext(ctx, assocQuery, input.TahunAjaranID, input.KurikulumID); err != nil {
		return fmt.Errorf("gagal memastikan asosiasi kurikulum-tahun ajaran: %w", err)
	}

	// Kedua, masukkan atau perbarui pemetaan tingkatan/fase
	pemetaanQuery := `
        INSERT INTO pemetaan_kurikulum (tahun_ajaran_id, kurikulum_id, tingkatan_id, fase_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (tahun_ajaran_id, kurikulum_id, tingkatan_id)
        DO UPDATE SET fase_id = EXCLUDED.fase_id
    `
	if _, err := tx.ExecContext(ctx, pemetaanQuery, input.TahunAjaranID, input.KurikulumID, input.TingkatanID, input.FaseID); err != nil {
		return fmt.Errorf("gagal menyimpan pemetaan tingkatan-fase: %w", err)
	}

	return tx.Commit()
}

func (r *postgresRepository) DeletePemetaan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int, tingkatanID int) error {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM pemetaan_kurikulum WHERE tahun_ajaran_id = $1 AND kurikulum_id = $2 AND tingkatan_id = $3", tahunAjaranID, kurikulumID, tingkatanID)
	return err
}

// === METODE TINGKATAN ===
func (r *postgresRepository) GetAllTingkatan(ctx context.Context, schemaName string) ([]Tingkatan, error) {
	if _, err := r.db.ExecContext(ctx, fmt.Sprintf("SET search_path TO %q", schemaName)); err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, "SELECT id, nama_tingkatan FROM tingkatan ORDER BY urutan, nama_tingkatan ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tingkatans []Tingkatan
	for rows.Next() {
		var t Tingkatan
		if err := rows.Scan(&t.ID, &t.NamaTingkatan); err != nil {
			return nil, err
		}
		tingkatans = append(tingkatans, t)
	}
	return tingkatans, nil
}
