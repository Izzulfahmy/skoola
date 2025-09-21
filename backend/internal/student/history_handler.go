// file: backend/internal/student/history_handler.go
package student

import (
	"encoding/json"
	"net/http"
	"skoola/internal/middleware"

	"github.com/go-chi/chi/v5"
)

type HistoryHandler struct {
	service HistoryService
}

func NewHistoryHandler(s HistoryService) *HistoryHandler {
	return &HistoryHandler{service: s}
}

func (h *HistoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	studentID := chi.URLParam(r, "studentID")

	var input UpsertHistoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.CreateHistory(r.Context(), schemaName, studentID, input)
	if err != nil {
		http.Error(w, "Gagal membuat riwayat baru: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *HistoryHandler) GetByStudentID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	studentID := chi.URLParam(r, "studentID")

	histories, err := h.service.GetHistoryByStudentID(r.Context(), schemaName, studentID)
	if err != nil {
		http.Error(w, "Gagal mengambil data riwayat: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(histories)
}

func (h *HistoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	historyID := chi.URLParam(r, "historyID")

	var input UpsertHistoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateHistory(r.Context(), schemaName, historyID, input)
	if err != nil {
		http.Error(w, "Gagal memperbarui riwayat: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *HistoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	historyID := chi.URLParam(r, "historyID")

	err := h.service.DeleteHistory(r.Context(), schemaName, historyID)
	if err != nil {
		http.Error(w, "Gagal menghapus riwayat: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
