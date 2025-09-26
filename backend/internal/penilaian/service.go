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
	GetPenilaianLengkap(ctx context.Context, schemaName string, kelasID string, pengajarKelasID string) (map[string]interface{}, error)
	UpsertNilaiBulk(ctx context.Context, schemaName string, input BulkUpsertNilaiInput) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) GetPenilaianLengkap(ctx context.Context, schemaName string, kelasID string, pengajarKelasID string) (map[string]interface{}, error) {
	if kelasID == "" || pengajarKelasID == "" {
		return nil, errors.New("kelasID dan pengajarKelasID tidak boleh kosong")
	}

	penilaianData, materiData, err := s.repo.GetPenilaianLengkap(ctx, schemaName, kelasID, pengajarKelasID)
	if err != nil {
		return nil, err
	}

	// Gabungkan kedua hasil ke dalam satu map untuk dikirim sebagai JSON
	response := map[string]interface{}{
		"penilaian": penilaianData,
		"materi":    materiData,
	}

	return response, nil
}

func (s *service) UpsertNilaiBulk(ctx context.Context, schemaName string, input BulkUpsertNilaiInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpsertNilaiBulk(ctx, schemaName, input)
}
