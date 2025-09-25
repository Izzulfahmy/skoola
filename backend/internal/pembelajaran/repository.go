// file: backend/internal/pembelajaran/repository.go
package pembelajaran

import (
	"context"
	"database/sql"
	"fmt"
	"skoola/internal/penilaiansumatif"

	"github.com/lib/pq" // <-- 1. PASTIKAN IMPOR INI ADA
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	// Materi
	CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error)
	GetMateriByID(ctx context.Context, schemaName string, id int) (*MateriPembelajaran, error)
	GetAllMateriByPengajarKelas(ctx context.Context, schemaName string, pengajarKelasID string) ([]MateriPembelajaran, error)
	UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error
	DeleteMateri(ctx context.Context, schemaName string, id int) error
	UpdateUrutanMateri(ctx context.Context, schemaName string, orderedIDs []int) error

	// Tujuan Pembelajaran
	CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error)
	UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error
	DeleteTujuan(ctx context.Context, schemaName string, id int) error
	UpdateUrutanTujuan(ctx context.Context, schemaName string, orderedIDs []int) error
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

// --- FUNGSI BARU UNTUK UPDATE URUTAN MATERI ---
func (r *postgresRepository) UpdateUrutanMateri(ctx context.Context, schemaName string, orderedIDs []int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// --- PERBAIKAN UTAMA DI SINI ---
	query := `
		UPDATE materi_pembelajaran AS m
		SET urutan = new_order.new_urutan
		FROM (
			SELECT id, row_number() OVER () AS new_urutan
			FROM unnest($1::int[]) AS id
		) AS new_order
		WHERE m.id = new_order.id;
	`
	_, err = tx.ExecContext(ctx, query, pq.Array(orderedIDs))
	if err != nil {
		return fmt.Errorf("gagal update urutan materi: %w", err)
	}

	return tx.Commit()
}

// --- FUNGSI BARU UNTUK UPDATE URUTAN TUJUAN PEMBELAJARAN ---
func (r *postgresRepository) UpdateUrutanTujuan(ctx context.Context, schemaName string, orderedIDs []int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// --- PERBAIKAN UTAMA DI SINI ---
	query := `
		UPDATE tujuan_pembelajaran AS tp
		SET urutan = new_order.new_urutan
		FROM (
			SELECT id, row_number() OVER () AS new_urutan
			FROM unnest($1::int[]) AS id
		) AS new_order
		WHERE tp.id = new_order.id;
	`
	_, err = tx.ExecContext(ctx, query, pq.Array(orderedIDs))
	if err != nil {
		return fmt.Errorf("gagal update urutan tujuan: %w", err)
	}

	return tx.Commit()
}

// Sisa file repository.go tetap sama
func (r *postgresRepository) CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	var maxUrutan sql.NullInt64
	urutanQuery := `SELECT MAX(urutan) FROM materi_pembelajaran WHERE pengajar_kelas_id = $1`
	if err := tx.QueryRowContext(ctx, urutanQuery, input.PengajarKelasID).Scan(&maxUrutan); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("gagal mendapatkan urutan maksimum materi: %w", err)
	}

	nextUrutan := 1
	if maxUrutan.Valid {
		nextUrutan = int(maxUrutan.Int64) + 1
	}

	query := `
		INSERT INTO materi_pembelajaran (pengajar_kelas_id, nama_materi, deskripsi, urutan)
		VALUES ($1, $2, $3, $4)
		RETURNING id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at
	`
	row := tx.QueryRowContext(ctx, query, input.PengajarKelasID, input.NamaMateri, sql.NullString{String: input.Deskripsi, Valid: input.Deskripsi != ""}, nextUrutan)

	var m MateriPembelajaran
	if err := row.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &m.Deskripsi, &m.Urutan, &m.CreatedAt, &m.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data materi setelah dibuat: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	m.TujuanPembelajaran = []TujuanPembelajaran{}
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

	materiQuery := `SELECT id, pengajar_kelas_id, nama_materi, deskripsi, urutan FROM materi_pembelajaran WHERE pengajar_kelas_id = $1 ORDER BY urutan ASC, created_at ASC`
	materiRows, err := r.db.QueryContext(ctx, materiQuery, pengajarKelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query materi: %w", err)
	}
	defer materiRows.Close()

	materiMap := make(map[int]*MateriPembelajaran)
	var materiList []*MateriPembelajaran
	var tpIDs []int
	tpMap := make(map[int]*TujuanPembelajaran)

	for materiRows.Next() {
		var m MateriPembelajaran
		if err := materiRows.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &m.Deskripsi, &m.Urutan); err != nil {
			return nil, err
		}
		m.TujuanPembelajaran = []TujuanPembelajaran{}
		materiMap[m.ID] = &m
		materiList = append(materiList, &m)
	}

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
			tpIDs = append(tpIDs, tp.ID)
			// Add to tpMap for later lookup
			tpMap[tp.ID] = &materi.TujuanPembelajaran[len(materi.TujuanPembelajaran)-1]
		}
	}

	if len(tpIDs) > 0 {
		penilaianQuery := `
			SELECT 
				ps.id, ps.tujuan_pembelajaran_id, ps.jenis_ujian_id, ps.nama_penilaian, 
				ps.tanggal_pelaksanaan, ps.keterangan, ps.created_at, ps.updated_at,
				ju.nama_ujian, ju.kode_ujian
			FROM penilaian_sumatif ps
			JOIN jenis_ujian ju ON ps.jenis_ujian_id = ju.id
			WHERE ps.tujuan_pembelajaran_id = ANY($1)
			ORDER BY ps.tanggal_pelaksanaan ASC, ps.created_at ASC
		`
		penilaianRows, err := r.db.QueryContext(ctx, penilaianQuery, pq.Array(tpIDs))
		if err != nil {
			return nil, fmt.Errorf("gagal query penilaian sumatif: %w", err)
		}
		defer penilaianRows.Close()

		for penilaianRows.Next() {
			var ps penilaiansumatif.PenilaianSumatif
			if err := penilaianRows.Scan(
				&ps.ID, &ps.TujuanPembelajaranID, &ps.JenisUjianID, &ps.NamaPenilaian,
				&ps.TanggalPelaksanaan, &ps.Keterangan, &ps.CreatedAt, &ps.UpdatedAt,
				&ps.NamaJenisUjian, &ps.KodeJenisUjian,
			); err != nil {
				return nil, err
			}

			if tp, ok := tpMap[ps.TujuanPembelajaranID]; ok {
				tp.PenilaianSumatif = append(tp.PenilaianSumatif, ps)
			}
		}
	}

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
			nama_materi = $1, deskripsi = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, input.NamaMateri, sql.NullString{String: input.Deskripsi, Valid: input.Deskripsi != ""}, id)
	return err
}

func (r *postgresRepository) DeleteMateri(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	var pengajarKelasID string
	err = tx.QueryRowContext(ctx, "SELECT pengajar_kelas_id FROM materi_pembelajaran WHERE id = $1", id).Scan(&pengajarKelasID)
	if err != nil {
		return fmt.Errorf("gagal mendapatkan parent id: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM materi_pembelajaran WHERE id = $1", id)
	if err != nil {
		return err
	}

	reorderQuery := `
        WITH ranked_materi AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY urutan) as new_urutan
            FROM materi_pembelajaran
            WHERE pengajar_kelas_id = $1
        )
        UPDATE materi_pembelajaran
        SET urutan = ranked_materi.new_urutan
        FROM ranked_materi
        WHERE materi_pembelajaran.id = ranked_materi.id;
    `
	_, err = tx.ExecContext(ctx, reorderQuery, pengajarKelasID)
	if err != nil {
		return fmt.Errorf("gagal merapikan urutan materi: %w", err)
	}

	return tx.Commit()
}

func (r *postgresRepository) CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	var maxUrutan sql.NullInt64
	urutanQuery := `SELECT MAX(urutan) FROM tujuan_pembelajaran WHERE materi_pembelajaran_id = $1`
	if err := tx.QueryRowContext(ctx, urutanQuery, input.MateriPembelajaranID).Scan(&maxUrutan); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("gagal mendapatkan urutan maksimum tujuan: %w", err)
	}

	nextUrutan := 1
	if maxUrutan.Valid {
		nextUrutan = int(maxUrutan.Int64) + 1
	}

	query := `
		INSERT INTO tujuan_pembelajaran (materi_pembelajaran_id, deskripsi_tujuan, urutan)
		VALUES ($1, $2, $3)
		RETURNING id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at
	`
	row := tx.QueryRowContext(ctx, query, input.MateriPembelajaranID, input.DeskripsiTujuan, nextUrutan)
	var tp TujuanPembelajaran
	if err := row.Scan(&tp.ID, &tp.MateriPembelajaranID, &tp.DeskripsiTujuan, &tp.Urutan, &tp.CreatedAt, &tp.UpdatedAt); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return &tp, nil
}

func (r *postgresRepository) UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `
		UPDATE tujuan_pembelajaran SET
			deskripsi_tujuan = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.ExecContext(ctx, query, input.DeskripsiTujuan, id)
	return err
}

func (r *postgresRepository) DeleteTujuan(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	var materiID int
	err = tx.QueryRowContext(ctx, "SELECT materi_pembelajaran_id FROM tujuan_pembelajaran WHERE id = $1", id).Scan(&materiID)
	if err != nil {
		return fmt.Errorf("gagal mendapatkan parent id: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM tujuan_pembelajaran WHERE id = $1", id)
	if err != nil {
		return err
	}

	reorderQuery := `
        WITH ranked_tp AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY urutan) as new_urutan
            FROM tujuan_pembelajaran
            WHERE materi_pembelajaran_id = $1
        )
        UPDATE tujuan_pembelajaran
        SET urutan = ranked_tp.new_urutan
        FROM ranked_tp
        WHERE tujuan_pembelajaran.id = ranked_tp.id;
    `
	_, err = tx.ExecContext(ctx, reorderQuery, materiID)
	if err != nil {
		return fmt.Errorf("gagal merapikan urutan tujuan: %w", err)
	}

	return tx.Commit()
}
