// file: backend/internal/pembelajaran/handler.go
package pembelajaran

import (
	"encoding/json"
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

// --- HANDLER BARU ---
func (h *Handler) UpdateUrutanMateri(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpdateUrutanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	if err := h.service.UpdateUrutanMateri(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal memperbarui urutan materi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) UpdateUrutanTujuan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpdateUrutanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	if err := h.service.UpdateUrutanTujuan(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal memperbarui urutan tujuan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Sisa file handler.go tetap sama
func (h *Handler) CreateMateri(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertMateriInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.CreateMateri(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat materi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetAllMateriByPengajarKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	pengajarKelasID := chi.URLParam(r, "pengajarKelasID")

	result, err := h.service.GetAllMateriByPengajarKelas(r.Context(), schemaName, pengajarKelasID)
	if err != nil {
		http.Error(w, "Gagal mengambil data materi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateMateri(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	materiID, _ := strconv.Atoi(chi.URLParam(r, "materiID"))
	var input UpsertMateriInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateMateri(r.Context(), schemaName, materiID, input); err != nil {
		http.Error(w, "Gagal memperbarui materi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) DeleteMateri(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	materiID, _ := strconv.Atoi(chi.URLParam(r, "materiID"))

	if err := h.service.DeleteMateri(r.Context(), schemaName, materiID); err != nil {
		http.Error(w, "Gagal menghapus materi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) CreateTujuan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertTujuanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.CreateTujuan(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat tujuan pembelajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateTujuan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tujuanID, _ := strconv.Atoi(chi.URLParam(r, "tujuanID"))
	var input UpsertTujuanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateTujuan(r.Context(), schemaName, tujuanID, input); err != nil {
		http.Error(w, "Gagal memperbarui tujuan pembelajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) DeleteTujuan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tujuanID, _ := strconv.Atoi(chi.URLParam(r, "tujuanID"))

	if err := h.service.DeleteTujuan(r.Context(), schemaName, tujuanID); err != nil {
		http.Error(w, "Gagal menghapus tujuan pembelajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
