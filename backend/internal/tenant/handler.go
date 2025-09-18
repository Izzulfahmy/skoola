// file: backend/internal/tenant/handler.go
package tenant

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// --- FUNGSI BARU DITAMBAHKAN DI SINI ---
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

// Fungsi Register tetap sama
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
