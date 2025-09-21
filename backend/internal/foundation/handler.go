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

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input UpsertFoundationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	newFoundation, err := h.service.Create(r.Context(), input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat yayasan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newFoundation)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	foundations, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "Gagal mengambil data yayasan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(foundations)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	foundationID := chi.URLParam(r, "foundationID")
	var input UpsertFoundationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.Update(r.Context(), foundationID, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Yayasan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui yayasan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Yayasan berhasil diperbarui"})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	foundationID := chi.URLParam(r, "foundationID")
	err := h.service.Delete(r.Context(), foundationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Yayasan tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus yayasan: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
