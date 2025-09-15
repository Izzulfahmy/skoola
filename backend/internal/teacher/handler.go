package teacher

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5" // <-- IMPORT INI DIPERLUKAN
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

// GetAll adalah handler untuk endpoint GET /teachers.
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	// 1. Ambil schemaName dari context, sama seperti di handler Create.
	schemaName := r.Context().Value("schemaName")
	if schemaName == nil || schemaName.(string) == "" {
		http.Error(w, "Gagal mengidentifikasi tenant", http.StatusUnauthorized)
		return
	}

	// 2. Panggil service untuk mendapatkan data guru.
	teachers, err := h.service.GetAll(r.Context(), schemaName.(string))
	if err != nil {
		// Jika terjadi error dari service/repository, kirim respons 500.
		http.Error(w, "Gagal mengambil data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Jika berhasil, kirim respons sukses dengan data JSON.
	w.Header().Set("Content-Type", "application/json") // Beritahu klien bahwa responsnya adalah JSON.
	w.WriteHeader(http.StatusOK)                       // Set status kode 200 OK.

	// Encode (ubah) slice 'teachers' menjadi format JSON dan kirimkan.
	json.NewEncoder(w).Encode(teachers)
}

// GetByID adalah handler untuk endpoint GET /teachers/{id}.
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	// 1. Ambil schemaName dari context.
	schemaName := r.Context().Value("schemaName")
	if schemaName == nil || schemaName.(string) == "" {
		http.Error(w, "Gagal mengidentifikasi tenant", http.StatusUnauthorized)
		return
	}

	// 2. Ambil parameter ID dari URL.
	// "teacherID" adalah nama parameter yang akan kita definisikan di router nanti.
	teacherID := chi.URLParam(r, "teacherID")
	if teacherID == "" {
		http.Error(w, "ID guru tidak boleh kosong", http.StatusBadRequest)
		return
	}

	// 3. Panggil service untuk mendapatkan data guru.
	teacher, err := h.service.GetByID(r.Context(), schemaName.(string), teacherID)
	if err != nil {
		http.Error(w, "Gagal mengambil data guru: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. Jika service mengembalikan nil, artinya data tidak ditemukan.
	// Kirim respons 404 Not Found.
	if teacher == nil {
		http.Error(w, "Guru tidak ditemukan", http.StatusNotFound)
		return
	}

	// 5. Jika berhasil, kirim respons sukses dengan data JSON.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(teacher)
}
