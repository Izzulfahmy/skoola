// file: backend/internal/presensi/handler.go
package presensi

import (
	"encoding/json"
	"net/http"
	"skoola/internal/middleware"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// --- HANDLER BARU ---
func (h *Handler) DeletePresensi(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input DeletePresensiInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.DeletePresensi(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal menghapus data presensi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data presensi berhasil dihapus."})
}

// --- FUNGSI LAMA (TIDAK BERUBAH) ---
func (h *Handler) GetPresensi(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")

	yearStr := r.URL.Query().Get("year")
	monthStr := r.URL.Query().Get("month")

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		year = time.Now().Year()
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		month = int(time.Now().Month())
	}

	result, err := h.service.GetPresensi(r.Context(), schemaName, kelasID, year, month)
	if err != nil {
		http.Error(w, "Gagal mengambil data presensi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
func (h *Handler) UpsertPresensi(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertPresensiInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.UpsertPresensi(r.Context(), schemaName, input); err != nil {
		http.Error(w, "Gagal menyimpan data presensi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data presensi berhasil disimpan."})
}
