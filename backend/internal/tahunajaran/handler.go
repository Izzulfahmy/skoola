// file: backend/internal/tahunajaran/handler.go
package tahunajaran

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log" // <-- Impor paket log
	"net/http"
	"skoola/internal/middleware"

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
	var input UpsertTahunAjaranInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat tahun ajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	list, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		// --- PERBAIKAN DI SINI ---
		log.Printf("ERROR: Gagal mengambil data tahun ajaran untuk schema %s: %v", schemaName, err)
		http.Error(w, "Gagal mengambil data tahun ajaran: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	item, err := h.service.GetByID(r.Context(), schemaName, id)
	if err != nil {
		http.Error(w, "Gagal mengambil data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if item == nil {
		http.Error(w, "Data tidak ditemukan", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	var input UpsertTahunAjaranInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	updated, err := h.service.Update(r.Context(), schemaName, id, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Data tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	err := h.service.Delete(r.Context(), schemaName, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Data tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
