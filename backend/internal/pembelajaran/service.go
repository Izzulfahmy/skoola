// file: backend/internal/pembelajaran/service.go
package pembelajaran

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis.
type Service interface {
	// Materi
	CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error)
	GetAllMateriByPengajarKelas(ctx context.Context, schemaName string, pengajarKelasID string) ([]MateriPembelajaran, error)
	UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error
	DeleteMateri(ctx context.Context, schemaName string, id int) error

	// Tujuan Pembelajaran
	CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error)
	UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error
	DeleteTujuan(ctx context.Context, schemaName string, id int) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

// === Materi Service ===
func (s *service) CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateMateri(ctx, schemaName, input)
}

func (s *service) GetAllMateriByPengajarKelas(ctx context.Context, schemaName string, pengajarKelasID string) ([]MateriPembelajaran, error) {
	return s.repo.GetAllMateriByPengajarKelas(ctx, schemaName, pengajarKelasID)
}

func (s *service) UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateMateri(ctx, schemaName, id, input)
}

func (s *service) DeleteMateri(ctx context.Context, schemaName string, id int) error {
	return s.repo.DeleteMateri(ctx, schemaName, id)
}

// === Tujuan Pembelajaran Service ===
func (s *service) CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateTujuan(ctx, schemaName, input)
}

func (s *service) UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateTujuan(ctx, schemaName, id, input)
}

func (s *service) DeleteTujuan(ctx context.Context, schemaName string, id int) error {
	return s.repo.DeleteTujuan(ctx, schemaName, id)
}
