package teacher

import (
	"encoding/json"
	"net/http"
)

// Handler menangani request HTTP untuk entitas guru.
type Handler struct {
	service Service // Dependensi ke service
}

// NewHandler membuat instance baru dari Handler.
func NewHandler(s Service) *Handler {
	return &Handler{
		service: s,
	}
}

// Create adalah handler untuk endpoint POST /teachers.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	// 1. Mengambil schemaName (ID Tenant) dari context.
	// Ini adalah cara paling umum. Sebuah middleware di lapisan sebelumnya
	// akan bertanggung jawab untuk otentikasi dan menaruh schemaName di context.
	schemaName := r.Context().Value("schemaName")
	if schemaName == nil || schemaName.(string) == "" {
		http.Error(w, "Gagal mengidentifikasi tenant", http.StatusUnauthorized)
		return
	}

	// 2. Decode body request JSON ke dalam struct CreateTeacherInput.
	var input CreateTeacherInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// 3. Panggil service untuk menjalankan logika bisnis.
	err := h.service.Create(r.Context(), schemaName.(string), input)
	if err != nil {
		// Di aplikasi production, kita akan punya error handling yg lebih baik
		// untuk membedakan antara 4xx (client error) dan 5xx (server error).
		http.Error(w, "Gagal membuat guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. Kirim respons berhasil.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Guru berhasil dibuat"})
}
