// file: backend/internal/foundation/handler.go
package foundation

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	naunganID := chi.URLParam(r, "naunganID")
	naungan, err := h.service.GetByID(r.Context(), naunganID)
	if err != nil {
		http.Error(w, "Gagal mengambil data naungan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if naungan == nil {
		http.Error(w, "Naungan tidak ditemukan", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(naungan)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input UpsertNaunganInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	newNaungan, err := h.service.Create(r.Context(), input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat naungan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newNaungan)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	naunganList, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "Gagal mengambil data naungan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(naunganList)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	naunganID := chi.URLParam(r, "naunganID")
	var input UpsertNaunganInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.Update(r.Context(), naunganID, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Naungan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui naungan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Naungan berhasil diperbarui"})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	naunganID := chi.URLParam(r, "naunganID")
	err := h.service.Delete(r.Context(), naunganID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Naungan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus naungan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
