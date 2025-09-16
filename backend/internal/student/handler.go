// file: backend/internal/student/handler.go
package student

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"skoola/internal/middleware" // <-- 1. UBAH IMPORT DARI auth MENJADI middleware

	"github.com/go-chi/chi/v5"
)

// Handler menangani request HTTP untuk entitas siswa.
type Handler struct {
	service Service
}

// NewHandler membuat instance baru dari Handler siswa.
func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

// Create adalah handler untuk endpoint POST /students.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	// 2. GUNAKAN middleware.SchemaNameKey
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	var input CreateStudentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	newStudent, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Gagal membuat siswa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newStudent)
}

// GetAll adalah handler untuk endpoint GET /students.
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	// 3. PERBAIKI JUGA DI SINI
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	students, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data siswa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(students)
}

// GetByID adalah handler untuk endpoint GET /students/{id}.
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	// 4. DAN DI SINI
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	studentID := chi.URLParam(r, "studentID")

	student, err := h.service.GetByID(r.Context(), schemaName, studentID)
	if err != nil {
		http.Error(w, "Gagal mengambil data siswa", http.StatusInternalServerError)
		return
	}
	if student == nil {
		http.Error(w, "Siswa tidak ditemukan", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(student)
}

// Update adalah handler untuk endpoint PUT /students/{id}.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	// 5. DAN DI SINI
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	studentID := chi.URLParam(r, "studentID")

	var input UpdateStudentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.Update(r.Context(), schemaName, studentID, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err == sql.ErrNoRows || errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Siswa tidak ditemukan untuk diupdate", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal mengupdate data siswa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Siswa berhasil diperbarui"})
}

// Delete adalah handler untuk endpoint DELETE /students/{id}.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	// 6. DAN TERAKHIR DI SINI
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	studentID := chi.URLParam(r, "studentID")

	err := h.service.Delete(r.Context(), schemaName, studentID)
	if err != nil {
		if err == sql.ErrNoRows || errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Siswa tidak ditemukan untuk dihapus", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus data siswa", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
