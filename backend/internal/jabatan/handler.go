// file: backend/internal/jabatan/handler.go
package jabatan

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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

	var input UpsertJabatanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	jabatan, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat jabatan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(jabatan)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	jabatanList, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data jabatan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jabatanList)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	jabatan, err := h.service.GetByID(r.Context(), schemaName, id)
	if err != nil {
		http.Error(w, "Gagal mengambil data jabatan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if jabatan == nil {
		http.Error(w, "Jabatan tidak ditemukan", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jabatan)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	var input UpsertJabatanInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err = h.service.Update(r.Context(), schemaName, id, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Jabatan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui jabatan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	err = h.service.Delete(r.Context(), schemaName, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Jabatan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus jabatan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
