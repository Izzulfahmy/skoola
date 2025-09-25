// file: backend/internal/student/service.go
package student

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

var ErrValidation = errors.New("validation failed")

type CreateStudentInput struct {
	NIS             string `json:"nis" validate:"omitempty,numeric"`
	NISN            string `json:"nisn" validate:"omitempty,numeric"`
	NamaLengkap     string `json:"nama_lengkap" validate:"required,min=1"`
	NamaPanggilan   string `json:"nama_panggilan" validate:"omitempty"`
	JenisKelamin    string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir     string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir    string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama           string `json:"agama" validate:"omitempty,oneof=Islam 'Kristen Protestan' 'Kristen Katolik' Hindu Buddha Khonghucu Lainnya"`
	Kewarganegaraan string `json:"kewarganegaraan" validate:"omitempty"`
	AlamatLengkap   string `json:"alamat_lengkap" validate:"omitempty"`
	DesaKelurahan   string `json:"desa_kelurahan" validate:"omitempty"`
	Kecamatan       string `json:"kecamatan" validate:"omitempty"`
	KotaKabupaten   string `json:"kota_kabupaten" validate:"omitempty"`
	Provinsi        string `json:"provinsi" validate:"omitempty"`
	KodePos         string `json:"kode_pos" validate:"omitempty,numeric"`
	NamaAyah        string `json:"nama_ayah" validate:"omitempty"`
	PekerjaanAyah   string `json:"pekerjaan_ayah" validate:"omitempty"`
	AlamatAyah      string `json:"alamat_ayah" validate:"omitempty"`
	NamaIbu         string `json:"nama_ibu" validate:"omitempty"`
	PekerjaanIbu    string `json:"pekerjaan_ibu" validate:"omitempty"`
	AlamatIbu       string `json:"alamat_ibu" validate:"omitempty"`
	NamaWali        string `json:"nama_wali" validate:"omitempty"`
	PekerjaanWali   string `json:"pekerjaan_wali" validate:"omitempty"`
	AlamatWali      string `json:"alamat_wali" validate:"omitempty"`
	NomorKontakWali string `json:"nomor_kontak_wali" validate:"omitempty,numeric"`
}

type UpdateStudentInput struct {
	NIS             string `json:"nis" validate:"omitempty,numeric"`
	NISN            string `json:"nisn" validate:"omitempty,numeric"`
	NamaLengkap     string `json:"nama_lengkap" validate:"required,min=1"`
	NamaPanggilan   string `json:"nama_panggilan" validate:"omitempty"`
	JenisKelamin    string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir     string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir    string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama           string `json:"agama" validate:"omitempty,oneof=Islam 'Kristen Protestan' 'Kristen Katolik' Hindu Buddha Khonghucu Lainnya"`
	Kewarganegaraan string `json:"kewarganegaraan" validate:"omitempty"`
	AlamatLengkap   string `json:"alamat_lengkap" validate:"omitempty"`
	DesaKelurahan   string `json:"desa_kelurahan" validate:"omitempty"`
	Kecamatan       string `json:"kecamatan" validate:"omitempty"`
	KotaKabupaten   string `json:"kota_kabupaten" validate:"omitempty"`
	Provinsi        string `json:"provinsi" validate:"omitempty"`
	KodePos         string `json:"kode_pos" validate:"omitempty,numeric"`
	NamaAyah        string `json:"nama_ayah" validate:"omitempty"`
	PekerjaanAyah   string `json:"pekerjaan_ayah" validate:"omitempty"`
	AlamatAyah      string `json:"alamat_ayah" validate:"omitempty"`
	NamaIbu         string `json:"nama_ibu" validate:"omitempty"`
	PekerjaanIbu    string `json:"pekerjaan_ibu" validate:"omitempty"`
	AlamatIbu       string `json:"alamat_ibu" validate:"omitempty"`
	NamaWali        string `json:"nama_wali" validate:"omitempty"`
	PekerjaanWali   string `json:"pekerjaan_wali" validate:"omitempty"`
	AlamatWali      string `json:"alamat_wali" validate:"omitempty"`
	NomorKontakWali string `json:"nomor_kontak_wali" validate:"omitempty,numeric"`
}

type Service interface {
	Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error)
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetAvailableStudentsByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Student, error)
	GenerateStudentImportTemplate(ctx context.Context, schemaName string) (*bytes.Buffer, error)
	ImportStudents(ctx context.Context, schemaName string, file io.Reader) (*ImportResult, error)
}

type service struct {
	repo        Repository
	historyRepo HistoryRepository
	validate    *validator.Validate
	db          *sql.DB
}

func NewService(repo Repository, historyRepo HistoryRepository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:        repo,
		historyRepo: historyRepo,
		validate:    validate,
		db:          db,
	}
}

func (s *service) GenerateStudentImportTemplate(ctx context.Context, schemaName string) (*bytes.Buffer, error) {
	f := excelize.NewFile()
	sheetName := "Data Siswa"
	index, _ := f.NewSheet(sheetName)
	f.SetActiveSheet(index)

	headers := []string{
		"nis", "nisn", "nama_lengkap", "nama_panggilan", "jenis_kelamin", "tempat_lahir", "tanggal_lahir",
		"agama", "kewarganegaraan", "alamat_lengkap", "desa_kelurahan", "kecamatan", "kota_kabupaten", "provinsi",
		"kode_pos", "nama_ayah", "pekerjaan_ayah", "alamat_ayah", "nama_ibu", "pekerjaan_ibu", "alamat_ibu",
		"nama_wali", "pekerjaan_wali", "alamat_wali", "nomor_kontak_wali",
	}

	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
	}

	style, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#FFFF00"}, Pattern: 1},
	})
	f.SetCellStyle(sheetName, "C1", "C1", style)

	example := []interface{}{
		"12345", "0012345678", "Budi Santoso", "Budi", "Laki-laki", "Jakarta", "2010-05-15",
		"Islam", "Indonesia", "Jl. Merdeka No. 10", "Cijantung", "Pasar Rebo", "Jakarta Timur",
		"DKI Jakarta", "13770", "Ahmad Santoso", "PNS", "Jl. Merdeka No. 10", "Siti Aminah", "Ibu Rumah Tangga", "Jl. Merdeka No. 10",
		"", "", "", "08123456789",
	}
	for i, value := range example {
		cell, _ := excelize.CoordinatesToCellName(i+1, 2)
		f.SetCellValue(sheetName, cell, value)
	}

	f.DeleteSheet("Sheet1")

	buffer, err := f.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("gagal menulis template ke buffer: %w", err)
	}

	return buffer, nil
}

func (s *service) ImportStudents(ctx context.Context, schemaName string, file io.Reader) (*ImportResult, error) {
	f, err := excelize.OpenReader(file)
	if err != nil {
		return nil, fmt.Errorf("gagal membuka file excel: %w", err)
	}

	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, errors.New("file Excel tidak memiliki sheet yang valid")
	}

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca baris dari sheet: %w", err)
	}

	result := &ImportResult{
		Errors: []ImportError{},
	}

	if len(rows) <= 1 {
		return result, nil // File kosong atau hanya header
	}

	for i, row := range rows[1:] {
		rowIndex := i + 2

		tx, err := s.db.BeginTx(ctx, nil)
		if err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: "Gagal memulai transaksi database."})
			continue
		}

		namaLengkap := ""
		if len(row) > 2 {
			namaLengkap = strings.TrimSpace(row[2])
		}

		if namaLengkap == "" {
			tx.Rollback()
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: "Kolom 'nama_lengkap' tidak boleh kosong."})
			continue
		}

		tanggalLahir := ""
		if len(row) > 6 && row[6] != "" {
			if val, err := strconv.ParseFloat(row[6], 64); err == nil {
				dt, err := excelize.ExcelDateToTime(val, false)
				if err == nil {
					tanggalLahir = dt.Format("2006-01-02")
				} else {
					tx.Rollback()
					result.ErrorCount++
					result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: fmt.Sprintf("Format tanggal lahir tidak valid (angka Excel): %s", row[6])})
					continue
				}
			} else {
				_, err := time.Parse("2006-01-02", row[6])
				if err != nil {
					tx.Rollback()
					result.ErrorCount++
					result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: fmt.Sprintf("Format tanggal lahir tidak valid (harus YYYY-MM-DD): %s", row[6])})
					continue
				}
				tanggalLahir = row[6]
			}
		}

		input := CreateStudentInput{
			NIS:             safeGet(row, 0),
			NISN:            safeGet(row, 1),
			NamaLengkap:     namaLengkap,
			NamaPanggilan:   safeGet(row, 3),
			JenisKelamin:    safeGet(row, 4),
			TempatLahir:     safeGet(row, 5),
			TanggalLahir:    tanggalLahir,
			Agama:           safeGet(row, 7),
			Kewarganegaraan: safeGet(row, 8),
			AlamatLengkap:   safeGet(row, 9),
			DesaKelurahan:   safeGet(row, 10),
			Kecamatan:       safeGet(row, 11),
			KotaKabupaten:   safeGet(row, 12),
			Provinsi:        safeGet(row, 13),
			KodePos:         safeGet(row, 14),
			NamaAyah:        safeGet(row, 15),
			PekerjaanAyah:   safeGet(row, 16),
			AlamatAyah:      safeGet(row, 17),
			NamaIbu:         safeGet(row, 18),
			PekerjaanIbu:    safeGet(row, 19),
			AlamatIbu:       safeGet(row, 20),
			NamaWali:        safeGet(row, 21),
			PekerjaanWali:   safeGet(row, 22),
			AlamatWali:      safeGet(row, 23),
			NomorKontakWali: safeGet(row, 24),
		}

		if err := s.validate.Struct(input); err != nil {
			tx.Rollback()
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: fmt.Sprintf("Validasi gagal: %s", err.Error())})
			continue
		}

		student := &Student{
			ID:              uuid.New().String(),
			NamaLengkap:     input.NamaLengkap,
			NIS:             stringToPtr(input.NIS),
			NISN:            stringToPtr(input.NISN),
			NamaPanggilan:   stringToPtr(input.NamaPanggilan),
			JenisKelamin:    stringToPtr(input.JenisKelamin),
			TempatLahir:     stringToPtr(input.TempatLahir),
			TanggalLahir:    dateToPtr(input.TanggalLahir),
			Agama:           stringToPtr(input.Agama),
			Kewarganegaraan: stringToPtr(input.Kewarganegaraan),
			AlamatLengkap:   stringToPtr(input.AlamatLengkap),
			DesaKelurahan:   stringToPtr(input.DesaKelurahan),
			Kecamatan:       stringToPtr(input.Kecamatan),
			KotaKabupaten:   stringToPtr(input.KotaKabupaten),
			Provinsi:        stringToPtr(input.Provinsi),
			KodePos:         stringToPtr(input.KodePos),
			NamaAyah:        stringToPtr(input.NamaAyah),
			PekerjaanAyah:   stringToPtr(input.PekerjaanAyah),
			AlamatAyah:      stringToPtr(input.AlamatAyah),
			NamaIbu:         stringToPtr(input.NamaIbu),
			PekerjaanIbu:    stringToPtr(input.PekerjaanIbu),
			AlamatIbu:       stringToPtr(input.AlamatIbu),
			NamaWali:        stringToPtr(input.NamaWali),
			PekerjaanWali:   stringToPtr(input.PekerjaanWali),
			AlamatWali:      stringToPtr(input.AlamatWali),
			NomorKontakWali: stringToPtr(input.NomorKontakWali),
		}

		if err := s.repo.Create(ctx, tx, schemaName, student); err != nil {
			tx.Rollback()
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: fmt.Sprintf("Gagal menyimpan ke DB: %s", err.Error())})
			continue
		}

		initialHistory := &RiwayatAkademik{
			ID:              uuid.New().String(),
			StudentID:       student.ID,
			Status:          "Aktif",
			TanggalKejadian: time.Now(),
			Keterangan:      stringToPtr("Siswa baru via impor Excel"),
		}

		setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
		if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
			tx.Rollback()
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: "Gagal mengatur skema DB."})
			continue
		}

		historyQuery := `INSERT INTO riwayat_akademik (id, student_id, status, tanggal_kejadian, keterangan) VALUES ($1, $2, $3, $4, $5)`
		_, err = tx.ExecContext(ctx, historyQuery, initialHistory.ID, initialHistory.StudentID, initialHistory.Status, initialHistory.TanggalKejadian, initialHistory.Keterangan)
		if err != nil {
			tx.Rollback()
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: fmt.Sprintf("Gagal membuat riwayat akademik: %s", err.Error())})
			continue
		}

		if err := tx.Commit(); err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{Row: rowIndex, Message: "Gagal commit transaksi DB."})
			continue
		}

		result.SuccessCount++
	}

	return result, nil
}

func safeGet(row []string, index int) string {
	if len(row) > index {
		return strings.TrimSpace(row[index])
	}
	return ""
}

func (s *service) GetAvailableStudentsByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Student, error) {
	if tahunAjaranID == "" {
		return nil, fmt.Errorf("tahun_ajaran_id is required")
	}
	return s.repo.GetAvailableStudentsByTahunAjaran(ctx, schemaName, tahunAjaranID)
}

func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
func dateToPtr(dateStr string) *time.Time {
	if dateStr == "" {
		return nil
	}
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil
	}
	return &parsedDate
}
func (s *service) Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	student := &Student{
		ID:              uuid.New().String(),
		NIS:             stringToPtr(input.NIS),
		NISN:            stringToPtr(input.NISN),
		NamaLengkap:     input.NamaLengkap,
		NamaPanggilan:   stringToPtr(input.NamaPanggilan),
		JenisKelamin:    stringToPtr(input.JenisKelamin),
		TempatLahir:     stringToPtr(input.TempatLahir),
		TanggalLahir:    dateToPtr(input.TanggalLahir),
		Agama:           stringToPtr(input.Agama),
		Kewarganegaraan: stringToPtr(input.Kewarganegaraan),
		AlamatLengkap:   stringToPtr(input.AlamatLengkap),
		DesaKelurahan:   stringToPtr(input.DesaKelurahan),
		Kecamatan:       stringToPtr(input.Kecamatan),
		KotaKabupaten:   stringToPtr(input.KotaKabupaten),
		Provinsi:        stringToPtr(input.Provinsi),
		KodePos:         stringToPtr(input.KodePos),
		NamaAyah:        stringToPtr(input.NamaAyah),
		PekerjaanAyah:   stringToPtr(input.PekerjaanAyah),
		AlamatAyah:      stringToPtr(input.AlamatAyah),
		NamaIbu:         stringToPtr(input.NamaIbu),
		PekerjaanIbu:    stringToPtr(input.PekerjaanIbu),
		AlamatIbu:       stringToPtr(input.AlamatIbu),
		NamaWali:        stringToPtr(input.NamaWali),
		PekerjaanWali:   stringToPtr(input.PekerjaanWali),
		AlamatWali:      stringToPtr(input.AlamatWali),
		NomorKontakWali: stringToPtr(input.NomorKontakWali),
	}

	if err := s.repo.Create(ctx, tx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat data siswa: %w", err)
	}

	initialHistory := &RiwayatAkademik{
		ID:              uuid.New().String(),
		StudentID:       student.ID,
		Status:          "Aktif",
		TanggalKejadian: time.Now(),
		Keterangan:      stringToPtr("Siswa baru"),
	}

	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema untuk riwayat: %w", err)
	}
	historyQuery := `
		INSERT INTO riwayat_akademik (id, student_id, status, tanggal_kejadian, keterangan)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err = tx.ExecContext(ctx, historyQuery, initialHistory.ID, initialHistory.StudentID, initialHistory.Status, initialHistory.TanggalKejadian, initialHistory.Keterangan)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat riwayat akademik awal: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	createdStudent, err := s.repo.GetByID(ctx, schemaName, student.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa setelah dibuat: %w", err)
	}

	return createdStudent, nil
}
func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari siswa untuk diupdate: %w", err)
	}
	if student == nil {
		return sql.ErrNoRows
	}

	student.NIS = stringToPtr(input.NIS)
	student.NISN = stringToPtr(input.NISN)
	student.NamaLengkap = input.NamaLengkap
	student.NamaPanggilan = stringToPtr(input.NamaPanggilan)
	student.JenisKelamin = stringToPtr(input.JenisKelamin)
	student.TempatLahir = stringToPtr(input.TempatLahir)
	student.TanggalLahir = dateToPtr(input.TanggalLahir)
	student.Agama = stringToPtr(input.Agama)
	student.Kewarganegaraan = stringToPtr(input.Kewarganegaraan)
	student.AlamatLengkap = stringToPtr(input.AlamatLengkap)
	student.DesaKelurahan = stringToPtr(input.DesaKelurahan)
	student.Kecamatan = stringToPtr(input.Kecamatan)
	student.KotaKabupaten = stringToPtr(input.KotaKabupaten)
	student.Provinsi = stringToPtr(input.Provinsi)
	student.KodePos = stringToPtr(input.KodePos)
	student.NamaAyah = stringToPtr(input.NamaAyah)
	student.PekerjaanAyah = stringToPtr(input.PekerjaanAyah)
	student.AlamatAyah = stringToPtr(input.AlamatAyah)
	student.NamaIbu = stringToPtr(input.NamaIbu)
	student.PekerjaanIbu = stringToPtr(input.PekerjaanIbu)
	student.AlamatIbu = stringToPtr(input.AlamatIbu)
	student.NamaWali = stringToPtr(input.NamaWali)
	student.PekerjaanWali = stringToPtr(input.PekerjaanWali)
	student.AlamatWali = stringToPtr(input.AlamatWali)
	student.NomorKontakWali = stringToPtr(input.NomorKontakWali)

	if err := s.repo.Update(ctx, schemaName, student); err != nil {
		return fmt.Errorf("gagal mengupdate siswa di service: %w", err)
	}

	return nil
}
func (s *service) GetAll(ctx context.Context, schemaName string) ([]Student, error) {
	students, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa di service: %w", err)
	}
	return students, nil
}
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Student, error) {
	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa by id di service: %w", err)
	}
	return student, nil
}
func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari siswa untuk dihapus: %w", err)
	}
	if student == nil {
		return sql.ErrNoRows
	}

	return s.repo.Delete(ctx, schemaName, id)
}
