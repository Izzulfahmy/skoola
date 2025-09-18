// file: backend/internal/auth/handler.go
package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

// Handler menangani request HTTP untuk otentikasi.
type Handler struct {
	service Service
}

// NewHandler membuat instance baru dari Handler otentikasi.
func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

// Login adalah handler untuk endpoint POST /login.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	// Ambil ID Tenant dari header. Ini opsional.
	// Untuk superadmin, header ini tidak akan ada.
	// Untuk admin/guru sekolah, header ini wajib ada.
	schemaName := r.Header.Get("X-Tenant-ID")

	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// Panggil service untuk menjalankan logika login.
	token, err := h.service.Login(r.Context(), schemaName, input)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) || errors.Is(err, ErrUserNotFound) {
			http.Error(w, "Email atau password salah", http.StatusUnauthorized)
			return
		}
		// Untuk error lainnya, anggap sebagai error server.
		http.Error(w, "Terjadi kesalahan internal: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Kirim respons berhasil yang berisi token JWT.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
