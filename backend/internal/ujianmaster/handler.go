// backend/internal/ujianmaster/handler.go
package ujianmaster

import (
	"encoding/json"
	"log" // <-- Tambahkan import untuk logging
	"net/http"
	"skoola/internal/middleware"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertUjianMasterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		log.Printf("ERROR: Gagal membuat paket ujian: %v\n", err) // Log error
		http.Error(w, "Gagal membuat paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetAllByTA(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := chi.URLParam(r, "taID")

	result, err := h.service.GetAllByTA(r.Context(), schemaName, tahunAjaranID)
	if err != nil {
		// **PERUBAHAN UTAMA DI SINI: Mencetak error ke terminal**
		log.Printf("ERROR handler GetAllByTA: Gagal mengambil data paket ujian: %v\n", err)
		http.Error(w, "Gagal mengambil data paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetById(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")

	result, err := h.service.GetByID(r.Context(), schemaName, id)
	if err != nil {
		log.Printf("ERROR: Gagal mengambil detail paket ujian: %v\n", err) // Log error
		http.Error(w, "Gagal mengambil detail paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	var input UpsertUjianMasterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	_, err := h.service.Update(r.Context(), schemaName, id, input)
	if err != nil {
		log.Printf("ERROR: Gagal memperbarui paket ujian: %v\n", err) // Log error
		http.Error(w, "Gagal memperbarui paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	if err := h.service.Delete(r.Context(), schemaName, id); err != nil {
		log.Printf("ERROR: Gagal menghapus paket ujian: %v\n", err) // Log error
		http.Error(w, "Gagal menghapus paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
