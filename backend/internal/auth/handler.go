// file: internal/auth/handler.go
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
	// 1. Ambil ID Tenant dari header. Endpoint login ini publik,
	// tapi kita tetap butuh tenant untuk tahu di mana harus mencari data user.
	schemaName := r.Header.Get("X-Tenant-ID")
	if schemaName == "" {
		http.Error(w, "Header X-Tenant-ID wajib diisi", http.StatusBadRequest)
		return
	}

	// 2. Decode body request JSON ke dalam struct LoginInput.
	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// 3. Panggil service untuk menjalankan logika login.
	token, err := h.service.Login(r.Context(), schemaName, input)
	if err != nil {
		// Periksa jenis error yang spesifik dari service.
		if errors.Is(err, ErrInvalidCredentials) || errors.Is(err, ErrUserNotFound) {
			// Jika kredensial salah, kirim 401 Unauthorized.
			http.Error(w, "Email atau password salah", http.StatusUnauthorized)
			return
		}

		// Untuk error lainnya, anggap sebagai error server.
		http.Error(w, "Terjadi kesalahan internal", http.StatusInternalServerError)
		return
	}

	// 4. Kirim respons berhasil yang berisi token JWT.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
