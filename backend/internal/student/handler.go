// file: backend/internal/student/handler.go
package student

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"skoola/internal/middleware"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

func (h *Handler) GenerateTemplate(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)

	buffer, err := h.service.GenerateStudentImportTemplate(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal membuat template: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", "attachment; filename=template_import_siswa.xlsx")

	if _, err := w.Write(buffer.Bytes()); err != nil {
		http.Error(w, "Gagal mengirim file", http.StatusInternalServerError)
	}
}

func (h *Handler) ImportStudents(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)

	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		http.Error(w, "File terlalu besar", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Gagal mendapatkan file dari request: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	result, err := h.service.ImportStudents(r.Context(), schemaName, file)
	if err != nil {
		http.Error(w, "Gagal memproses file impor: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

// --- HANDLER BARU ---
func (h *Handler) GetAvailableStudents(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	tahunAjaranID := r.URL.Query().Get("tahun_ajaran_id")
	if tahunAjaranID == "" {
		http.Error(w, "Parameter 'tahun_ajaran_id' diperlukan", http.StatusBadRequest)
		return
	}

	students, err := h.service.GetAvailableStudentsByTahunAjaran(r.Context(), schemaName, tahunAjaranID)
	if err != nil {
		http.Error(w, "Gagal mengambil data siswa yang tersedia: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(students)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "Gagal membuat siswa: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newStudent)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}

	students, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data siswa: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(students)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	studentID := chi.URLParam(r, "studentID")

	student, err := h.service.GetByID(r.Context(), schemaName, studentID)
	if err != nil {
		http.Error(w, "Gagal mengambil data siswa: "+err.Error(), http.StatusInternalServerError)
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

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok {
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
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Siswa tidak ditemukan untuk diupdate", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal mengupdate data siswa: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Siswa berhasil diperbarui"})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok {
		http.Error(w, "Gagal mengidentifikasi tenant dari token", http.StatusUnauthorized)
		return
	}
	studentID := chi.URLParam(r, "studentID")

	err := h.service.Delete(r.Context(), schemaName, studentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Siswa tidak ditemukan untuk dihapus", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus data siswa: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
