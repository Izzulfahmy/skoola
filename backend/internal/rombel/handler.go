// file: backend/internal/rombel/handler.go
package rombel

import (
	"encoding/json"
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

// --- Handler untuk Kelas (Rombel) ---

func (h *Handler) GetAllKelasByTahunAjaran(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := r.URL.Query().Get("tahun_ajaran_id")

	result, err := h.service.GetAllKelasByTahunAjaran(r.Context(), schemaName, tahunAjaranID)
	if err != nil {
		http.Error(w, "Gagal mengambil data rombel: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetKelasByID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")

	result, err := h.service.GetKelasByID(r.Context(), schemaName, kelasID)
	if err != nil {
		http.Error(w, "Gagal mengambil data rombel: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if result == nil {
		http.Error(w, "Rombel tidak ditemukan", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreateKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.CreateKelas(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat rombel: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")
	var input UpsertKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.UpdateKelas(r.Context(), schemaName, kelasID, input)
	if err != nil {
		http.Error(w, "Gagal memperbarui rombel: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) DeleteKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")

	if err := h.service.DeleteKelas(r.Context(), schemaName, kelasID); err != nil {
		http.Error(w, "Gagal menghapus rombel: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- Handler untuk Anggota Kelas (Siswa) ---

func (h *Handler) GetAllAnggotaByKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")

	result, err := h.service.GetAllAnggotaByKelas(r.Context(), schemaName, kelasID)
	if err != nil {
		http.Error(w, "Gagal mengambil anggota kelas: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) AddAnggotaKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")
	var input AddAnggotaKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.service.AddAnggotaKelas(r.Context(), schemaName, kelasID, input); err != nil {
		http.Error(w, "Gagal menambahkan anggota kelas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) RemoveAnggotaKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	anggotaID := chi.URLParam(r, "anggotaID")

	if err := h.service.RemoveAnggotaKelas(r.Context(), schemaName, anggotaID); err != nil {
		http.Error(w, "Gagal menghapus anggota kelas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- Handler untuk Pengajar Kelas (Guru) ---

func (h *Handler) GetAllPengajarByKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")

	result, err := h.service.GetAllPengajarByKelas(r.Context(), schemaName, kelasID)
	if err != nil {
		http.Error(w, "Gagal mengambil data pengajar: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreatePengajarKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	kelasID := chi.URLParam(r, "kelasID")
	var input UpsertPengajarKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	result, err := h.service.CreatePengajarKelas(r.Context(), schemaName, kelasID, input)
	if err != nil {
		http.Error(w, "Gagal menugaskan pengajar: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) RemovePengajarKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	pengajarID := chi.URLParam(r, "pengajarID")

	if err := h.service.RemovePengajarKelas(r.Context(), schemaName, pengajarID); err != nil {
		http.Error(w, "Gagal menghapus tugas pengajar: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
