// file: backend/internal/matapelajaran/service.go
package matapelajaran

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis.
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error)
	GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*MataPelajaran, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertMataPelajaranInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertMataPelajaranInput) (*MataPelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Create(ctx, schemaName, input)
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]MataPelajaran, error) {
	return s.repo.GetAll(ctx, schemaName)
}

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
