package ujianmaster

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/rombel" // <-- Import baru
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
	GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error) // <-- BARU
}

type service struct {
	repo          Repository
	rombelService rombel.Service // <-- Dependensi baru
}

// NewService creates a new UjianMaster service.
func NewService(repo Repository, rombelService rombel.Service) Service { // <-- Diperbarui
	return &service{
		repo:          repo,
		rombelService: rombelService, // <-- Inisialisasi dependensi
	}
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

// AssignKelasToUjian menugaskan kelas ke ujian master dan secara otomatis membuat
// daftar peserta ujian dari semua siswa di kelas tersebut.
func (s *service) AssignKelasToUjian(ctx context.Context, schemaName string, ujianMasterID string, pengajarKelasIDs []string) (int, error) {
	// 1. Validasi dan konversi semua ID yang masuk
	umID, err := uuid.Parse(ujianMasterID)
	if err != nil {
		return 0, errors.New("ID paket ujian tidak valid")
	}

	var pids []uuid.UUID
	for _, idStr := range pengajarKelasIDs {
		pid, err := uuid.Parse(idStr)
		if err != nil {
			return 0, fmt.Errorf("ID pengajar kelas tidak valid: %s", idStr)
		}
		pids = append(pids, pid)
	}

	// 2. Buat entri penugasan ujian di database
	if _, err := s.repo.AssignKelasToUjian(ctx, schemaName, umID, pengajarKelasIDs); err != nil {
		return 0, fmt.Errorf("gagal menugaskan kelas ke ujian: %w", err)
	}

	// 3. Ambil semua anggota kelas dari kelas yang baru ditugaskan melalui rombelService
	anggota, err := s.rombelService.GetAnggotaKelasByPengajarKelasIDs(ctx, schemaName, pids)
	if err != nil {
		// Jika gagal mengambil anggota, penugasan tetap terjadi.
		// Pertimbangkan mekanisme rollback jika ini tidak diinginkan.
		return 0, fmt.Errorf("gagal mengambil anggota kelas setelah penugasan: %w", err)
	}

	// 4. Transformasi data anggota kelas menjadi data peserta ujian
	if len(anggota) == 0 {
		return 0, nil // Tidak ada siswa di kelas tersebut, proses selesai.
	}

	peserta := make([]PesertaUjian, len(anggota))
	now := time.Now()
	for i, anggotaKelas := range anggota {
		peserta[i] = PesertaUjian{
			ID:             uuid.New(),
			UjianMasterID:  umID,
			AnggotaKelasID: uuid.MustParse(anggotaKelas.ID), // Asumsi ID anggota kelas adalah string UUID
			Urutan:         anggotaKelas.Urutan,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
	}

	// 5. Simpan semua data peserta ujian baru ke database dalam satu batch
	if err := s.repo.CreatePesertaUjianBatch(ctx, schemaName, peserta); err != nil {
		return 0, fmt.Errorf("gagal membuat data peserta ujian: %w", err)
	}

	return len(peserta), nil
}

// GetPesertaUjianByUjianID mengambil dan mengelompokkan data peserta berdasarkan kelas.
func (s *service) GetPesertaUjianByUjianID(ctx context.Context, schemaName string, ujianID string) (GroupedPesertaUjian, error) {
	uid, err := uuid.Parse(ujianID)
	if err != nil {
		return nil, errors.New("ID ujian tidak valid")
	}

	// Ambil daftar peserta dalam bentuk flat list dari repository
	peserta, err := s.repo.FindPesertaByUjianID(ctx, schemaName, uid)
	if err != nil {
		return nil, err
	}

	// Buat map untuk mengelompokkan peserta berdasarkan nama kelasnya
	grouped := make(GroupedPesertaUjian)
	for _, p := range peserta {
		// Nama kelas akan menjadi key di map
		namaKelas := p.NamaKelas

		// Tambahkan peserta ke dalam slice yang sesuai dengan nama kelasnya
		grouped[namaKelas] = append(grouped[namaKelas], p)
	}

	return grouped, nil
}
