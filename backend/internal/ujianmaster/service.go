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

// Service defines the business logic for UjianMaster.
type Service interface {
	CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error)
	GetAllUjianMasterByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error)
	GetUjianMasterByID(ctx context.Context, schemaName string, id string) (UjianMasterDetail, error)
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

// --- EXCEL EXPORT/IMPORT METHODS ---

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

// --- GENERATE NOMOR UJIAN SERVICE METHOD ---
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

// --- OTHER SERVICE METHODS ---

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
