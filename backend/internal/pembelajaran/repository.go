// file: backend/internal/pembelajaran/repository.go
package pembelajaran

import (
	"context"
	"database/sql"
	"fmt"
	"skoola/internal/penilaiansumatif"
	"strings"

	"github.com/lib/pq"
)

// Repository mendefinisikan interface untuk interaksi database.
type Repository interface {
	// Rencana Pembelajaran (Gabungan)
	GetAllRencanaPembelajaran(ctx context.Context, schemaName string, pengajarKelasID string) ([]RencanaPembelajaranItem, error)
	UpdateRencanaUrutan(ctx context.Context, schemaName string, orderedItems []RencanaUrutanItem) error

	// Materi
	CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error)
	GetMateriByID(ctx context.Context, schemaName string, id int) (*MateriPembelajaran, error)
	UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error
	DeleteMateri(ctx context.Context, schemaName string, id int) error

	// Ujian
	CreateUjian(ctx context.Context, schemaName string, input UpsertUjianInput) (*Ujian, error)
	UpdateUjian(ctx context.Context, schemaName string, id int, input UpsertUjianInput) error
	DeleteUjian(ctx context.Context, schemaName string, id int) error
	CreateBulkUjian(ctx context.Context, schemaName string, input CreateBulkUjianInput) (*BulkUjianResult, error)
	// BARU: Repository untuk monitoring
	GetAllUjianMonitoringByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMonitoring, error)

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

// --- Implementasi GetAllUjianMonitoringByTahunAjaran (BARU) ---
func (r *postgresRepository) GetAllUjianMonitoringByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMonitoring, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	// Query untuk mengelompokkan ujian berdasarkan nama (yang sama dari bulk) dan tahun ajaran,
	// dan menghitung kelas dan mapel yang terlibat.
	query := `
        SELECT
            -- Mengambil ID ujian terkecil dalam grup (untuk representasi ID grup di frontend)
            MIN(u.id) AS id, 
            u.nama_ujian,
            $1 AS tahun_ajaran_id,
            -- Hitung jumlah distinct kelas yang terlibat (lewat kelas_id di pengajar_kelas)
            COUNT(DISTINCT pk.kelas_id) AS jumlah_kelas, 
            -- Hitung jumlah distinct mata pelajaran (mapel) yang terlibat
            COUNT(DISTINCT pk.mata_pelajaran_id) AS jumlah_mapel 
        FROM ujian u
        JOIN pengajar_kelas pk ON u.pengajar_kelas_id = pk.id
        WHERE pk.tahun_ajaran_id = $1
        GROUP BY u.nama_ujian
        ORDER BY MIN(u.urutan) ASC
    `

	rows, err := r.db.QueryContext(ctx, query, tahunAjaranID)
	if err != nil {
		return nil, fmt.Errorf("gagal query monitoring ujian: %w", err)
	}
	defer rows.Close()

	var list []UjianMonitoring
	for rows.Next() {
		var um UjianMonitoring
		var rawID int // ID DB adalah INT (serial)

		err := rows.Scan(
			&rawID, // Scan ID (INT)
			&um.NamaUjian,
			&um.TahunAjaranID,
			&um.JumlahKelas,
			&um.JumlahMapel,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan baris monitoring ujian: %w", err)
		}

		// Konversi ID INT menjadi string untuk sesuai dengan tipe frontend UjianMonitoring.ID
		um.ID = fmt.Sprintf("%d", rawID)

		list = append(list, um)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterasi baris monitoring ujian: %w", err)
	}

	return list, nil
}

// --- Implementasi GetMateriByID ---
func (r *postgresRepository) GetMateriByID(ctx context.Context, schemaName string, id int) (*MateriPembelajaran, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        SELECT 
            id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at
        FROM materi_pembelajaran
        WHERE id = $1
    `
	var m MateriPembelajaran
	var deskripsi sql.NullString // Digunakan untuk menampung kolom NULLABLE

	row := r.db.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&m.ID, &m.PengajarKelasID, &m.NamaMateri, &deskripsi, &m.Urutan, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Materi tidak ditemukan
		}
		return nil, fmt.Errorf("gagal memindai materi ID %d: %w", id, err)
	}

	// FIX: Cek validitas dan inisialisasi pointer (*string) dengan benar
	if deskripsi.Valid {
		m.Deskripsi = new(string)
		*m.Deskripsi = deskripsi.String
	} else {
		m.Deskripsi = nil
	}
	m.TujuanPembelajaran = []TujuanPembelajaran{} // Inisialisasi slice kosong

	return &m, nil
}

// --- Implementasi CreateBulkUjian ---

func (r *postgresRepository) CreateBulkUjian(ctx context.Context, schemaName string, input CreateBulkUjianInput) (*BulkUjianResult, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	// 1. Dapatkan semua ID pengajar_kelas yang relevan dari kelas yang dipilih
	pengajarKelasQuery := `
        SELECT 
            id
        FROM pengajar_kelas
        WHERE kelas_id = ANY($1)
    `
	rows, err := tx.QueryContext(ctx, pengajarKelasQuery, pq.Array(input.KelasIDs))
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan pengajar kelas: %w", err)
	}
	defer rows.Close()

	var pengajarKelasIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("gagal memindai pengajar kelas id: %w", err)
		}
		pengajarKelasIDs = append(pengajarKelasIDs, id)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error saat iterasi pengajar kelas: %w", err)
	}

	if len(pengajarKelasIDs) == 0 {
		return &BulkUjianResult{SuccessCount: 0, TotalCount: 0}, nil
	}

	// 2. Tentukan urutan maksimum saat ini di antara semua pengajar_kelas yang terlibat
	urutanQuery := `
        SELECT COALESCE(MAX(urutan), 0) FROM (
            SELECT urutan FROM materi_pembelajaran WHERE pengajar_kelas_id = ANY($1)
            UNION ALL
            SELECT urutan FROM ujian WHERE pengajar_kelas_id = ANY($1)
        ) as combined
    `
	var maxUrutan sql.NullInt64
	if err := tx.QueryRowContext(ctx, urutanQuery, pq.Array(pengajarKelasIDs)).Scan(&maxUrutan); err != nil {
		return nil, fmt.Errorf("gagal mendapatkan urutan maksimum: %w", err)
	}

	// 3. Bangun query INSERT BULK
	var valueStrings []string
	var valueArgs []interface{}
	baseUrutan := int(maxUrutan.Int64)

	// Setiap entri baru mendapat urutan yang berurutan setelah max urutan global
	for i, pkID := range pengajarKelasIDs {
		newUrutan := baseUrutan + i + 1
		// Gunakan placeholder $N untuk menghindari SQL Injection
		valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d, $%d)", 3*i+1, 3*i+2, 3*i+3))
		valueArgs = append(valueArgs, pkID, input.NamaUjian, newUrutan)
	}

	bulkInsertQuery := fmt.Sprintf(`
        INSERT INTO ujian (pengajar_kelas_id, nama_ujian, urutan)
        VALUES %s
    `, strings.Join(valueStrings, ","))

	result, err := tx.ExecContext(ctx, bulkInsertQuery, valueArgs...)
	if err != nil {
		return nil, fmt.Errorf("gagal insert bulk ujian: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return &BulkUjianResult{
		SuccessCount: int(rowsAffected),
		TotalCount:   len(pengajarKelasIDs),
	}, nil
}

// --- Implementasi lainnya (GetAllRencanaPembelajaran, UpdateRencanaUrutan, CRUD Materi, CRUD Tujuan, CRUD Ujian) ---

func (r *postgresRepository) UpdateRencanaUrutan(ctx context.Context, schemaName string, orderedItems []RencanaUrutanItem) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	materiStmt, err := tx.PrepareContext(ctx, `UPDATE materi_pembelajaran SET urutan = $1, updated_at = NOW() WHERE id = $2`)
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement materi: %w", err)
	}
	defer materiStmt.Close()

	ujianStmt, err := tx.PrepareContext(ctx, `UPDATE ujian SET urutan = $1, updated_at = NOW() WHERE id = $2`)
	if err != nil {
		return fmt.Errorf("gagal mempersiapkan statement ujian: %w", err)
	}
	defer ujianStmt.Close()

	for i, item := range orderedItems {
		newUrutan := i + 1
		switch item.Type {
		case "materi":
			if _, err := materiStmt.ExecContext(ctx, newUrutan, item.ID); err != nil {
				return fmt.Errorf("gagal update urutan materi ID %d: %w", item.ID, err)
			}
		case "ujian":
			if _, err := ujianStmt.ExecContext(ctx, newUrutan, item.ID); err != nil {
				return fmt.Errorf("gagal update urutan ujian ID %d: %w", item.ID, err)
			}
		}
	}

	return tx.Commit()
}

func (r *postgresRepository) GetAllRencanaPembelajaran(ctx context.Context, schemaName string, pengajarKelasID string) ([]RencanaPembelajaranItem, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	query := `
        SELECT 'materi' as type, id, pengajar_kelas_id, nama_materi as nama, deskripsi, urutan FROM materi_pembelajaran WHERE pengajar_kelas_id = $1
        UNION ALL
        SELECT 'ujian' as type, id, pengajar_kelas_id, nama_ujian as nama, NULL as deskripsi, urutan FROM ujian WHERE pengajar_kelas_id = $1
        ORDER BY urutan ASC, type DESC
    `

	rows, err := r.db.QueryContext(ctx, query, pengajarKelasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query gabungan materi dan ujian: %w", err)
	}
	defer rows.Close()

	var items []RencanaPembelajaranItem
	materiMap := make(map[int]*RencanaPembelajaranItem)
	ujianMap := make(map[int]*RencanaPembelajaranItem)
	var tpIDs []int
	var ujianIDs []int

	for rows.Next() {
		var item RencanaPembelajaranItem
		if err := rows.Scan(&item.Type, &item.ID, &item.PengajarKelasID, &item.Nama, &item.Deskripsi, &item.Urutan); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	for i := range items {
		switch items[i].Type {
		case "materi":
			materiMap[items[i].ID] = &items[i]
		case "ujian":
			ujianMap[items[i].ID] = &items[i]
			ujianIDs = append(ujianIDs, items[i].ID)
		}
	}

	// Ambil tujuan pembelajaran untuk semua materi
	if len(materiMap) > 0 {
		materiIDs := make([]int, 0, len(materiMap))
		for id := range materiMap {
			materiIDs = append(materiIDs, id)
		}

		tpQuery := `
            SELECT id, materi_pembelajaran_id, deskripsi_tujuan, urutan
            FROM tujuan_pembelajaran
            WHERE materi_pembelajaran_id = ANY($1)
            ORDER BY urutan ASC, created_at ASC
        `
		tpRows, err := r.db.QueryContext(ctx, tpQuery, pq.Array(materiIDs))
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
			}
		}
	}

	// Ambil semua penilaian sumatif terkait (baik untuk TP maupun Ujian)
	if len(tpIDs) > 0 || len(ujianIDs) > 0 {
		penilaianSumatifQuery := `
            SELECT 
                ps.id, ps.tujuan_pembelajaran_id, ps.ujian_id, ps.jenis_ujian_id, ps.nama_penilaian, 
                ps.tanggal_pelaksanaan, ps.keterangan, ps.created_at, ps.updated_at,
                ju.nama_ujian, ju.kode_ujian
            FROM penilaian_sumatif ps
            JOIN jenis_ujian ju ON ps.jenis_ujian_id = ju.id
            WHERE ps.tujuan_pembelajaran_id = ANY($1) OR ps.ujian_id = ANY($2)
            ORDER BY ps.tanggal_pelaksanaan ASC, ps.created_at ASC
        `
		penilaianRows, err := r.db.QueryContext(ctx, penilaianSumatifQuery, pq.Array(tpIDs), pq.Array(ujianIDs))
		if err != nil {
			return nil, fmt.Errorf("gagal query penilaian sumatif: %w", err)
		}
		defer penilaianRows.Close()

		for penilaianRows.Next() {
			var ps penilaiansumatif.PenilaianSumatif
			if err := penilaianRows.Scan(
				&ps.ID, &ps.TujuanPembelajaranID, &ps.UjianID, &ps.JenisUjianID, &ps.NamaPenilaian,
				&ps.TanggalPelaksanaan, &ps.Keterangan, &ps.CreatedAt, &ps.UpdatedAt,
				&ps.NamaJenisUjian, &ps.KodeJenisUjian,
			); err != nil {
				return nil, err
			}

			if ps.TujuanPembelajaranID != nil {
				// Cari di semua materi -> tujuan
				for _, materi := range materiMap {
					for i, tp := range materi.TujuanPembelajaran {
						if tp.ID == *ps.TujuanPembelajaranID {
							materi.TujuanPembelajaran[i].PenilaianSumatif = append(materi.TujuanPembelajaran[i].PenilaianSumatif, ps)
						}
					}
				}
			} else if ps.UjianID != nil {
				if ujian, ok := ujianMap[*ps.UjianID]; ok {
					ujian.PenilaianSumatif = append(ujian.PenilaianSumatif, ps)
				}
			}
		}
	}

	return items, nil
}

func (r *postgresRepository) UpdateUrutanTujuan(ctx context.Context, schemaName string, orderedIDs []int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

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
	var deskripsi sql.NullString // Digunakan untuk menampung kolom NULLABLE saat RETURNING
	if err := row.Scan(&m.ID, &m.PengajarKelasID, &m.NamaMateri, &deskripsi, &m.Urutan, &m.CreatedAt, &m.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data materi setelah dibuat: %w", err)
	}

	// FIX: Cek validitas dan inisialisasi pointer (*string) dengan benar
	if deskripsi.Valid {
		m.Deskripsi = new(string)
		*m.Deskripsi = deskripsi.String
	} else {
		m.Deskripsi = nil
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	m.TujuanPembelajaran = []TujuanPembelajaran{}
	return &m, nil
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

// --- CRUD UJIAN ---

func (r *postgresRepository) CreateUjian(ctx context.Context, schemaName string, input UpsertUjianInput) (*Ujian, error) {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return nil, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	var maxUrutan sql.NullInt64
	urutanQuery := `
        SELECT COALESCE(MAX(urutan), 0) FROM (
            SELECT urutan FROM materi_pembelajaran WHERE pengajar_kelas_id = $1
            UNION ALL
            SELECT urutan FROM ujian WHERE pengajar_kelas_id = $1
        ) as combined
    `
	if err := tx.QueryRowContext(ctx, urutanQuery, input.PengajarKelasID).Scan(&maxUrutan); err != nil {
		return nil, fmt.Errorf("gagal mendapatkan urutan maksimum: %w", err)
	}

	nextUrutan := int(maxUrutan.Int64) + 1

	query := `
        INSERT INTO ujian (pengajar_kelas_id, nama_ujian, urutan)
        VALUES ($1, $2, $3)
        RETURNING id, pengajar_kelas_id, nama_ujian, urutan, created_at, updated_at
    `
	row := tx.QueryRowContext(ctx, query, input.PengajarKelasID, input.NamaUjian, nextUrutan)

	var u Ujian
	if err := row.Scan(&u.ID, &u.PengajarKelasID, &u.NamaUjian, &u.Urutan, &u.CreatedAt, &u.UpdatedAt); err != nil {
		return nil, fmt.Errorf("gagal memindai data ujian setelah dibuat: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return &u, nil
}

func (r *postgresRepository) UpdateUjian(ctx context.Context, schemaName string, id int, input UpsertUjianInput) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	query := `UPDATE ujian SET nama_ujian = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, input.NamaUjian, id)
	return err
}

func (r *postgresRepository) DeleteUjian(ctx context.Context, schemaName string, id int) error {
	if err := r.setSchema(ctx, schemaName); err != nil {
		return err
	}
	// Note: Penghapusan ujian tidak memerlukan reorder seperti Materi/Tujuan karena reorder Ujian/Materi dilakukan pada level rencana gabungan.
	_, err := r.db.ExecContext(ctx, "DELETE FROM ujian WHERE id = $1", id)
	return err
}
