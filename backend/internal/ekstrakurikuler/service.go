// file: backend/internal/ekstrakurikuler/service.go
package ekstrakurikuler

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis.
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error)
	GetAll(ctx context.Context, schemaName string) ([]Ekstrakurikuler, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertEkstrakurikulerInput) error
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

func (s *service) Create(ctx context.Context, schemaName string, input UpsertEkstrakurikulerInput) (*Ekstrakurikuler, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Create(ctx, schemaName, input)
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]Ekstrakurikuler, error) {
	return s.repo.GetAll(ctx, schemaName)
}

func (s *service) Update(ctx context.Context, schemaName string, id int, input UpsertEkstrakurikulerInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Update(ctx, schemaName, id, input)
}

func (s *service) Delete(ctx context.Context, schemaName string, id int) error {
	return s.repo.Delete(ctx, schemaName, id)
}
