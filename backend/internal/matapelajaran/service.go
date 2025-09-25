// file: backend/internal/matapelajaran/service.go
package matapelajaran

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetAllTaught(ctx context.Context, schemaName string) ([]MataPelajaran, error)
	UpdateUrutan(ctx context.Context, schemaName string, input UpdateUrutanInput) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	// Logika baru untuk menentukan urutan otomatis
	var maxUrutan int
	var err error

	if input.ParentID != nil && *input.ParentID != "" {
		// Ini adalah sub-pelajaran, cari urutan maksimal di antara saudaranya
		maxUrutan, err = s.repo.GetMaxUrutanByParentID(ctx, schemaName, *input.ParentID)
	} else {
		// Ini adalah pelajaran induk, cari urutan maksimal di level root
		maxUrutan, err = s.repo.GetMaxUrutan(ctx, schemaName)
	}

	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan urutan: %w", err)
	}

	nextUrutan := maxUrutan + 1
	input.Urutan = &nextUrutan

	return s.repo.Create(ctx, schemaName, input)
}

// ... sisa file tetap sama ...
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error) {
	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Update(ctx, schemaName, id, input)
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}

func (s *service) GetAllTaught(ctx context.Context, schemaName string) ([]MataPelajaran, error) {
	return s.repo.GetAllTaught(ctx, schemaName)
}

func (s *service) UpdateUrutan(ctx context.Context, schemaName string, input UpdateUrutanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateUrutan(ctx, schemaName, input.OrderedIDs)
}
