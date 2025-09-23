// file: backend/internal/rombel/service.go
package rombel

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

// Service defines the interface for the rombel business logic.
type Service interface {
	CreateKelas(ctx context.Context, schemaName string, input UpsertKelasInput) (*Kelas, error)
	UpdateKelas(ctx context.Context, schemaName string, kelasID string, input UpsertKelasInput) (*Kelas, error)
	DeleteKelas(ctx context.Context, schemaName string, kelasID string) error
	GetKelasByID(ctx context.Context, schemaName string, kelasID string) (*Kelas, error)
	GetAllKelasByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kelas, error)
	AddAnggotaKelas(ctx context.Context, schemaName string, kelasID string, input AddAnggotaKelasInput) error
	RemoveAnggotaKelas(ctx context.Context, schemaName string, anggotaID string) error
	GetAllAnggotaByKelas(ctx context.Context, schemaName string, kelasID string) ([]AnggotaKelas, error)
	CreatePengajarKelas(ctx context.Context, schemaName string, kelasID string, input UpsertPengajarKelasInput) (*PengajarKelas, error)
	RemovePengajarKelas(ctx context.Context, schemaName string, pengajarID string) error
	GetAllPengajarByKelas(ctx context.Context, schemaName string, kelasID string) ([]PengajarKelas, error)
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService creates a new rombel service instance.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) CreateKelas(ctx context.Context, schemaName string, input UpsertKelasInput) (*Kelas, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	kelas := &Kelas{
		ID:            uuid.New().String(),
		NamaKelas:     input.NamaKelas,
		TahunAjaranID: input.TahunAjaranID,
		TingkatanID:   input.TingkatanID,
		WaliKelasID:   input.WaliKelasID,
	}

	createdKelas, err := s.repo.CreateKelas(ctx, schemaName, kelas)
	if err != nil {
		return nil, err
	}
	return s.repo.GetKelasByID(ctx, schemaName, createdKelas.ID)
}

func (s *service) UpdateKelas(ctx context.Context, schemaName string, kelasID string, input UpsertKelasInput) (*Kelas, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	kelas, err := s.repo.GetKelasByID(ctx, schemaName, kelasID)
	if err != nil || kelas == nil {
		return nil, fmt.Errorf("kelas with ID %s not found", kelasID)
	}

	kelas.NamaKelas = input.NamaKelas
	kelas.TingkatanID = input.TingkatanID
	kelas.WaliKelasID = input.WaliKelasID

	if _, err := s.repo.UpdateKelas(ctx, schemaName, kelas); err != nil {
		return nil, err
	}
	return s.repo.GetKelasByID(ctx, schemaName, kelasID)
}

func (s *service) DeleteKelas(ctx context.Context, schemaName string, kelasID string) error {
	return s.repo.DeleteKelas(ctx, schemaName, kelasID)
}

func (s *service) GetKelasByID(ctx context.Context, schemaName string, kelasID string) (*Kelas, error) {
	return s.repo.GetKelasByID(ctx, schemaName, kelasID)
}

func (s *service) GetAllKelasByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kelas, error) {
	if tahunAjaranID == "" {
		return []Kelas{}, nil // Return empty slice if no year is selected
	}
	return s.repo.GetAllKelasByTahunAjaran(ctx, schemaName, tahunAjaranID)
}

func (s *service) AddAnggotaKelas(ctx context.Context, schemaName string, kelasID string, input AddAnggotaKelasInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.AddAnggotaKelas(ctx, schemaName, kelasID, input.StudentIDs)
}

func (s *service) RemoveAnggotaKelas(ctx context.Context, schemaName string, anggotaID string) error {
	return s.repo.RemoveAnggotaKelas(ctx, schemaName, anggotaID)
}

func (s *service) GetAllAnggotaByKelas(ctx context.Context, schemaName string, kelasID string) ([]AnggotaKelas, error) {
	return s.repo.GetAllAnggotaByKelas(ctx, schemaName, kelasID)
}

func (s *service) CreatePengajarKelas(ctx context.Context, schemaName string, kelasID string, input UpsertPengajarKelasInput) (*PengajarKelas, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	pengajar := &PengajarKelas{
		KelasID:         kelasID,
		TeacherID:       input.TeacherID,
		MataPelajaranID: input.MataPelajaranID,
	}

	created, err := s.repo.CreatePengajarKelas(ctx, schemaName, pengajar)
	if err != nil {
		return nil, err
	}

	// Fetch with joined data to return to client
	list, err := s.repo.GetAllPengajarByKelas(ctx, schemaName, kelasID)
	if err != nil {
		return nil, err
	}
	for _, p := range list {
		if p.ID == created.ID {
			return &p, nil
		}
	}
	return nil, errors.New("failed to retrieve created pengajar")
}

func (s *service) RemovePengajarKelas(ctx context.Context, schemaName string, pengajarID string) error {
	return s.repo.RemovePengajarKelas(ctx, schemaName, pengajarID)
}

func (s *service) GetAllPengajarByKelas(ctx context.Context, schemaName string, kelasID string) ([]PengajarKelas, error) {
	return s.repo.GetAllPengajarByKelas(ctx, schemaName, kelasID)
}
