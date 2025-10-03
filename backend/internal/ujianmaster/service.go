// backend/internal/ujianmaster/service.go
package ujianmaster

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/tahunajaran"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

// Interface tidak berubah
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertUjianMasterInput) (*UjianMaster, error)
	GetAllByTA(ctx context.Context, schemaName, tahunAjaranID string) ([]UjianMaster, error)
	GetByID(ctx context.Context, schemaName, id string) (*UjianDetailResponse, error)
	Update(ctx context.Context, schemaName, id string, input UpsertUjianMasterInput) (*UjianMaster, error)
	Delete(ctx context.Context, schemaName, id string) error
}

// **PERBAIKAN KRUSIAL DI SINI**
// Struct service sekarang memiliki semua field yang diperlukan
type service struct {
	repo     Repository
	taRepo   tahunajaran.Repository
	validate *validator.Validate
}

// **PERBAIKAN KRUSIAL DI SINI**
// NewService sekarang menerima semua dependensi dengan benar
func NewService(repo Repository, taRepo tahunajaran.Repository, validate *validator.Validate) Service {
	return &service{
		repo:     repo,
		taRepo:   taRepo,
		validate: validate,
	}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertUjianMasterInput) (*UjianMaster, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	um := &UjianMaster{
		ID:             uuid.New().String(),
		TahunAjaranID:  input.TahunAjaranID,
		NamaPaketUjian: input.NamaPaketUjian,
		JenisUjianID:   input.JenisUjianID,
		Durasi:         input.Durasi,
		JumlahSoal:     input.JumlahSoal,
		Keterangan:     input.Keterangan,
	}
	if err := s.repo.Create(ctx, schemaName, um); err != nil {
		return nil, err
	}
	return um, nil
}

func (s *service) GetAllByTA(ctx context.Context, schemaName, tahunAjaranID string) ([]UjianMaster, error) {
	if tahunAjaranID == "" {
		return []UjianMaster{}, nil
	}
	return s.repo.GetAllByTahunAjaran(ctx, schemaName, tahunAjaranID)
}

func (s *service) GetByID(ctx context.Context, schemaName, id string) (*UjianDetailResponse, error) {
	ujianMaster, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan data master ujian: %w", err)
	}
	if ujianMaster == nil {
		return nil, errors.New("paket ujian tidak ditemukan")
	}

	penugasan, err := s.repo.GetPenugasanByMasterID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan data penugasan: %w", err)
	}

	available, err := s.repo.GetAvailableKelas(ctx, schemaName, ujianMaster.TahunAjaranID, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan data kelas tersedia: %w", err)
	}

	response := &UjianDetailResponse{
		Detail: UjianDetail{
			NamaPaketUjian: ujianMaster.NamaPaketUjian,
			Penugasan:      penugasan,
		},
		AvailableKelas: available,
	}

	return response, nil
}

func (s *service) Update(ctx context.Context, schemaName, id string, input UpsertUjianMasterInput) (*UjianMaster, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	um, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil || um == nil {
		return nil, fmt.Errorf("data ujian master tidak ditemukan")
	}
	um.NamaPaketUjian = input.NamaPaketUjian
	um.JenisUjianID = input.JenisUjianID
	um.Durasi = input.Durasi
	um.JumlahSoal = input.JumlahSoal
	um.Keterangan = input.Keterangan

	if err := s.repo.Update(ctx, schemaName, um); err != nil {
		return nil, err
	}
	return um, nil
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}
