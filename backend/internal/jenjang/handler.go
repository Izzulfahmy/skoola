// file: backend/internal/jenjang/handler.go
package jenjang

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

	var input UpsertJenjangInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	jenjang, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat jenjang pendidikan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(jenjang)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	jenjangList, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data jenjang: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jenjangList)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	jenjang, err := h.service.GetByID(r.Context(), schemaName, id)
	if err != nil {
		http.Error(w, "Gagal mengambil data jenjang: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if jenjang == nil {
		http.Error(w, "Jenjang pendidikan tidak ditemukan", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jenjang)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	var input UpsertJenjangInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err = h.service.Update(r.Context(), schemaName, id, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Jenjang tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui jenjang: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "Jenjang tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus jenjang: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
