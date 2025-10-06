package ujianmaster

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/rombel"
	"time"

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
	GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error)
	AddPesertaFromKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int, error)
	// Mendefinisikan fungsi hapus peserta per kelas
	RemovePesertaByKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int64, error)
}

type service struct {
	repo          Repository
	rombelService rombel.Service
}

// NewService creates a new UjianMaster service.
func NewService(repo Repository, rombelService rombel.Service) Service {
	return &service{
		repo:          repo,
		rombelService: rombelService,
	}
}

// --- Implementasi Fungsi Baru: RemovePesertaByKelas ---

// RemovePesertaByKelas menghapus semua peserta ujian dari satu kelas tertentu
// dalam suatu paket ujian (ujian_master) tertentu.
func (s *service) RemovePesertaByKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int64, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	if kelasID == "" {
		return 0, errors.New("ID kelas tidak boleh kosong")
	}

	// FIX: Parsing kelasID menjadi UUID sebelum memanggil repository
	kelasUUID, err := uuid.Parse(kelasID)
	if err != nil {
		return 0, errors.New("ID kelas tidak valid")
	}

	// Memanggil fungsi Repository, menggunakan kelasUUID
	rowsAffected, err := s.repo.DeletePesertaByMasterAndKelas(ctx, schemaName, umID, kelasUUID)
	if err != nil {
		return 0, fmt.Errorf("gagal menghapus peserta ujian: %w", err)
	}

	return rowsAffected, nil
}

// --- Implementasi Fungsi Lainnya ---

func (s *service) AddPesertaFromKelas(ctx context.Context, schemaName string, ujianMasterID string, kelasID string) (int, error) {
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	anggota, err := s.rombelService.GetAllAnggotaByKelas(ctx, schemaName, kelasID)
	if err != nil {
		return 0, fmt.Errorf("gagal mengambil anggota kelas: %w", err)
	}

	if len(anggota) == 0 {
		return 0, nil
	}

	peserta := make([]PesertaUjian, len(anggota))
	now := time.Now()
	for i, anggotaKelas := range anggota {
		anggotaID, _ := uuid.Parse(anggotaKelas.ID)
		peserta[i] = PesertaUjian{
			ID:             uuid.New(),
			UjianMasterID:  umID,
			AnggotaKelasID: anggotaID,
			Urutan:         anggotaKelas.Urutan,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
	}

	if err := s.repo.CreatePesertaUjianBatch(ctx, schemaName, peserta); err != nil {
		return 0, fmt.Errorf("gagal membuat data peserta ujian: %w", err)
	}

	return len(peserta), nil
}

// CreateUjianMaster handles the creation of a new UjianMaster.
func (s *service) CreateUjianMaster(ctx context.Context, schemaName string, req UjianMaster) (UjianMaster, error) {
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

	existing, err := s.repo.GetByID(ctx, schemaName, umID)
	if err != nil {
		return UjianMaster{}, errors.New("paket ujian tidak ditemukan untuk diperbarui")
	}

	req.ID = umID
	req.TahunAjaranID = existing.TahunAjaranID

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

	if _, err := s.repo.AssignKelasToUjian(ctx, schemaName, umID, pengajarKelasIDs); err != nil {
		return 0, fmt.Errorf("gagal menugaskan kelas ke ujian: %w", err)
	}

	return len(pengajarKelasIDs), nil
}

// GetPesertaUjianByUjianID mengambil dan mengelompokkan data peserta berdasarkan kelas.
func (s *service) GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error) {
	uid, err := uuid.Parse(ujianID)
	if err != nil {
		return nil, errors.New("ID ujian tidak valid")
	}

	peserta, err := s.repo.FindPesertaByUjianID(ctx, schemaName, uid)
	if err != nil {
		return nil, err
	}

	grouped := make(GroupedPesertaUjian)
	for _, p := range peserta {
		namaKelas := p.NamaKelas
		grouped[namaKelas] = append(grouped[namaKelas], p)
	}

	return grouped, nil
}
