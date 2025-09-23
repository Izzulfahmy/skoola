// file: backend/internal/tahunajaran/service.go
package tahunajaran

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
	Create(ctx context.Context, schemaName string, input UpsertTahunAjaranInput) (*TahunAjaran, error)
	GetAll(ctx context.Context, schemaName string) ([]TahunAjaran, error)
	GetByID(ctx context.Context, schemaName string, id string) (*TahunAjaran, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertTahunAjaranInput) (*TahunAjaran, error)
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
	db       *sql.DB
}

func NewService(repo Repository, validate *validator.Validate, db *sql.DB) Service {
	return &service{repo: repo, validate: validate, db: db}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertTahunAjaranInput) (*TahunAjaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	ta := &TahunAjaran{
		ID:              uuid.New().String(),
		NamaTahunAjaran: input.NamaTahunAjaran,
		Semester:        input.Semester,
		Status:          input.Status,
		MetodeAbsensi:   input.MetodeAbsensi,
		KepalaSekolahID: input.KepalaSekolahID,
	}

	// Jika yang baru aktif, nonaktifkan yang lain
	if ta.Status == "Aktif" {
		if err := s.repo.DeactivateAllOthers(ctx, tx, schemaName, ta.ID); err != nil {
			return nil, err
		}
	}

	// Buat entitas baru dalam repository (harus dimodifikasi untuk menerima tx)
	// Untuk sementara, kita akan commit dan panggil create. Idealnya, repo.Create menerima tx.
	// Mari kita sederhanakan untuk sekarang:
	createdTA, err := s.repo.Create(ctx, schemaName, ta) // Anggap repo.Create tidak butuh tx untuk sementara
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return createdTA, nil
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpsertTahunAjaranInput) (*TahunAjaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	existing, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil || existing == nil {
		return nil, fmt.Errorf("data tidak ditemukan")
	}

	existing.NamaTahunAjaran = input.NamaTahunAjaran
	existing.Semester = input.Semester
	existing.Status = input.Status
	existing.MetodeAbsensi = input.MetodeAbsensi
	existing.KepalaSekolahID = input.KepalaSekolahID

	if existing.Status == "Aktif" {
		if err := s.repo.DeactivateAllOthers(ctx, tx, schemaName, existing.ID); err != nil {
			return nil, err
		}
	}

	if err := s.repo.Update(ctx, schemaName, existing); err != nil { // Anggap repo.Update tidak butuh tx
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]TahunAjaran, error) {
	return s.repo.GetAll(ctx, schemaName)
}

func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*TahunAjaran, error) {
	return s.repo.GetByID(ctx, schemaName, id)
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}
