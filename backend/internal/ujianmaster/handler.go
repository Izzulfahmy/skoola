package ujianmaster

import (
	"encoding/json"
	"fmt"
	"net/http"
	"skoola/internal/middleware"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

type AssignKelasInput struct {
	PengajarKelasIDs []string `json:"pengajar_kelas_ids"`
}

// --- HANDLER UNTUK PESERTA UJIAN ---
type AddPesertaFromKelasInput struct {
	KelasID string `json:"kelas_id"`
}

func (h *Handler) AddPesertaFromKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	var input AddPesertaFromKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	count, err := h.service.AddPesertaFromKelas(r.Context(), schemaName, ujianMasterID, input.KelasID)
	if err != nil {
		http.Error(w, "Gagal menambah peserta ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Berhasil menambahkan peserta.",
		"successCount": count,
	})
}

// GetPesertaUjian mengambil data peserta dan mengelompokkannya
func (h *Handler) GetPesertaUjian(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianID := chi.URLParam(r, "id")
	if ujianID == "" {
		http.Error(w, "Parameter id ujian tidak ditemukan di URL", http.StatusBadRequest)
		return
	}

	groupedPeserta, err := h.service.GetPesertaUjianByUjianID(r.Context(), schemaName, ujianID)
	if err != nil {
		http.Error(w, "Gagal mengambil data peserta ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(groupedPeserta)
}

// --- Handler untuk menghapus peserta per kelas ---
func (h *Handler) DeletePesertaFromKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")
	kelasID := chi.URLParam(r, "kelasID")

	if kelasID == "" {
		http.Error(w, "Parameter kelasID tidak ditemukan di URL", http.StatusBadRequest)
		return
	}

	count, err := h.service.RemovePesertaByKelas(r.Context(), schemaName, ujianMasterID, kelasID)
	if err != nil {
		http.Error(w, "Gagal menghapus peserta ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      fmt.Sprintf("Berhasil menghapus %d peserta dari kelas.", count),
		"deletedCount": count,
	})
}

// --- GENERATE NOMOR UJIAN HANDLER - FIXED VERSION ---
func (h *Handler) GenerateNomorUjian(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	var input GenerateNomorUjianInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	// ✅ ALLOW EMPTY PREFIX - hanya validasi panjang maksimal
	if len(input.Prefix) > 10 {
		http.Error(w, "Prefix maksimal 10 karakter", http.StatusBadRequest)
		return
	}

	fmt.Printf("🚀 HANDLER: Generate nomor ujian dengan prefix: '%s'\n", input.Prefix)

	// Call service
	count, err := h.service.GenerateNomorUjianForUjianMaster(r.Context(), schemaName, ujianMasterID, input.Prefix)
	if err != nil {
		fmt.Printf("❌ HANDLER ERROR: %v\n", err)
		http.Error(w, "Gagal generate nomor ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Response dengan info apakah menggunakan prefix atau tidak
	message := ""
	if input.Prefix == "" {
		message = fmt.Sprintf("Berhasil generate %d nomor ujian (hanya angka)", count)
	} else {
		message = fmt.Sprintf("Berhasil generate %d nomor ujian dengan prefix '%s'", count, input.Prefix)
	}

	response := GenerateNomorUjianResponse{
		Message:        message,
		GeneratedCount: count,
		Prefix:         input.Prefix,
	}

	fmt.Printf("✅ HANDLER SUCCESS: Generated %d nomor ujian\n", count)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// -----------------

func (h *Handler) AssignKelas(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	var input AssignKelasInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	count, err := h.service.AssignKelasToUjian(r.Context(), schemaName, ujianMasterID, input.PengajarKelasIDs)
	if err != nil {
		http.Error(w, "Gagal menugaskan kelas: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Berhasil menugaskan kelas.",
		"successCount": count,
	})
}

// Create handles the creation of a new UjianMaster.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var um UjianMaster
	if err := json.NewDecoder(r.Body).Decode(&um); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	createdUM, err := h.service.CreateUjianMaster(r.Context(), schemaName, um)
	if err != nil {
		http.Error(w, "Gagal membuat paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUM)
}

// GetAllByTA handles getting all UjianMaster by Tahun Ajaran.
func (h *Handler) GetAllByTA(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	tahunAjaranID := chi.URLParam(r, "taID")
	if tahunAjaranID == "" {
		http.Error(w, "Parameter taID tidak ditemukan di URL", http.StatusBadRequest)
		return
	}

	results, err := h.service.GetAllUjianMasterByTahunAjaran(r.Context(), schemaName, tahunAjaranID)
	if err != nil {
		http.Error(w, "Gagal mengambil data paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GetByID handles getting a UjianMaster by its ID.
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	um, err := h.service.GetUjianMasterByID(r.Context(), schemaName, id)
	if err != nil {
		http.Error(w, "Paket ujian tidak ditemukan: "+err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(um)
}

// Update handles updating a UjianMaster.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	var um UjianMaster
	if err := json.NewDecoder(r.Body).Decode(&um); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	updatedUM, err := h.service.UpdateUjianMaster(r.Context(), schemaName, id, um)
	if err != nil {
		http.Error(w, "Gagal memperbarui paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUM)
}

// Delete handles deleting a UjianMaster.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	id := chi.URLParam(r, "id")
	err := h.service.DeleteUjianMaster(r.Context(), schemaName, id)
	if err != nil {
		http.Error(w, "Gagal menghapus paket ujian: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
