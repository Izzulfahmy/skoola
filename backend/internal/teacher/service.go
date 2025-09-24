// file: backend/internal/teacher/service.go
package teacher

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"skoola/internal/rombel"      // <-- Impor paket rombel
	"skoola/internal/tahunajaran" // <-- Impor paket tahunajaran
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrValidation = errors.New("validation failed")

// ... (CreateTeacherInput dan UpdateTeacherInput tidak berubah)
type CreateTeacherInput struct {
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=8"`
	NamaLengkap     string `json:"nama_lengkap" validate:"required,min=3"`
	NipNuptk        string `json:"nip_nuptk" validate:"omitempty,numeric,min=10,max=30"`
	NoHP            string `json:"no_hp" validate:"omitempty,numeric,min=10,max=15"`
	AlamatLengkap   string `json:"alamat_lengkap" validate:"omitempty,min=5"`
	NamaPanggilan   string `json:"nama_panggilan" validate:"omitempty"`
	GelarAkademik   string `json:"gelar_akademik" validate:"omitempty"`
	JenisKelamin    string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir     string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir    string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama           string `json:"agama" validate:"omitempty"`
	Kewarganegaraan string `json:"kewarganegaraan" validate:"omitempty"`
	Provinsi        string `json:"provinsi" validate:"omitempty"`
	KotaKabupaten   string `json:"kota_kabupaten" validate:"omitempty"`
	Kecamatan       string `json:"kecamatan" validate:"omitempty"`
	DesaKelurahan   string `json:"desa_kelurahan" validate:"omitempty"`
	KodePos         string `json:"kode_pos" validate:"omitempty,numeric"`
}

type UpdateTeacherInput struct {
	Email           string `json:"email" validate:"required,email"`
	NamaLengkap     string `json:"nama_lengkap" validate:"required,min=3"`
	NipNuptk        string `json:"nip_nuptk" validate:"omitempty,numeric,min=10,max=30"`
	NoHP            string `json:"no_hp" validate:"omitempty,numeric,min=10,max=15"`
	AlamatLengkap   string `json:"alamat_lengkap" validate:"omitempty,min=5"`
	NamaPanggilan   string `json:"nama_panggilan" validate:"omitempty"`
	GelarAkademik   string `json:"gelar_akademik" validate:"omitempty"`
	JenisKelamin    string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir     string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir    string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama           string `json:"agama" validate:"omitempty"`
	Kewarganegaraan string `json:"kewarganegaraan" validate:"omitempty"`
	Provinsi        string `json:"provinsi" validate:"omitempty"`
	KotaKabupaten   string `json:"kota_kabupaten" validate:"omitempty"`
	Kecamatan       string `json:"kecamatan" validate:"omitempty"`
	DesaKelurahan   string `json:"desa_kelurahan" validate:"omitempty"`
	KodePos         string `json:"kode_pos" validate:"omitempty,numeric"`
}

type CreateHistoryInput struct {
	Status         string `json:"status" validate:"required,oneof=Aktif Cuti Pindah Berhenti Pensiun"`
	TanggalMulai   string `json:"tanggal_mulai" validate:"required,datetime=2006-01-02"`
	TanggalSelesai string `json:"tanggal_selesai" validate:"omitempty,datetime=2006-01-02"`
	Keterangan     string `json:"keterangan" validate:"omitempty"`
}

type UpdateHistoryInput struct {
	Status         string `json:"status" validate:"required,oneof=Aktif Cuti Pindah Berhenti Pensiun"`
	TanggalMulai   string `json:"tanggal_mulai" validate:"required,datetime=2006-01-02"`
	TanggalSelesai string `json:"tanggal_selesai" validate:"omitempty,datetime=2006-01-02"`
	Keterangan     string `json:"keterangan" validate:"omitempty"`
}

type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetAdminDetails(ctx context.Context, schemaName string) (*Teacher, error)
	GetHistoryByTeacherID(ctx context.Context, schemaName string, teacherID string) ([]RiwayatKepegawaian, error)
	CreateHistory(ctx context.Context, schemaName string, teacherID string, input CreateHistoryInput) error
	UpdateHistory(ctx context.Context, schemaName string, historyID string, input UpdateHistoryInput) error
	DeleteHistory(ctx context.Context, schemaName string, historyID string) error
	GetMyDetails(ctx context.Context, schemaName string, userID string) (*Teacher, error)
	// --- FUNGSI BARU ---
	GetMyKelas(ctx context.Context, schemaName string, userID string) ([]rombel.Kelas, error)
}

type service struct {
	repo            Repository
	tahunAjaranRepo tahunajaran.Repository // <-- Tambahkan repo tahun ajaran
	validate        *validator.Validate
	db              *sql.DB
}

func NewService(repo Repository, tahunAjaranRepo tahunajaran.Repository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:            repo,
		tahunAjaranRepo: tahunAjaranRepo, // <-- Tambahkan ini
		validate:        validate,
		db:              db,
	}
}

// --- IMPLEMENTASI FUNGSI BARU ---
func (s *service) GetMyKelas(ctx context.Context, schemaName string, userID string) ([]rombel.Kelas, error) {
	// 1. Dapatkan data guru berdasarkan userID dari token
	teacherData, err := s.repo.GetTeacherByUserID(ctx, schemaName, userID)
	if err != nil || teacherData == nil {
		return nil, fmt.Errorf("data guru tidak ditemukan: %w", err)
	}

	// 2. Dapatkan tahun ajaran yang aktif
	activeTahunAjaranID, err := s.tahunAjaranRepo.GetActiveTahunAjaranID(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan tahun ajaran aktif: %w", err)
	}
	if activeTahunAjaranID == "" {
		// Jika tidak ada tahun ajaran aktif, kembalikan slice kosong
		return []rombel.Kelas{}, nil
	}

	// 3. Panggil repository untuk mendapatkan kelas
	return s.repo.GetKelasByTeacherID(ctx, schemaName, teacherData.ID, activeTahunAjaranID)
}

func (s *service) GetMyDetails(ctx context.Context, schemaName string, userID string) (*Teacher, error) {
	teacherData, err := s.repo.GetTeacherByUserID(ctx, schemaName, userID)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan data detail guru: %w", err)
	}
	if teacherData == nil {
		return nil, sql.ErrNoRows
	}
	return teacherData, nil
}

// ... (sisa kode di file ini tetap sama)
// (CreateHistory, GetHistoryByTeacherID, Create, Update, GetAdminDetails, GetAll, GetByID, Delete, stringToPtr)
func (s *service) UpdateHistory(ctx context.Context, schemaName string, historyID string, input UpdateHistoryInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	startDate, _ := time.Parse("2006-01-02", input.TanggalMulai)
	var endDate *time.Time
	if input.TanggalSelesai != "" {
		parsedDate, err := time.Parse("2006-01-02", input.TanggalSelesai)
		if err == nil {
			endDate = &parsedDate
		}
	}

	history := &RiwayatKepegawaian{
		ID:             historyID,
		Status:         input.Status,
		TanggalMulai:   startDate,
		TanggalSelesai: endDate,
		Keterangan:     stringToPtr(input.Keterangan),
	}

	return s.repo.UpdateHistory(ctx, schemaName, history)
}
func (s *service) DeleteHistory(ctx context.Context, schemaName string, historyID string) error {
	return s.repo.DeleteHistory(ctx, schemaName, historyID)
}
func (s *service) CreateHistory(ctx context.Context, schemaName string, teacherID string, input CreateHistoryInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	teacher, err := s.repo.GetByID(ctx, schemaName, teacherID)
	if err != nil || teacher == nil {
		return fmt.Errorf("guru dengan ID %s tidak ditemukan", teacherID)
	}

	startDate, _ := time.Parse("2006-01-02", input.TanggalMulai)
	var endDate *time.Time
	if input.TanggalSelesai != "" {
		parsedDate, err := time.Parse("2006-01-02", input.TanggalSelesai)
		if err == nil {
			endDate = &parsedDate
		}
	}

	history := &RiwayatKepegawaian{
		ID:             uuid.New().String(),
		TeacherID:      teacherID,
		Status:         input.Status,
		TanggalMulai:   startDate,
		TanggalSelesai: endDate,
		Keterangan:     stringToPtr(input.Keterangan),
	}

	return s.repo.CreateHistory(ctx, schemaName, history)
}
func (s *service) GetHistoryByTeacherID(ctx context.Context, schemaName string, teacherID string) ([]RiwayatKepegawaian, error) {
	histories, err := s.repo.GetHistoryByTeacherID(ctx, schemaName, teacherID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data riwayat di service: %w", err)
	}
	return histories, nil
}
func (s *service) Create(ctx context.Context, schemaName string, input CreateTeacherInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password: %w", err)
	}
	user := &User{
		ID:           uuid.New().String(),
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Role:         "teacher",
	}
	var dob *time.Time
	if input.TanggalLahir != "" {
		parsedDate, err := time.Parse("2006-01-02", input.TanggalLahir)
		if err == nil {
			dob = &parsedDate
		}
	}
	teacher := &Teacher{
		ID:              uuid.New().String(),
		UserID:          user.ID,
		NamaLengkap:     input.NamaLengkap,
		NipNuptk:        stringToPtr(input.NipNuptk),
		NoHP:            stringToPtr(input.NoHP),
		AlamatLengkap:   stringToPtr(input.AlamatLengkap),
		NamaPanggilan:   stringToPtr(input.NamaPanggilan),
		GelarAkademik:   stringToPtr(input.GelarAkademik),
		JenisKelamin:    stringToPtr(input.JenisKelamin),
		TempatLahir:     stringToPtr(input.TempatLahir),
		TanggalLahir:    dob,
		Agama:           stringToPtr(input.Agama),
		Kewarganegaraan: stringToPtr(input.Kewarganegaraan),
		Provinsi:        stringToPtr(input.Provinsi),
		KotaKabupaten:   stringToPtr(input.KotaKabupaten),
		Kecamatan:       stringToPtr(input.Kecamatan),
		DesaKelurahan:   stringToPtr(input.DesaKelurahan),
		KodePos:         stringToPtr(input.KodePos),
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()
	err = s.repo.Create(ctx, tx, schemaName, user, teacher)
	if err != nil {
		return fmt.Errorf("gagal membuat guru di service: %w", err)
	}
	return tx.Commit()
}
func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk diupdate: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows
	}
	var dob *time.Time
	if input.TanggalLahir != "" {
		parsedDate, err := time.Parse("2006-01-02", input.TanggalLahir)
		if err == nil {
			dob = &parsedDate
		}
	}
	teacher.Email = input.Email
	teacher.NamaLengkap = input.NamaLengkap
	teacher.NipNuptk = stringToPtr(input.NipNuptk)
	teacher.NoHP = stringToPtr(input.NoHP)
	teacher.AlamatLengkap = stringToPtr(input.AlamatLengkap)
	teacher.NamaPanggilan = stringToPtr(input.NamaPanggilan)
	teacher.GelarAkademik = stringToPtr(input.GelarAkademik)
	teacher.JenisKelamin = stringToPtr(input.JenisKelamin)
	teacher.TempatLahir = stringToPtr(input.TempatLahir)
	teacher.TanggalLahir = dob
	teacher.Agama = stringToPtr(input.Agama)
	teacher.Kewarganegaraan = stringToPtr(input.Kewarganegaraan)
	teacher.Provinsi = stringToPtr(input.Provinsi)
	teacher.KotaKabupaten = stringToPtr(input.KotaKabupaten)
	teacher.Kecamatan = stringToPtr(input.Kecamatan)
	teacher.DesaKelurahan = stringToPtr(input.DesaKelurahan)
	teacher.KodePos = stringToPtr(input.KodePos)
	err = s.repo.Update(ctx, schemaName, teacher)
	if err != nil {
		return fmt.Errorf("gagal mengupdate guru di service: %w", err)
	}
	return nil
}
func (s *service) GetAdminDetails(ctx context.Context, schemaName string) (*Teacher, error) {
	adminUser, err := s.repo.GetAdminBySchema(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan akun admin: %w", err)
	}
	if adminUser == nil {
		return nil, sql.ErrNoRows
	}
	adminTeacherData, err := s.repo.GetTeacherByUserID(ctx, schemaName, adminUser.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan data detail admin: %w", err)
	}
	if adminTeacherData == nil {
		return nil, sql.ErrNoRows
	}
	return adminTeacherData, nil
}
func (s *service) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	teachers, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru di service: %w", err)
	}
	return teachers, nil
}
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru by id di service: %w", err)
	}
	return teacher, nil
}
func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk dihapus: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows
	}
	err = s.repo.Delete(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal menghapus guru di service: %w", err)
	}
	return nil
}
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
