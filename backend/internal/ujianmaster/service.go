package ujianmaster

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

// Service defines the business logic for UjianMaster.
type Service interface {
	CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error)
	GetAllUjianMasterByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error)
	GetUjianMasterByID(ctx context.Context, schemaName string, id string) (UjianMasterDetail, error)
	UpdateUjianMaster(ctx context.Context, schemaName string, id string, req UjianMaster) (UjianMaster, error)
	DeleteUjianMaster(ctx context.Context, schemaName string, id string) error
	AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID string, pengajarKelasIDs []string) (int, error)
}

type service struct {
	repo Repository
}

// NewService creates a new UjianMaster service.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// CreateUjianMaster handles the creation of a new UjianMaster.
func (s *service) CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error) {
	// Validation can be added here if necessary
	// Pemanggilan ini sekarang sudah benar sesuai dengan interface yang diperbaiki
	createdUM, err := s.repo.Create(ctx, schemaName, req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal membuat paket ujian di service: %w", err)
	}
	return createdUM, nil
}

// GetAllUjianMasterByTahunAjaran retrieves all UjianMasters for a given academic year.
func (s *service) GetAllUjianMasterByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]UjianMaster, error) {
	taID, err := uuid.Parse(tahunAjaranID)
	if err != nil {
		return nil, errors.New("ID tahun ajaran tidak valid")
	}
	return s.repo.GetAllByTahunAjaran(ctx, schemaName, taID)
}

// GetUjianMasterByID retrieves details of a specific UjianMaster.
func (s *service) GetUjianMasterByID(ctx context.Context, schemaName string, id string) (UjianMasterDetail, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMasterDetail{}, errors.New("ID paket ujian tidak valid")
	}

	ujianMaster, err := s.repo.GetByID(ctx, schemaName, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	penugasan, err := s.repo.GetPenugasanByUjianMasterID(ctx, schemaName, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	availableKelas, err := s.repo.GetAvailableKelasForUjian(ctx, schemaName, ujianMaster.TahunAjaranID, umID)
	if err != nil {
		return UjianMasterDetail{}, err
	}

	detail := UjianMasterDetail{
		Detail:         ujianMaster,
		Penugasan:      penugasan,
		AvailableKelas: availableKelas,
	}

	return detail, nil
}

// UpdateUjianMaster handles the update of an existing UjianMaster.
func (s *service) UpdateUjianMaster(ctx context.Context, schemaName string, id string, req UjianMaster) (UjianMaster, error) {
	umID, err := uuid.Parse(id)
	if err != nil {
		return UjianMaster{}, errors.New("ID paket ujian tidak valid")
	}

	// Get existing data to ensure it exists
	existing, err := s.repo.GetByID(ctx, schemaName, umID)
	if err != nil {
		return UjianMaster{}, errors.New("paket ujian tidak ditemukan untuk diperbarui")
	}

	req.ID = umID                              // Ensure the ID from the URL is used for the update
	req.TahunAjaranID = existing.TahunAjaranID // Keep the original tahun_ajaran_id

	updatedUM, err := s.repo.Update(ctx, schemaName, req)
	if err != nil {
		return UjianMaster{}, fmt.Errorf("gagal memperbarui paket ujian di service: %w", err)
	}

	return updatedUM, nil
}

// DeleteUjianMaster handles the deletion of an UjianMaster.
func (s *service) DeleteUjianMaster(ctx context.Context, schemaName string, id string) error {
	umID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("ID paket ujian tidak valid")
	}
	return s.repo.Delete(ctx, schemaName, umID)
}

func (s *service) AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID string, pengajarKelasIDs []string) (int, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}
	return s.repo.AssignKelasToUjian(ctx, schemaName, umID, pengajarKelasIDs)
}
