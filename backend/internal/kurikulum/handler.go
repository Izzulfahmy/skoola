// file: backend/internal/kurikulum/handler.go
package kurikulum

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"skoola/internal/middleware"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// --- HANDLER BARU UNTUK ASOSIASI ---
func (h *Handler) AddKurikulumToTahunAjaran(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input AddKurikulumToTahunAjaranInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.AddKurikulumToTahunAjaran(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal menambahkan kurikulum ke tahun ajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

// === KURIKULUM HANDLERS ===
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kurikulumList, err := h.service.GetAllKurikulum(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data kurikulum: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(kurikulumList)
}

func (h *Handler) GetByTahunAjaran(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := r.URL.Query().Get("tahun_ajaran_id")

	if tahunAjaranID == "" {
		http.Error(w, "Parameter 'tahun_ajaran_id' diperlukan", http.StatusBadRequest)
		return
	}

	kurikulumList, err := h.service.GetKurikulumByTahunAjaran(r.Context(), schemaName, tahunAjaranID)
	if err != nil {
		http.Error(w, "Gagal mengambil data kurikulum: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(kurikulumList)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertKurikulumInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	newKurikulum, err := h.service.CreateKurikulum(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat kurikulum baru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newKurikulum)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID kurikulum tidak valid", http.StatusBadRequest)
		return
	}

	var input UpsertKurikulumInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err = h.service.UpdateKurikulum(r.Context(), schemaName, id, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Kurikulum tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui kurikulum: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID kurikulum tidak valid", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteKurikulum(r.Context(), schemaName, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Kurikulum tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus kurikulum: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// === FASE HANDLERS ===
func (h *Handler) GetAllFase(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	faseList, err := h.service.GetAllFase(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data fase: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(faseList)
}

func (h *Handler) CreateFase(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertFaseInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	newFase, err := h.service.CreateFase(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat fase: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newFase)
}

// === PEMETAAN HANDLERS ===
func (h *Handler) GetFaseTingkatan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := r.URL.Query().Get("tahun_ajaran_id")
	kurikulumID, _ := strconv.Atoi(r.URL.Query().Get("kurikulum_id"))

	results, err := h.service.GetFaseTingkatan(r.Context(), schemaName, tahunAjaranID, kurikulumID)
	if err != nil {
		http.Error(w, "Gagal mengambil pemetaan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(results)
}

func (h *Handler) CreatePemetaan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input PemetaanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	if err := h.service.CreatePemetaan(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal menyimpan pemetaan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) DeletePemetaan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := chi.URLParam(r, "tahunAjaranID")
	kurikulumID, _ := strconv.Atoi(chi.URLParam(r, "kurikulumID"))
	tingkatanID, _ := strconv.Atoi(chi.URLParam(r, "tingkatanID"))

	if err := h.service.DeletePemetaan(r.Context(), schemaName, tahunAjaranID, kurikulumID, tingkatanID); err != nil {
		http.Error(w, "Gagal menghapus pemetaan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// === TINGKATAN HANDLER ===
func (h *Handler) GetAllTingkatan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tingkatans, err := h.service.GetAllTingkatan(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data tingkatan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(tingkatans)
}
