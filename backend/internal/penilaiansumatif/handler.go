// file: backend/internal/penilaiansumatif/handler.go
package penilaiansumatif

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

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertPenilaianSumatifInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat penilaian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	var input UpsertPenilaianSumatifInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.Update(r.Context(), schemaName, id, input); err != nil {
		http.Error(w, "Gagal memperbarui penilaian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	if err := h.service.Delete(r.Context(), schemaName, id); err != nil {
		http.Error(w, "Gagal menghapus penilaian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetByTujuanPembelajaranID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tpID, err := strconv.Atoi(r.URL.Query().Get("tp_id"))
	if err != nil {
		http.Error(w, "Parameter 'tp_id' tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.GetByTujuanPembelajaranID(r.Context(), schemaName, tpID)
	if err != nil {
		http.Error(w, "Gagal mengambil data penilaian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
