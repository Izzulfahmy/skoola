// file: backend/internal/tingkatan/service.go
package tingkatan

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis.
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertTingkatanInput) (*Tingkatan, error)
	GetAll(ctx context.Context, schemaName string) ([]Tingkatan, error)
	GetByID(ctx context.Context, schemaName string, id int) (*Tingkatan, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertTingkatanInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertTingkatanInput) (*Tingkatan, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Create(ctx, schemaName, input)
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]Tingkatan, error) {
	return s.repo.GetAll(ctx, schemaName)
}

func (s *service) GetByID(ctx context.Context, schemaName string, id int) (*Tingkatan, error) {
	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) Update(ctx context.Context, schemaName string, id int, input UpsertTingkatanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Update(ctx, schemaName, id, input)
}

func (s *service) Delete(ctx context.Context, schemaName string, id int) error {
	return s.repo.Delete(ctx, schemaName, id)
}
