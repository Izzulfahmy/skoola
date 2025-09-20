// file: backend/internal/teacher/service.go
package teacher

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrValidation = errors.New("validation failed")

// ... (struct CreateTeacherInput dan UpdateTeacherInput tidak berubah)
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
	StatusGuru      string `json:"status_guru" validate:"omitempty,oneof=Aktif NonAktif Pindah"`
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
	StatusGuru      string `json:"status_guru" validate:"omitempty,oneof=Aktif NonAktif Pindah"`
}

// --- INTERFACE DIPERBARUI ---
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	// --- FUNGSI BARU ---
	GetAdminDetails(ctx context.Context, schemaName string) (*Teacher, error)
}

type service struct {
	repo     Repository
	validate *validator.Validate
	db       *sql.DB
}

func NewService(repo Repository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:     repo,
		validate: validate,
		db:       db,
	}
}

// --- FUNGSI BARU UNTUK MENDAPATKAN DETAIL ADMIN ---
func (s *service) GetAdminDetails(ctx context.Context, schemaName string) (*Teacher, error) {
	// 1. Cari user admin berdasarkan schema
	adminUser, err := s.repo.GetAdminBySchema(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan akun admin: %w", err)
	}
	if adminUser == nil {
		return nil, sql.ErrNoRows // Tidak ada admin di sekolah ini
	}

	// 2. Cari data guru/teacher yang terhubung dengan user admin
	adminTeacherData, err := s.repo.GetTeacherByUserID(ctx, schemaName, adminUser.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal menemukan data detail admin: %w", err)
	}
	if adminTeacherData == nil {
		// Ini kasus langka, di mana ada user admin tapi tidak ada data di tabel teachers
		return nil, sql.ErrNoRows
	}

	return adminTeacherData, nil
}

// --- FUNGSI-FUNGSI DI BAWAH INI TIDAK BERUBAH ---
// ... (Create, Update, GetAll, GetByID, Delete, stringToPtr) ...
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

	statusGuru := input.StatusGuru
	if statusGuru == "" {
		statusGuru = "Aktif"
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
		StatusGuru:      stringToPtr(statusGuru),
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
	teacher.StatusGuru = stringToPtr(input.StatusGuru)

	err = s.repo.Update(ctx, schemaName, teacher)
	if err != nil {
		return fmt.Errorf("gagal mengupdate guru di service: %w", err)
	}
	return nil
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
