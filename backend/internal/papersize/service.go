package papersize

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertPaperSizeInput) (*PaperSize, error)
	GetAll(ctx context.Context, schemaName string) ([]PaperSize, error)
	GetByID(ctx context.Context, schemaName string, id string) (*PaperSize, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertPaperSizeInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

// Implementasi fungsi-fungsi service dengan validasi
func (s *service) Create(ctx context.Context, schemaName string, input UpsertPaperSizeInput) (*PaperSize, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Create(ctx, schemaName, input)
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]PaperSize, error) {
	return s.repo.GetAll(ctx, schemaName)
}

func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*PaperSize, error) {
	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpsertPaperSizeInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Update(ctx, schemaName, id, input)
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}
