// file: backend/internal/penilaian/service.go
package penilaian

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis.
type Service interface {
	GetPenilaianByTP(ctx context.Context, schemaName string, kelasID string, tpIDs []int) (*FullPenilaianData, error)
	UpsertNilai(ctx context.Context, schemaName string, input BulkPenilaianInput) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) GetPenilaianByTP(ctx context.Context, schemaName string, kelasID string, tpIDs []int) (*FullPenilaianData, error) {
	if kelasID == "" {
		return nil, errors.New("kelasID tidak boleh kosong")
	}
	return s.repo.GetPenilaianByTP(ctx, schemaName, kelasID, tpIDs)
}

func (s *service) UpsertNilai(ctx context.Context, schemaName string, input BulkPenilaianInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpsertNilai(ctx, schemaName, input)
}
