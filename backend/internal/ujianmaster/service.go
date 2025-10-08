package ujianmaster

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"skoola/internal/rombel"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

// SeatingAssignment is a helper struct for batch seating updates.
type SeatingAssignment struct {
	PesertaID        uuid.UUID
	AlokasiRuanganID uuid.UUID
	NomorKursi       string
}

// Service defines the business logic for UjianMaster.
type Service interface {
	CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error)
	GetAllUjianMasterByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error)
	GetUjianMasterByID(ctx context.Context, schemaName string, id string) (UjianMasterDetail, error)
	// FIX: Mengoreksi typo pada signature Service
	UpdateUjianMaster(ctx context.Context, schemaName string, id string, req UjianMaster) (UjianMaster, error)
	DeleteUjianMaster(ctx context.Context, schemaName string, id string) error
	AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID string, pengajarKelasIDs []string) (int, error)
	GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error)
	AddPesertaFromKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int, error)
	RemovePesertaByKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int64, error)
	GenerateNomorUjianForUjianMaster(ctx context.Context, schemaName string, ujianMasterID string, prefix string) (int, error)

	// Excel Export/Import methods
	ExportPesertaToExcel(ctx context.Context, schemaName string, ujianMasterID string, format string) ([]byte, string, error)
	ImportPesertaFromExcel(ctx context.Context, schemaName string, ujianMasterID string, fileData []byte) (ExcelImportResponse, error)

	// --- NEW: ROOM MASTER CRUD ---
	CreateRuangan(ctx context.Context, schemaName string, input UpsertRuanganInput) (RuanganUjian, error)
	GetAllRuangan(ctx context.Context, schemaName string) ([]RuanganUjian, error)
	UpdateRuangan(ctx context.Context, schemaName string, ruanganID string, input UpsertRuanganInput) (RuanganUjian, error)
	DeleteRuangan(ctx context.Context, schemaName string, ruanganID string) error

	// --- NEW: ROOM ALLOCATION & SEATING ---
	AssignRuangan(ctx context.Context, schemaName string, ujianMasterID string, ruanganIDs []string) ([]AlokasiRuanganUjian, error)
	GetAlokasiRuanganByMasterID(ctx context.Context, schemaName string, ujianMasterID string) ([]AlokasiRuanganUjian, error)
	RemoveAlokasiRuangan(ctx context.Context, schemaName string, alokasiRuanganID string) error

	// Phase 1: Get data for visual layout
	GetAlokasiKursi(ctx context.Context, schemaName string, ujianMasterID string) ([]PesertaUjianDetail, []AlokasiRuanganUjian, error)
	UpdatePesertaSeating(ctx context.Context, schemaName string, input UpdatePesertaSeatingInput) error

	// Phase 3: Smart distribution
	DistributePesertaSmart(ctx context.Context, schemaName string, ujianMasterID string) error

	// --- NEW: KARTU UJIAN METHODS ---
	GetKartuUjianFilters(ctx context.Context, schemaName string, ujianMasterID string) ([]KartuUjianKelasFilter, error)
	GetKartuUjianData(ctx context.Context, schemaName string, ujianMasterID string, rombelID string) ([]KartuUjianDetail, error)
	GenerateKartuUjianPDF(ctx context.Context, schemaName string, ujianMasterID string, pesertaIDs []uint) ([]byte, error)
}

type service struct {
	repo          Repository
	rombelService rombel.Service
}

// NewService creates a new UjianMaster service.
func NewService(repo Repository, rombelService rombel.Service) Service {
	return &service{
		repo:          repo,
		rombelService: rombelService,
	}
}

// =================================================================================
// KARTU UJIAN METHODS (NEW) - MENGGUNAKAN STRING ID UNTUK KONSISTENSI
// =================================================================================

// GetKartuUjianFilters returns a list of unique rombels for filtering Kartu Ujian.
func (s *service) GetKartuUjianFilters(ctx context.Context, schemaName string, ujianMasterID string) ([]KartuUjianKelasFilter, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		// Mengasumsikan ID dari handler adalah UUID yang di-string.
		return nil, errors.New("ID paket ujian tidak valid (harus UUID)")
	}

	return s.repo.GetUniqueRombelIDs(ctx, schemaName, umID)
}

// GetKartuUjianData fetches all necessary data for exam card printing.
func (s *service) GetKartuUjianData(ctx context.Context, schemaName string, ujianMasterID, rombelID string) ([]KartuUjianDetail, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, errors.New("ID paket ujian tidak valid (harus UUID)")
	}

	var rombelUUID uuid.UUID
	if rombelID != "" && rombelID != "0" {
		// Asumsi frontend mengirim ID kelas sebagai string (UUID)
		rombelUUID, err = uuid.Parse(rombelID)
		if err != nil {
			return nil, errors.New("ID rombel tidak valid")
		}
	} else {
		rombelUUID = uuid.Nil // Tidak ada filter rombel
	}

	return s.repo.GetKartuUjianData(ctx, schemaName, umID, rombelUUID, nil)
}

// GenerateKartuUjianPDF generates and downloads the PDF for selected participants.
func (s *service) GenerateKartuUjianPDF(ctx context.Context, schemaName string, ujianMasterID string, pesertaIDs []uint) ([]byte, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, errors.New("ID paket ujian tidak valid (harus UUID)")
	}

	// FIX: Menghapus deklarasi pesertaUUIDs yang tidak terpakai

	// Catatan: Karena implementasi repository saat ini menggunakan UUID,
	// dan frontend menggunakan number/uint untuk ID Peserta, array pesertaIDs diabaikan
	// dan akan dipanggil dengan nil. FUNGSI INI HARUS DIPERBAIKI SECARA FUNDAMENTAL
	// JIKA INGIN MENGGUNAKAN PESERTA ID SPESIFIK.

	// Dalam konteks ini, kita asumsikan repository dapat memproses filtering berdasarkan nil.
	data, err := s.repo.GetKartuUjianData(ctx, schemaName, umID, uuid.Nil, nil)
	if err != nil {
		return nil, err
	}

	// 2. Validasi Kesiapan Cetak (Menggunakan data yang terambil)
	for _, d := range data {
		if !d.IsDataLengkap {
			return nil, fmt.Errorf("data peserta %s (ID: %d) belum lengkap: No. Ujian atau Ruangan kosong", d.NamaSiswa, d.ID)
		}
	}

	// 3. --- LOGIKA GENERASI PDF (MOCK) ---
	pdfContent := fmt.Sprintf("PDF Kartu Ujian untuk %d peserta dari Ujian Master ID: %s. Daftar Peserta: ", len(data), ujianMasterID)
	for _, d := range data {
		pdfContent += fmt.Sprintf("[%s/%s (%s, K%s)] ", d.NamaSiswa, d.NoUjian, d.NamaRuangan, d.NomorKursi)
	}

	return []byte(pdfContent), nil
}

// =================================================================================
// ROOM MASTER CRUD METHODS (NEW)
// =================================================================================

func (s *service) CreateRuangan(ctx context.Context, schemaName string, input UpsertRuanganInput) (RuanganUjian, error) {
	// Pengecekan input validasi dilakukan di layer handler
	ruangan := RuanganUjian{
		ID:             uuid.New(),
		NamaRuangan:    input.NamaRuangan,
		Kapasitas:      input.Kapasitas,
		LayoutMetadata: input.LayoutMetadata,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	createdRuangan, err := s.repo.CreateRuangan(ctx, schemaName, ruangan)
	if err != nil {
		return RuanganUjian{}, fmt.Errorf("gagal membuat ruangan: %w", err)
	}

	return createdRuangan, nil
}

func (s *service) GetAllRuangan(ctx context.Context, schemaName string) ([]RuanganUjian, error) {
	return s.repo.GetAllRuangan(ctx, schemaName)
}

func (s *service) UpdateRuangan(ctx context.Context, schemaName string, ruanganID string, input UpsertRuanganInput) (RuanganUjian, error) {
	rID, err := uuid.Parse(ruanganID)
	if err != nil {
		return RuanganUjian{}, errors.New("ID ruangan tidak valid")
	}

	// Cek keberadaan ruangan (Opsional, tapi disarankan)
	// _, err = s.repo.GetRuanganByID(ctx, schemaName, rID)
	// if err != nil {
	//  return RuanganUjian{}, errors.New("ruangan tidak ditemukan")
	// }

	ruangan := RuanganUjian{
		ID:             rID,
		NamaRuangan:    input.NamaRuangan,
		Kapasitas:      input.Kapasitas,
		LayoutMetadata: input.LayoutMetadata,
		UpdatedAt:      time.Now(),
	}

	updatedRuangan, err := s.repo.UpdateRuangan(ctx, schemaName, ruangan)
	if err != nil {
		return RuanganUjian{}, fmt.Errorf("gagal memperbarui ruangan: %w", err)
	}

	return updatedRuangan, nil
}

func (s *service) DeleteRuangan(ctx context.Context, schemaName string, ruanganID string) error {
	rID, err := uuid.Parse(ruanganID)
	if err != nil {
		return errors.New("ID ruangan tidak valid")
	}

	// Cek apakah ruangan sedang dialokasikan untuk ujian
	// ... (Implementasi pengecekan di repository)

	return s.repo.DeleteRuangan(ctx, schemaName, rID)
}

// =================================================================================
// ROOM ALLOCATION & SEATING METHODS (NEW)
// =================================================================================

func (s *service) AssignRuangan(ctx context.Context, schemaName string, ujianMasterID string, ruanganIDs []string) ([]AlokasiRuanganUjian, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, errors.New("ID paket ujian tidak valid")
	}

	if len(ruanganIDs) == 0 {
		return nil, errors.New("daftar ruangan tidak boleh kosong")
	}

	ruanganUUIDs := make([]uuid.UUID, len(ruanganIDs))
	for i, id := range ruanganIDs {
		rID, err := uuid.Parse(id)
		if err != nil {
			return nil, fmt.Errorf("ID ruangan ke-%d tidak valid: %w", i+1, err)
		}
		ruanganUUIDs[i] = rID
	}

	alokasi, err := s.repo.CreateAlokasiRuanganBatch(ctx, schemaName, umID, ruanganUUIDs)
	if err != nil {
		return nil, fmt.Errorf("gagal mengalokasikan ruangan: %w", err)
	}

	return alokasi, nil
}

func (s *service) GetAlokasiRuanganByMasterID(ctx context.Context, schemaName string, ujianMasterID string) ([]AlokasiRuanganUjian, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, errors.New("ID paket ujian tidak valid")
	}

	return s.repo.GetAlokasiRuanganByUjianMasterID(ctx, schemaName, umID)
}

func (s *service) RemoveAlokasiRuangan(ctx context.Context, schemaName string, alokasiRuanganID string) error {
	arID, err := uuid.Parse(alokasiRuanganID)
	if err != nil {
		return errors.New("ID alokasi ruangan tidak valid")
	}

	// Tambahkan logika untuk membersihkan penempatan peserta (kursi) yang terkait
	if err := s.repo.ClearSeatingByAlokasiRuanganID(ctx, schemaName, arID); err != nil {
		// Log error tapi biarkan proses berlanjut, atau return error
		// Di sini, kita akan return error.
		return fmt.Errorf("gagal membersihkan penempatan kursi: %w", err)
	}

	// Panggil RecalculateAlokasiKursiCount setelah penghapusan
	// Pertama, cari tahu ujianMasterID dari alokasi yang dihapus (tidak ada di repo layer saat ini, jadi kita harus mengasumsikan ini dilakukan di transaction/logika yang lebih tinggi)
	// Untuk tujuan implementasi tutorial, kita asumsikan Recalculate akan dipanggil secara terpisah atau setelah operasi ini selesai (namun seharusnya ada mekanisme pemicu yang lebih baik di aplikasi nyata).

	// Namun, jika alokasi berhasil dihapus, kita tidak perlu Recalculate karena `jumlah_kursi_terpakai` akan otomatis tidak relevan atau harus di-0-kan untuk alokasi tersebut.
	// Logic Recalculate lebih penting di DistributeSmart.
	return s.repo.DeleteAlokasiRuangan(ctx, schemaName, arID)
}

func (s *service) GetAlokasiKursi(ctx context.Context, schemaName string, ujianMasterID string) ([]PesertaUjianDetail, []AlokasiRuanganUjian, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, nil, errors.New("ID paket ujian tidak valid")
	}

	// 1. Ambil semua peserta ujian (dengan info kelas/detail)
	peserta, err := s.repo.FindPesertaDetailByUjianIDWithSeating(ctx, schemaName, umID)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil peserta: %w", err)
	}

	// 2. Ambil semua alokasi ruangan (dengan info ruangan master)
	alokasiRuangan, err := s.repo.GetAlokasiRuanganByUjianMasterID(ctx, schemaName, umID)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal mengambil alokasi ruangan: %w", err)
	}

	return peserta, alokasiRuangan, nil
}

func (s *service) UpdatePesertaSeating(ctx context.Context, schemaName string, input UpdatePesertaSeatingInput) error {
	pID, err := uuid.Parse(input.PesertaID)
	if err != nil {
		return errors.New("ID peserta tidak valid")
	}
	arID, err := uuid.Parse(input.AlokasiRuanganID)
	if err != nil {
		return errors.New("ID alokasi ruangan tidak valid")
	}

	return s.repo.UpdatePesertaSeating(ctx, schemaName, pID, arID, input.NomorKursi)
}

func (s *service) DistributePesertaSmart(ctx context.Context, schemaName string, ujianMasterID string) error {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return errors.New("ID paket ujian tidak valid")
	}

	// 1. Ambil data semua peserta, alokasi ruangan, dan kapasitas total
	peserta, err := s.repo.FindAllPesertaByUjianID(ctx, schemaName, umID)
	if err != nil {
		return fmt.Errorf("gagal mengambil peserta: %w", err)
	}

	alokasiRuangan, err := s.repo.GetAlokasiRuanganByUjianMasterID(ctx, schemaName, umID)
	if err != nil {
		return fmt.Errorf("gagal mengambil alokasi ruangan: %w", err)
	}

	// Cek ketersediaan
	totalKapasitas := 0
	for _, ar := range alokasiRuangan {
		totalKapasitas += ar.KapasitasRuangan
	}

	if len(peserta) > totalKapasitas {
		return errors.New("jumlah peserta melebihi total kapasitas ruangan yang dialokasikan")
	}
	if len(alokasiRuangan) == 0 {
		return errors.New("belum ada ruangan yang dialokasikan")
	}

	// 2. Clear semua penempatan kursi yang ada
	if err := s.repo.ClearAllSeatingByUjianMasterID(ctx, schemaName, umID); err != nil {
		return fmt.Errorf("gagal membersihkan penempatan lama: %w", err)
	}

	// 3. Implementasi Algoritma Cerdas
	var assignments []SeatingAssignment
	pesertaIndex := 0

	for _, ar := range alokasiRuangan {
		kursiDiisi := 0
		for kursi := 1; kursi <= ar.KapasitasRuangan && pesertaIndex < len(peserta); kursi++ {
			// Asumsi penomoran kursi sederhana: "K01", "K02", dst.
			nomorKursi := fmt.Sprintf("K%03d", kursi)

			assignments = append(assignments, SeatingAssignment{
				PesertaID:        peserta[pesertaIndex].ID,
				AlokasiRuanganID: ar.ID,
				NomorKursi:       nomorKursi,
			})
			pesertaIndex++
			kursiDiisi++
		}
		// Update jumlah kursi terpakai di AlokasiRuanganUjian (Opsional)
		// ...
	}

	// 4. Lakukan update batch ke database
	// Casting/konversi ke tipe struct anonim yang diterima oleh Repository
	repoAssignments := make([]struct {
		PesertaID        uuid.UUID
		AlokasiRuanganID uuid.UUID
		NomorKursi       string
	}, len(assignments))

	for i, a := range assignments {
		repoAssignments[i] = struct {
			PesertaID        uuid.UUID
			AlokasiRuanganID uuid.UUID
			NomorKursi       string
		}{
			PesertaID:        a.PesertaID,
			AlokasiRuanganID: a.AlokasiRuanganID,
			NomorKursi:       a.NomorKursi,
		}
	}

	err = s.repo.UpdatePesertaSeatingBatch(ctx, schemaName, repoAssignments)
	if err != nil {
		return fmt.Errorf("gagal menyimpan penempatan kursi cerdas: %w", err)
	}

	// [BARU] 5. Hitung ulang counter alokasi ruangan setelah seating selesai
	// umID sudah tersedia sebagai tipe uuid.UUID
	err = s.repo.RecalculateAlokasiKursiCount(ctx, schemaName, umID)
	if err != nil {
		// Ini adalah langkah kritis untuk sinkronisasi data tampilan.
		return fmt.Errorf("gagal sinkronisasi counter kursi: %w", err)
	}

	// 6. Return sukses
	return nil
}

// =================================================================================
// EXCEL EXPORT/IMPORT METHODS
// =================================================================================

func (s *service) ExportPesertaToExcel(ctx context.Context, schemaName string, ujianMasterID string, format string) ([]byte, string, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return nil, "", errors.New("ID paket ujian tidak valid")
	}

	// Get peserta data
	peserta, err := s.repo.FindPesertaByUjianID(ctx, schemaName, umID)
	if err != nil {
		return nil, "", fmt.Errorf("gagal mengambil data peserta: %w", err)
	}

	// Convert to Excel format
	excelData := make([]PesertaUjianExcelRow, len(peserta))
	for i, p := range peserta {
		status := "Belum Ada Nomor"
		if p.NomorUjian != nil && *p.NomorUjian != "" {
			status = "Sudah Ada Nomor"
		}

		excelData[i] = PesertaUjianExcelRow{
			No:          i + 1,
			NamaLengkap: p.NamaSiswa,
			NISN:        p.NISN,
			NamaKelas:   p.NamaKelas,
			NomorUjian:  p.NomorUjian,
			Status:      status,
		}
	}

	if format == "csv" {
		return s.generateCSV(excelData)
	} else {
		return s.generateExcel(excelData)
	}
}

func (s *service) generateExcel(data []PesertaUjianExcelRow) ([]byte, string, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheetName := "Peserta Ujian"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, "", err
	}

	// Headers
	headers := []string{"No", "Nama Lengkap", "NISN", "Kelas", "Nomor Ujian", "Status"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
	}

	// Data
	for i, row := range data {
		rowNum := i + 2
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), row.No)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), row.NamaLengkap)

		nisn := ""
		if row.NISN != nil {
			nisn = *row.NISN
		}
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), nisn)

		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), row.NamaKelas)

		nomorUjian := ""
		if row.NomorUjian != nil {
			nomorUjian = *row.NomorUjian
		}
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), nomorUjian)

		f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), row.Status)
	}

	// Style headers
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"CCCCCC"}, Pattern: 1},
	})
	f.SetCellStyle(sheetName, "A1", "F1", headerStyle)

	// Auto-width columns
	f.SetColWidth(sheetName, "A", "A", 5)
	f.SetColWidth(sheetName, "B", "B", 30)
	f.SetColWidth(sheetName, "C", "C", 15)
	f.SetColWidth(sheetName, "D", "D", 15)
	f.SetColWidth(sheetName, "E", "E", 15)
	f.SetColWidth(sheetName, "F", "F", 20)

	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	buffer, err := f.WriteToBuffer()
	if err != nil {
		return nil, "", err
	}

	return buffer.Bytes(), "peserta_ujian.xlsx", nil
}

func (s *service) generateCSV(data []PesertaUjianExcelRow) ([]byte, string, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Headers
	headers := []string{"No", "Nama Lengkap", "NISN", "Kelas", "Nomor Ujian", "Status"}
	writer.Write(headers)

	// Data
	for _, row := range data {
		record := make([]string, 6)
		record[0] = fmt.Sprintf("%d", row.No)
		record[1] = row.NamaLengkap

		if row.NISN != nil {
			record[2] = *row.NISN
		}

		record[3] = row.NamaKelas

		if row.NomorUjian != nil {
			record[4] = *row.NomorUjian
		}

		record[5] = row.Status

		writer.Write(record)
	}

	writer.Flush()
	return buf.Bytes(), "peserta_ujian.csv", nil
}

func (s *service) ImportPesertaFromExcel(ctx context.Context, schemaName string, ujianMasterID string, fileData []byte) (ExcelImportResponse, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return ExcelImportResponse{}, errors.New("ID paket ujian tidak valid")
	}

	// Parse Excel file
	f, err := excelize.OpenReader(bytes.NewReader(fileData))
	if err != nil {
		return ExcelImportResponse{}, fmt.Errorf("gagal membaca file Excel: %w", err)
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return ExcelImportResponse{}, errors.New("file Excel kosong")
	}

	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return ExcelImportResponse{}, fmt.Errorf("gagal membaca data Excel: %w", err)
	}

	if len(rows) < 2 {
		return ExcelImportResponse{}, errors.New("file Excel harus memiliki minimal header + 1 data")
	}

	// Skip header row
	dataRows := rows[1:]
	var errorRows []ExcelImportErrorRow
	var validUpdates []struct {
		NamaLengkap string
		NomorUjian  string
	}

	for i, row := range dataRows {
		rowNum := i + 2 // +2 because we start from row 1 and skip header

		if len(row) < 5 {
			errorRows = append(errorRows, ExcelImportErrorRow{
				Row:         rowNum,
				Error:       "Data tidak lengkap (minimal 5 kolom)",
				NamaLengkap: "",
			})
			continue
		}

		namaLengkap := strings.TrimSpace(row[1])
		nomorUjian := strings.TrimSpace(row[4])

		if namaLengkap == "" {
			errorRows = append(errorRows, ExcelImportErrorRow{
				Row:         rowNum,
				Error:       "Nama lengkap tidak boleh kosong",
				NamaLengkap: namaLengkap,
			})
			continue
		}

		if nomorUjian == "" {
			errorRows = append(errorRows, ExcelImportErrorRow{
				Row:         rowNum,
				Error:       "Nomor ujian tidak boleh kosong",
				NamaLengkap: namaLengkap,
			})
			continue
		}

		validUpdates = append(validUpdates, struct {
			NamaLengkap string
			NomorUjian  string
		}{
			NamaLengkap: namaLengkap,
			NomorUjian:  nomorUjian,
		})
	}

	// Update database
	updatedCount := 0
	if len(validUpdates) > 0 {
		count, err := s.repo.UpdatePesertaNomorUjianFromExcel(ctx, schemaName, umID, validUpdates)
		if err != nil {
			return ExcelImportResponse{}, fmt.Errorf("gagal update database: %w", err)
		}
		updatedCount = count
	}

	response := ExcelImportResponse{
		Message:      fmt.Sprintf("Import selesai. %d data berhasil diupdate, %d error", updatedCount, len(errorRows)),
		UpdatedCount: updatedCount,
		ErrorRows:    errorRows,
	}

	return response, nil
}

// =================================================================================
// GENERATE NOMOR UJIAN SERVICE METHOD
// =================================================================================

func (s *service) GenerateNomorUjianForUjianMaster(ctx context.Context, schemaName string, ujianMasterID string, prefix string) (int, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	// ✅ ALLOW EMPTY PREFIX - no validation needed
	if len(prefix) > 10 {
		return 0, errors.New("prefix terlalu panjang, maksimal 10 karakter")
	}

	// Call repository to generate
	count, err := s.repo.GenerateNomorUjianForUjianMaster(ctx, schemaName, umID, prefix)
	if err != nil {
		return 0, fmt.Errorf("gagal generate nomor ujian: %w", err)
	}

	return count, nil
}

// =================================================================================
// OTHER CORE SERVICE METHODS
// =================================================================================

func (s *service) RemovePesertaByKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int64, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	if kelasID == "" {
		return 0, errors.New("ID kelas tidak boleh kosong")
	}

	kelasUUID, err := uuid.Parse(kelasID)
	if err != nil {
		return 0, errors.New("ID kelas tidak valid")
	}

	rowsAffected, err := s.repo.DeletePesertaByMasterAndKelas(ctx, schemaName, umID, kelasUUID)
	if err != nil {
		return 0, fmt.Errorf("gagal menghapus peserta ujian: %w", err)
	}

	return rowsAffected, nil
}

func (s *service) AddPesertaFromKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	kelasUUID, err := uuid.Parse(kelasID)
	if err != nil {
		return 0, errors.New("ID kelas tidak valid")
	}

	anggota, err := s.rombelService.GetAllAnggotaByKelas(ctx, schemaName, kelasID)
	if err != nil {
		return 0, fmt.Errorf("gagal mengambil anggota kelas: %w", err)
	}

	if len(anggota) == 0 {
		return 0, nil
	}

	peserta := make([]PesertaUjian, len(anggota))
	now := time.Now()
	for i, anggotaKelas := range anggota {
		anggotaID, _ := uuid.Parse(anggotaKelas.ID)
		peserta[i] = PesertaUjian{
			ID:             uuid.New(),
			UjianMasterID:  umID,
			AnggotaKelasID: anggotaID,
			KelasID:        kelasUUID,
			Urutan:         anggotaKelas.Urutan,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
	}

	if err := s.repo.CreatePesertaUjianBatch(ctx, schemaName, peserta); err != nil {
		return 0, fmt.Errorf("gagal membuat data peserta ujian: %w", err)
	}

	return len(peserta), nil
}

// CreateUjianMaster handles the creation of a new UjianMaster.
func (s *service) CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error) {
	createdUM, err := s.repo.Create(ctx, schemaName, req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal membuat paket ujian di service: %w", err)
	}
	return createdUM, nil
}

// GetAllUjianMasterByTahunAjaran retrieves all UjianMasters for a given academic year.
func (s *service) GetAllUjianMasterByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error) {
	taID, err := uuid.Parse(tahunAjaranID)
	if err != nil {
		return nil, errors.New("ID tahun ajaran tidak valid")
	}
	return s.repo.GetAllByTahunAjaran(ctx, schemaName, taID)
}

// GetUjianMasterByID retrieves details of a specific UjianMaster.
func (s *service) GetUjianMasterByID(ctx context.Context, schemaName string, id string) (UjianMasterDetail, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMasterDetail{}, errors.New("ID paket ujian tidak valid")
	}

	ujianMaster, err := s.repo.GetByID(ctx, schemaName, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	penugasan, err := s.repo.GetPenugasanByUjianMasterID(ctx, schemaName, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	availableKelas, err := s.repo.GetAvailableKelasForUjian(ctx, schemaName, ujianMaster.TahunAjaranID, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	detail := UjianMasterDetail{
		Detail:         ujianMaster,
		Penugasan:      penugasan,
		AvailableKelas: availableKelas,
	}

	return detail, nil
}

// UpdateUjianMaster handles the update of an existing UjianMaster.
func (s *service) UpdateUjianMaster(ctx context.Context, schemaName string, id string, req UjianMaster) (UjianMaster, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMaster{}, errors.New("ID paket ujian tidak valid")
	}

	existing, err := s.repo.GetByID(ctx, schemaName, umID)
	if err != nil {
		return UjianMaster{}, errors.New("paket ujian tidak ditemukan untuk diperbarui")
	}

	req.ID = umID
	req.TahunAjaranID = existing.TahunAjaranID

	updatedUM, err := s.repo.Update(ctx, schemaName, req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal memperbarui paket ujian di service: %w", err)
	}

	return updatedUM, nil
}

// DeleteUjianMaster handles the deletion of an UjianMaster.
func (s *service) DeleteUjianMaster(ctx context.Context, schemaName string, id string) error {
	umID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("ID paket ujian tidak valid")
	}
	return s.repo.Delete(ctx, schemaName, umID)
}

func (s *service) AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID string, pengajarKelasIDs []string) (int, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	if _, err := s.repo.AssignKelasToUjian(ctx, schemaName, umID, pengajarKelasIDs); err != nil {
		return 0, fmt.Errorf("gagal menugaskan kelas ke ujian: %w", err)
	}

	return len(pengajarKelasIDs), nil
}

// GetPesertaUjianByUjianID mengambil dan mengelompokkan data peserta berdasarkan kelas.
func (s *service) GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error) {
	uid, err := uuid.Parse(ujianID)
	if err != nil {
		return nil, errors.New("ID ujian tidak valid")
	}

	peserta, err := s.repo.FindPesertaByUjianID(ctx, schemaName, uid)
	if err != nil {
		return nil, err
	}

	grouped := make(GroupedPesertaUjian)
	for _, p := range peserta {
		namaKelas := p.NamaKelas
		grouped[namaKelas] = append(grouped[namaKelas], p)
	}

	return grouped, nil
}
