// file: backend/internal/student/history_service.go
package student

import (
	"context"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type HistoryService interface {
	CreateHistory(ctx context.Context, schemaName string, studentID string, input UpsertHistoryInput) error
	GetHistoryByStudentID(ctx context.Context, schemaName string, studentID string) ([]RiwayatAkademik, error)
	UpdateHistory(ctx context.Context, schemaName string, historyID string, input UpsertHistoryInput) error
	DeleteHistory(ctx context.Context, schemaName string, historyID string) error
}

type historyService struct {
	repo     HistoryRepository
	validate *validator.Validate
}

func NewHistoryService(repo HistoryRepository, validate *validator.Validate) HistoryService {
	return &historyService{repo: repo, validate: validate}
}

func (s *historyService) CreateHistory(ctx context.Context, schemaName string, studentID string, input UpsertHistoryInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	eventDate, _ := time.Parse("2006-01-02", input.TanggalKejadian)

	history := &RiwayatAkademik{
		ID:              uuid.New().String(),
		StudentID:       studentID,
		Status:          input.Status,
		TanggalKejadian: eventDate,
		KelasTingkat:    stringToPtr(input.KelasTingkat),
		Keterangan:      stringToPtr(input.Keterangan),
	}
	return s.repo.Create(ctx, schemaName, history)
}

func (s *historyService) GetHistoryByStudentID(ctx context.Context, schemaName string, studentID string) ([]RiwayatAkademik, error) {
	return s.repo.GetByStudentID(ctx, schemaName, studentID)
}

func (s *historyService) UpdateHistory(ctx context.Context, schemaName string, historyID string, input UpsertHistoryInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	history, err := s.repo.GetByID(ctx, schemaName, historyID)
	if err != nil {
		return fmt.Errorf("gagal menemukan riwayat: %w", err)
	}

	eventDate, _ := time.Parse("2006-01-02", input.TanggalKejadian)

	history.Status = input.Status
	history.TanggalKejadian = eventDate
	history.KelasTingkat = stringToPtr(input.KelasTingkat)
	history.Keterangan = stringToPtr(input.Keterangan)

	return s.repo.Update(ctx, schemaName, history)
}

func (s *historyService) DeleteHistory(ctx context.Context, schemaName string, historyID string) error {
	return s.repo.Delete(ctx, schemaName, historyID)
}
