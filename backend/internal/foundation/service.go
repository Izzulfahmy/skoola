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

// Service mendefinisikan interface untuk logika bisnis yayasan.
type Service interface {
	Create(ctx context.Context, input UpsertFoundationInput) (*Foundation, error)
	GetAll(ctx context.Context) ([]Foundation, error)
	Update(ctx context.Context, id string, input UpsertFoundationInput) error
	Delete(ctx context.Context, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, input UpsertFoundationInput) (*Foundation, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	newFoundation := &Foundation{
		ID:          uuid.New().String(),
		NamaYayasan: input.NamaYayasan,
	}
	if err := s.repo.Create(ctx, newFoundation); err != nil {
		return nil, fmt.Errorf("gagal membuat yayasan di service: %w", err)
	}
	return newFoundation, nil
}

func (s *service) GetAll(ctx context.Context) ([]Foundation, error) {
	return s.repo.GetAll(ctx)
}

func (s *service) Update(ctx context.Context, id string, input UpsertFoundationInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	foundationToUpdate, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("gagal mencari yayasan untuk diupdate: %w", err)
	}
	if foundationToUpdate == nil {
		return sql.ErrNoRows
	}
	foundationToUpdate.NamaYayasan = input.NamaYayasan
	return s.repo.Update(ctx, foundationToUpdate)
}

func (s *service) Delete(ctx context.Context, id string) error {
	foundation, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("gagal mencari yayasan untuk dihapus: %w", err)
	}
	if foundation == nil {
		return sql.ErrNoRows
	}
	return s.repo.Delete(ctx, id)
}
