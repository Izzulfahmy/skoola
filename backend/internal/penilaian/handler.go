// file: backend/internal/penilaian/handler.go
package penilaian

import (
	"encoding/json"
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

func (h *Handler) GetPenilaianLengkap(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")
	pengajarKelasID := chi.URLParam(r, "pengajarKelasID")

	result, err := h.service.GetPenilaianLengkap(r.Context(), schemaName, kelasID, pengajarKelasID)
	if err != nil {
		http.Error(w, "Gagal mengambil data penilaian lengkap: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpsertNilaiBulk(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input BulkUpsertNilaiInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.UpsertNilaiBulk(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal menyimpan nilai: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Nilai berhasil disimpan."})
}
