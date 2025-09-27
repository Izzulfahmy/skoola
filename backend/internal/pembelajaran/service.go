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
	// Rencana Pembelajaran
	GetAllRencanaPembelajaran(ctx context.Context, schemaName string, pengajarKelasID string) ([]RencanaPembelajaranItem, error)

	// Materi
	CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error)
	UpdateMateri(ctx context.Context, schemaName string, id int, input UpsertMateriInput) error
	DeleteMateri(ctx context.Context, schemaName string, id int) error
	UpdateUrutanMateri(ctx context.Context, schemaName string, input UpdateUrutanInput) error

	// Ujian
	CreateUjian(ctx context.Context, schemaName string, input UpsertUjianInput) (*Ujian, error)
	UpdateUjian(ctx context.Context, schemaName string, id int, input UpsertUjianInput) error
	DeleteUjian(ctx context.Context, schemaName string, id int) error

	// Tujuan Pembelajaran
	CreateTujuan(ctx context.Context, schemaName string, input UpsertTujuanInput) (*TujuanPembelajaran, error)
	UpdateTujuan(ctx context.Context, schemaName string, id int, input UpsertTujuanInput) error
	DeleteTujuan(ctx context.Context, schemaName string, id int) error
	UpdateUrutanTujuan(ctx context.Context, schemaName string, input UpdateUrutanInput) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) GetAllRencanaPembelajaran(ctx context.Context, schemaName string, pengajarKelasID string) ([]RencanaPembelajaranItem, error) {
	return s.repo.GetAllRencanaPembelajaran(ctx, schemaName, pengajarKelasID)
}

func (s *service) UpdateUrutanMateri(ctx context.Context, schemaName string, input UpdateUrutanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateUrutanMateri(ctx, schemaName, input.OrderedIDs)
}

func (s *service) UpdateUrutanTujuan(ctx context.Context, schemaName string, input UpdateUrutanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateUrutanTujuan(ctx, schemaName, input.OrderedIDs)
}

func (s *service) CreateMateri(ctx context.Context, schemaName string, input UpsertMateriInput) (*MateriPembelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateMateri(ctx, schemaName, input)
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

// --- UJIAN ---
func (s *service) CreateUjian(ctx context.Context, schemaName string, input UpsertUjianInput) (*Ujian, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateUjian(ctx, schemaName, input)
}

func (s *service) UpdateUjian(ctx context.Context, schemaName string, id int, input UpsertUjianInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateUjian(ctx, schemaName, id, input)
}

func (s *service) DeleteUjian(ctx context.Context, schemaName string, id int) error {
	return s.repo.DeleteUjian(ctx, schemaName, id)
}

// --- TUJUAN ---
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
