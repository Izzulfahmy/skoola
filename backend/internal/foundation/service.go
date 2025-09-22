// file: backend/internal/foundation/service.go
package foundation

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Create(ctx context.Context, input UpsertNaunganInput) (*Naungan, error)
	GetAll(ctx context.Context) ([]Naungan, error)
	GetByID(ctx context.Context, id string) (*Naungan, error)
	Update(ctx context.Context, id string, input UpsertNaunganInput) error
	Delete(ctx context.Context, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) GetByID(ctx context.Context, id string) (*Naungan, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *service) Create(ctx context.Context, input UpsertNaunganInput) (*Naungan, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	newNaungan := &Naungan{
		ID:          uuid.New().String(),
		NamaNaungan: input.NamaNaungan,
	}
	if err := s.repo.Create(ctx, newNaungan); err != nil {
		return nil, fmt.Errorf("gagal membuat naungan di service: %w", err)
	}
	return newNaungan, nil
}

func (s *service) GetAll(ctx context.Context) ([]Naungan, error) {
	return s.repo.GetAll(ctx)
}

func (s *service) Update(ctx context.Context, id string, input UpsertNaunganInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	naunganToUpdate, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("gagal mencari naungan untuk diupdate: %w", err)
	}
	if naunganToUpdate == nil {
		return sql.ErrNoRows
	}
	naunganToUpdate.NamaNaungan = input.NamaNaungan
	return s.repo.Update(ctx, naunganToUpdate)
}

func (s *service) Delete(ctx context.Context, id string) error {
	naungan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("gagal mencari naungan untuk dihapus: %w", err)
	}
	if naungan == nil {
		return sql.ErrNoRows
	}
	return s.repo.Delete(ctx, id)
}
