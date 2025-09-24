// file: backend/internal/penilaian/handler.go
package penilaian

import (
	"encoding/json"
	"net/http"
	"skoola/internal/middleware"
	"strconv"
	"strings"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) GetPenilaian(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := r.URL.Query().Get("kelas_id")
	tpIDsStr := r.URL.Query().Get("tp_ids")

	var tpIDs []int
	if tpIDsStr != "" {
		for _, idStr := range strings.Split(tpIDsStr, ",") {
			id, err := strconv.Atoi(idStr)
			if err == nil {
				tpIDs = append(tpIDs, id)
			}
		}
	}

	result, err := h.service.GetPenilaianByTP(r.Context(), schemaName, kelasID, tpIDs)
	if err != nil {
		http.Error(w, "Gagal mengambil data penilaian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpsertNilai(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input BulkPenilaianInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.UpsertNilai(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal menyimpan nilai: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Nilai berhasil disimpan."})
}
