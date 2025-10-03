// backend/internal/ujianmaster/service.go
package ujianmaster

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/tahunajaran" // Impor tahunajaran

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertUjianMasterInput) (*UjianMaster, error)
	GetAll(ctx context.Context, schemaName string) ([]UjianMaster, error)
	GetByID(ctx context.Context, schemaName string, id string) (*UjianMaster, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertUjianMasterInput) (*UjianMaster, error)
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	taRepo   tahunajaran.Repository // Tambahkan repo tahun ajaran
	validate *validator.Validate
}

func NewService(repo Repository, taRepo tahunajaran.Repository, validate *validator.Validate) Service {
	return &service{repo: repo, taRepo: taRepo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertUjianMasterInput) (*UjianMaster, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	um := &UjianMaster{
		ID:             uuid.New().String(),
		TahunAjaranID:  input.TahunAjaranID,
		NamaPaketUjian: input.NamaPaketUjian,
	}
	if err := s.repo.Create(ctx, schemaName, um); err != nil {
		return nil, err
	}
	return um, nil
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]UjianMaster, error) {
	activeTahunAjaranID, err := s.taRepo.GetActiveTahunAjaranID(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan tahun ajaran aktif: %w", err)
	}
	if activeTahunAjaranID == "" {
		return []UjianMaster{}, nil
	}
	return s.repo.GetAllByTahunAjaran(ctx, schemaName, activeTahunAjaranID)
}

func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*UjianMaster, error) {
	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpsertUjianMasterInput) (*UjianMaster, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	um, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil || um == nil {
		return nil, fmt.Errorf("data ujian master tidak ditemukan")
	}
	um.NamaPaketUjian = input.NamaPaketUjian
	if err := s.repo.Update(ctx, schemaName, um); err != nil {
		return nil, err
	}
	return um, nil
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}
