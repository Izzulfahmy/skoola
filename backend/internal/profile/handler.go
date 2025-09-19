// file: backend/internal/profile/handler.go
package profile

import (
	"encoding/json"
	"net/http"
	"skoola/internal/middleware"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

// GetProfile menangani permintaan GET /profile
func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// Ambil schemaName dari token JWT yang sudah diproses oleh middleware
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi sekolah dari token", http.StatusUnauthorized)
		return
	}

	profile, err := h.service.GetProfile(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil profil sekolah: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(profile)
}

// UpdateProfile menangani permintaan PUT /profile
func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	schemaName, ok := r.Context().Value(middleware.SchemaNameKey).(string)
	if !ok || schemaName == "" {
		http.Error(w, "Gagal mengidentifikasi sekolah dari token", http.StatusUnauthorized)
		return
	}

	var input ProfilSekolah
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateProfile(r.Context(), schemaName, &input)
	if err != nil {
		http.Error(w, "Gagal memperbarui profil sekolah: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Profil sekolah berhasil diperbarui."})
}
