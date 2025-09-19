// file: backend/internal/tenant/handler.go
package tenant

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

// --- HANDLER BARU UNTUK MENGHAPUS TENANT ---
func (h *Handler) DeleteTenant(w http.ResponseWriter, r *http.Request) {
	schemaName := chi.URLParam(r, "schemaName")
	if schemaName == "" {
		http.Error(w, "ID unik sekolah (schemaName) tidak boleh kosong", http.StatusBadRequest)
		return
	}

	err := h.service.DeleteTenant(r.Context(), schemaName)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Sekolah dengan ID tersebut tidak ditemukan", http.StatusNotFound)
			return
		}
		// Untuk error lainnya, berikan pesan yang lebih umum namun catat detailnya di log server
		http.Error(w, "Gagal menghapus sekolah: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Berhasil dihapus, kirim status 204 No Content
	w.WriteHeader(http.StatusNoContent)
}

// --- FUNGSI-FUNGSI LAMA DI BAWAH INI TETAP SAMA ---

func (h *Handler) UpdateAdminEmail(w http.ResponseWriter, r *http.Request) {
	schemaName := chi.URLParam(r, "schemaName")
	if schemaName == "" {
		http.Error(w, "ID unik sekolah (schemaName) tidak boleh kosong", http.StatusBadRequest)
		return
	}
	var input UpdateAdminEmailInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.UpdateAdminEmail(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Admin untuk sekolah ini tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui email admin: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Email admin berhasil diperbarui."})
}

func (h *Handler) ResetAdminPassword(w http.ResponseWriter, r *http.Request) {
	schemaName := chi.URLParam(r, "schemaName")
	if schemaName == "" {
		http.Error(w, "ID unik sekolah (schemaName) tidak boleh kosong", http.StatusBadRequest)
		return
	}
	var input ResetAdminPasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.ResetAdminPassword(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Admin untuk sekolah ini tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal mereset password admin: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password admin berhasil direset."})
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	tenants, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "Gagal mengambil data sekolah: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(tenants)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterTenantInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.Register(r.Context(), input)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			http.Error(w, err.Error(), http.StatusBadRequest)
		} else {
			http.Error(w, "Terjadi kesalahan pada server: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Sekolah baru berhasil didaftarkan."})
}
