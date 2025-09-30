// file: backend/internal/ekstrakurikuler/handler.go
package ekstrakurikuler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"skoola/internal/middleware"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// --- Master Ekstrakurikuler Handlers (from settings) ---
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertEkstrakurikulerInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	result, err := h.service.Create(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat ekstrakurikuler: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	result, err := h.service.GetAll(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	var input UpsertEkstrakurikulerInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}
	err := h.service.Update(r.Context(), schemaName, id, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Data tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	err := h.service.Delete(r.Context(), schemaName, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Data tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- Sesi & Anggota Handlers (from new menu) ---

func (h *Handler) GetSesi(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ekskulID, errEkskul := strconv.Atoi(r.URL.Query().Get("ekskulId"))
	tahunAjaranID := r.URL.Query().Get("tahunAjaranId") // FIX: Langsung ambil sebagai string

	// FIX: Hapus pengecekan error untuk tahunAjaranID dan periksa string kosong
	if errEkskul != nil || tahunAjaranID == "" {
		http.Error(w, "Parameter 'ekskulId' (int) dan 'tahunAjaranId' (string) wajib ada", http.StatusBadRequest)
		return
	}

	result, err := h.service.GetOrCreateSesi(r.Context(), schemaName, ekskulID, tahunAjaranID)
	if err != nil {
		http.Error(w, "Gagal mendapatkan atau membuat sesi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateSesiDetail(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	sesiID, _ := strconv.Atoi(chi.URLParam(r, "sesiId"))

	var input UpdateSesiDetailInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateSesiDetail(r.Context(), schemaName, sesiID, input)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Sesi tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal memperbarui detail sesi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetAnggota(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	sesiID, _ := strconv.Atoi(chi.URLParam(r, "sesiId"))

	result, err := h.service.GetAnggotaBySesiID(r.Context(), schemaName, sesiID)
	if err != nil {
		http.Error(w, "Gagal mengambil data anggota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) AddAnggota(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	sesiID, _ := strconv.Atoi(chi.URLParam(r, "sesiId"))

	var input AddAnggotaInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	err := h.service.AddAnggota(r.Context(), schemaName, sesiID, input)
	if err != nil {
		http.Error(w, "Gagal menambah anggota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) RemoveAnggota(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	anggotaID, _ := strconv.Atoi(chi.URLParam(r, "anggotaId"))

	err := h.service.RemoveAnggota(r.Context(), schemaName, anggotaID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Anggota tidak ditemukan", http.StatusNotFound)
			return
		}
		http.Error(w, "Gagal menghapus anggota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
