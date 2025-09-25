// file: backend/internal/kelompokmapel/service.go
package kelompokmapel

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/matapelajaran"
	"sort"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertKelompokInput) (*KelompokMataPelajaran, error)
	GetAllWithMapel(ctx context.Context, schemaName string) ([]KelompokMataPelajaran, error)
	Update(ctx context.Context, schemaName string, id int, input UpsertKelompokInput) error
	Delete(ctx context.Context, schemaName string, id int) error
}

type service struct {
	repo      Repository
	mapelRepo matapelajaran.Repository // Inject repository mata pelajaran
	validate  *validator.Validate
}

func NewService(repo Repository, mapelRepo matapelajaran.Repository, validate *validator.Validate) Service {
	return &service{repo: repo, mapelRepo: mapelRepo, validate: validate}
}

func (s *service) GetAllWithMapel(ctx context.Context, schemaName string) ([]KelompokMataPelajaran, error) {
	// 1. Ambil semua kelompok
	kelompokList, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, err
	}

	// 2. Ambil semua mata pelajaran (datar)
	mapelList, err := s.mapelRepo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, err
	}

	// 3. Bangun struktur pohon (induk-anak) untuk mata pelajaran
	mapelMap := make(map[string]*matapelajaran.MataPelajaran)
	for i := range mapelList {
		mapelMap[mapelList[i].ID] = &mapelList[i]
	}

	var rootMapels []*matapelajaran.MataPelajaran
	for i := range mapelList {
		item := &mapelList[i]
		if item.ParentID != nil {
			if parent, ok := mapelMap[*item.ParentID]; ok {
				parent.Children = append(parent.Children, item)
			}
		} else {
			rootMapels = append(rootMapels, item)
		}
	}

	// 4. Kelompokkan mata pelajaran root ke dalam kelompoknya masing-masing
	kelompokResultMap := make(map[int]*KelompokMataPelajaran)
	for i := range kelompokList {
		kelompokResultMap[kelompokList[i].ID] = &kelompokList[i]
	}

	var ungroupedMapels []*matapelajaran.MataPelajaran
	for _, mapel := range rootMapels {
		if mapel.KelompokID != nil {
			if kelompok, ok := kelompokResultMap[*mapel.KelompokID]; ok {
				kelompok.MataPelajaran = append(kelompok.MataPelajaran, mapel)
			}
		} else {
			ungroupedMapels = append(ungroupedMapels, mapel)
		}
	}

	// 5. Susun hasil akhir
	var finalList []KelompokMataPelajaran
	if len(ungroupedMapels) > 0 {
		finalList = append(finalList, KelompokMataPelajaran{
			ID:            0, // ID 0 untuk mapel tanpa kelompok
			NamaKelompok:  "Tanpa Kelompok",
			MataPelajaran: ungroupedMapels,
		})
	}

	// Pastikan urutan kelompok benar
	sort.SliceStable(kelompokList, func(i, j int) bool {
		return kelompokList[i].Urutan < kelompokList[j].Urutan
	})

	for _, kelompok := range kelompokList {
		if val, ok := kelompokResultMap[kelompok.ID]; ok {
			finalList = append(finalList, *val)
		}
	}

	return finalList, nil
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertKelompokInput) (*KelompokMataPelajaran, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	// Jika urutan tidak diisi, tentukan otomatis
	if input.Urutan == nil {
		maxUrutan, err := s.repo.GetMaxUrutan(ctx, schemaName)
		if err != nil {
			return nil, err
		}
		nextUrutan := maxUrutan + 1
		input.Urutan = &nextUrutan
	}

	return s.repo.Create(ctx, schemaName, input)
}

func (s *service) Update(ctx context.Context, schemaName string, id int, input UpsertKelompokInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.Update(ctx, schemaName, id, input)
}

func (s *service) Delete(ctx context.Context, schemaName string, id int) error {
	return s.repo.Delete(ctx, schemaName, id)
}
