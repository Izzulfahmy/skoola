// file: backend/internal/teacher/handler.go
package teacher

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"skoola/internal/middleware" // <-- 1. IMPORT PAKET middleware

	"github.com/go-chi/chi/v5"
)

// Handler menangani request HTTP untuk entitas guru.
type Handler struct {
	service Service
}

// NewHandler membuat instance baru dari Handler.
func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

// Create adalah handler untuk endpoint POST /teachers.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	// 2. Gunakan kunci dari paket middleware untuk mengambil schemaName
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	var input CreateTeacherInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Guru berhasil dibuat"})
}

// GetAll adalah handler untuk endpoint GET /teachers.
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	teachers, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(teachers)
}

// GetByID adalah handler untuk endpoint GET /teachers/{id}.
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	teacherID := chi.URLParam(r, "teacherID")
	if teacherID == "" {
		http.Error(w, "ID guru tidak boleh kosong", http.StatusBadRequest)
		return
	}

	teacher, err := h.service.GetByID(r.Context(), schemaName, teacherID)
	if err != nil {
		http.Error(w, "Gagal mengambil data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if teacher == nil {
		http.Error(w, "Guru tidak ditemukan", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(teacher)
}

// Update adalah handler untuk endpoint PUT /teachers/{id}.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	teacherID := chi.URLParam(r, "teacherID")
	if teacherID == "" {
		http.Error(w, "ID guru tidak boleh kosong", http.StatusBadRequest)
		return
	}

	var input UpdateTeacherInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.Update(r.Context(), schemaName, teacherID, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err == sql.ErrNoRows {
			http.Error(w, "Guru tidak ditemukan untuk diupdate", http.StatusNotFound)
			return
		}

		http.Error(w, "Gagal mengupdate data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Guru berhasil diperbarui"})
}

// Delete adalah handler untuk endpoint DELETE /teachers/{id}.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	teacherID := chi.URLParam(r, "teacherID")
	if teacherID == "" {
		http.Error(w, "ID guru tidak boleh kosong", http.StatusBadRequest)
		return
	}

	err := h.service.Delete(r.Context(), schemaName, teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Guru tidak ditemukan untuk dihapus", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
