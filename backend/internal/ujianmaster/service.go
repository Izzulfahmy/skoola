package ujianmaster

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

// Service defines the business logic for UjianMaster.
type Service interface {
	CreateUjianMaster(ctx context.Context, req UjianMaster) (UjianMaster, error)
	GetAllUjianMasterByTahunAjaran(ctx context.Context, tahunAjaranID string) ([]UjianMaster, error)
	GetUjianMasterByID(ctx context.Context, id string) (UjianMasterDetail, error)
	UpdateUjianMaster(ctx context.Context, id string, req UjianMaster) (UjianMaster, error)
	DeleteUjianMaster(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

// NewService creates a new UjianMaster service.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// CreateUjianMaster handles the creation of a new UjianMaster.
func (s *service) CreateUjianMaster(ctx context.Context, req UjianMaster) (UjianMaster, error) {
	// Validation can be added here if necessary
	createdUM, err := s.repo.Create(req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal membuat paket ujian di service: %w", err)
	}
	return createdUM, nil
}

// GetAllUjianMasterByTahunAjaran retrieves all UjianMasters for a given academic year.
func (s *service) GetAllUjianMasterByTahunAjaran(ctx context.Context, tahunAjaranID string) ([]UjianMaster, error) {
	taID, err := uuid.Parse(tahunAjaranID)
	if err != nil {
		return nil, errors.New("ID tahun ajaran tidak valid")
	}
	return s.repo.GetAllByTahunAjaran(taID)
}

// GetUjianMasterByID retrieves details of a specific UjianMaster.
func (s *service) GetUjianMasterByID(ctx context.Context, id string) (UjianMasterDetail, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMasterDetail{}, errors.New("ID paket ujian tidak valid")
	}

	ujianMaster, err := s.repo.GetByID(umID)
	if err != nil {
		return UjianMasterDetail{}, err // Let handler format the not found error
	}

	detail := UjianMasterDetail{
		UjianMaster: ujianMaster,
	}

	return detail, nil
}

// UpdateUjianMaster handles the update of an existing UjianMaster.
func (s *service) UpdateUjianMaster(ctx context.Context, id string, req UjianMaster) (UjianMaster, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMaster{}, errors.New("ID paket ujian tidak valid")
	}

	// Get existing data to ensure it exists
	_, err = s.repo.GetByID(umID)
	if err != nil {
		return UjianMaster{}, errors.New("paket ujian tidak ditemukan untuk diperbarui")
	}

	req.ID = umID // Ensure the ID from the URL is used for the update

	updatedUM, err := s.repo.Update(req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal memperbarui paket ujian di service: %w", err)
	}

	return updatedUM, nil
}

// DeleteUjianMaster handles the deletion of an UjianMaster.
func (s *service) DeleteUjianMaster(ctx context.Context, id string) error {
	umID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("ID paket ujian tidak valid")
	}
	return s.repo.Delete(umID)
}
