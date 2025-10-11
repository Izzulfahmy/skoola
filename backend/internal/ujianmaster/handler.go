package ujianmaster

import (
	"encoding/json"
	"fmt"
	"net/http"
	"skoola/internal/middleware"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	service   Service
	validator *validator.Validate
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service:   service,
		validator: validator.New(), // Inisialisasi validator
	}
}

// =================================================================================
// KARTU UJIAN HANDLERS
// =================================================================================

// GetKartuUjianFilters returns the list of unique rombels for filtering.
func (h *Handler) GetKartuUjianFilters(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterIDStr := chi.URLParam(r, "ujianMasterID") // Ambil sebagai string

	if ujianMasterIDStr == "" {
		http.Error(w, "Invalid UjianMaster ID: ID cannot be empty", http.StatusBadRequest)
		return
	}

	// FIX: Melewati string ID langsung ke service layer
	filters, err := h.service.GetKartuUjianFilters(r.Context(), schemaName, ujianMasterIDStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filters)
}

// GetKartuUjianData returns the list of participants with full details for the exam card tab.
func (h *Handler) GetKartuUjianData(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterIDStr := chi.URLParam(r, "ujianMasterID") // Ambil sebagai string

	if ujianMasterIDStr == "" {
		http.Error(w, "Invalid UjianMaster ID", http.StatusBadRequest)
		return
	}

	// Mengambil rombel_id dari query parameter. Dibiarkan sebagai string.
	rombelIDStr := r.URL.Query().Get("rombel_id")
	// Jika rombelIDStr kosong, service layer akan otomatis menganggapnya sebagai filter 'nil' atau '0'.

	// FIX: Melewati string ID langsung ke service layer
	data, err := h.service.GetKartuUjianData(r.Context(), schemaName, ujianMasterIDStr, rombelIDStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// GenerateKartuUjianPDF generates and downloads the PDF for selected participants (Mass Action).
func (h *Handler) GenerateKartuUjianPDF(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterIDStr := chi.URLParam(r, "ujianMasterID") // Ambil sebagai string

	if ujianMasterIDStr == "" {
		http.Error(w, "Invalid UjianMaster ID", http.StatusBadRequest)
		return
	}

	var req GenerateKartuUjianPDFRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload or empty selection", http.StatusBadRequest)
		return
	}

	if len(req.PesertaIDs) == 0 {
		http.Error(w, "Peserta IDs tidak boleh kosong", http.StatusBadRequest)
		return
	}

	// FIX: Melewati string ID langsung ke service layer
	pdfContent, err := h.service.GenerateKartuUjianPDF(r.Context(), schemaName, ujianMasterIDStr, req.PesertaIDs)
	if err != nil {
		// Handle error jika ada data yang belum lengkap (dari service)
		if strings.Contains(err.Error(), "belum lengkap") {
			http.Error(w, err.Error(), http.StatusPreconditionFailed) // 412 Precondition Failed
			return
		}
		http.Error(w, "Gagal menghasilkan PDF: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Set header untuk download file PDF
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=kartu_ujian_%s.pdf", ujianMasterIDStr))
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfContent)))

	w.WriteHeader(http.StatusOK)
	w.Write(pdfContent)
}

// =================================================================================
// ROOM MASTER CRUD HANDLERS
// =================================================================================

// GetAllRuangan handles GET /ujian-master/ruangan
func (h *Handler) GetAllRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)

	results, err := h.service.GetAllRuangan(r.Context(), schemaName)
	if err != nil {
		http.Error(w, "Gagal mengambil data ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// CreateRuangan handles POST /ujian-master/ruangan
func (h *Handler) CreateRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	var input UpsertRuanganInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(input); err != nil {
		http.Error(w, "Validasi input gagal: "+err.Error(), http.StatusBadRequest)
		return
	}

	ruangan, err := h.service.CreateRuangan(r.Context(), schemaName, input)
	if err != nil {
		http.Error(w, "Gagal membuat ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ruangan)
}

// UpdateRuangan handles PUT /ujian-master/ruangan/{ruanganID}
func (h *Handler) UpdateRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ruanganID := chi.URLParam(r, "ruanganID")
	var input UpsertRuanganInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(input); err != nil {
		http.Error(w, "Validasi input gagal: "+err.Error(), http.StatusBadRequest)
		return
	}

	ruangan, err := h.service.UpdateRuangan(r.Context(), schemaName, ruanganID, input)
	if err != nil {
		http.Error(w, "Gagal memperbarui ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ruangan)
}

// DeleteRuangan handles DELETE /ujian-master/ruangan/{ruanganID}
func (h *Handler) DeleteRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ruanganID := chi.URLParam(r, "ruanganID")

	err := h.service.DeleteRuangan(r.Context(), schemaName, ruanganID)
	if err != nil {
		http.Error(w, "Gagal menghapus ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// =================================================================================
// ROOM ALLOCATION & SEATING HANDLERS
// =================================================================================

// AssignRuangan handles POST /ujian-master/{id}/alokasi-ruangan
func (h *Handler) AssignRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")
	var input AssignRuanganInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(input); err != nil {
		http.Error(w, "Validasi input gagal: "+err.Error(), http.StatusBadRequest)
		return
	}

	alokasi, err := h.service.AssignRuangan(r.Context(), schemaName, ujianMasterID, input.RuanganIDs)
	if err != nil {
		http.Error(w, "Gagal mengalokasikan ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(alokasi)
}

// GetAlokasiRuangan handles GET /ujian-master/{id}/alokasi-ruangan
func (h *Handler) GetAlokasiRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	results, err := h.service.GetAlokasiRuanganByMasterID(r.Context(), schemaName, ujianMasterID)
	if err != nil {
		http.Error(w, "Gagal mengambil alokasi ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// RemoveAlokasiRuangan handles DELETE /ujian-master/{id}/alokasi-ruangan/{alokasiRuanganID}
func (h *Handler) RemoveAlokasiRuangan(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	alokasiRuanganID := chi.URLParam(r, "alokasiRuanganID")

	err := h.service.RemoveAlokasiRuangan(r.Context(), schemaName, alokasiRuanganID)
	if err != nil {
		http.Error(w, "Gagal menghapus alokasi ruangan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetAlokasiKursi handles GET /ujian-master/{id}/alokasi-kursi (Data untuk visualisasi seating)
func (h *Handler) GetAlokasiKursi(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	peserta, ruangan, err := h.service.GetAlokasiKursi(r.Context(), schemaName, ujianMasterID)
	if err != nil {
		http.Error(w, "Gagal mengambil data alokasi kursi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"peserta": peserta,
		"ruangan": ruangan,
	})
}

// UpdateSeating handles POST /ujian-master/{id}/alokasi-kursi/manual (Drag/Drop manual)
func (h *Handler) UpdateSeating(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	// **PERUBAHAN INI:** Baca ujianMasterID dari URL parameter
	ujianMasterID := chi.URLParam(r, "id")

	var input UpdatePesertaSeatingInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(input); err != nil {
		http.Error(w, "Validasi input gagal: "+err.Error(), http.StatusBadRequest)
		return
	}

	// **PERUBAHAN INI:** Teruskan ujianMasterID ke service call
	err := h.service.UpdatePesertaSeating(r.Context(), schemaName, ujianMasterID, input)
	if err != nil {
		http.Error(w, "Gagal memperbarui penempatan kursi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Penempatan kursi berhasil diperbarui"})
}

// DistributeSmart handles POST /ujian-master/{id}/alokasi-kursi/smart (Algoritma otomatis)
func (h *Handler) DistributeSmart(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	err := h.service.DistributePesertaSmart(r.Context(), schemaName, ujianMasterID)
	if err != nil {
		// Menangkap error bisnis (misal: kapasitas kurang)
		if strings.Contains(err.Error(), "kapasitas") || strings.Contains(err.Error(), "ruangan") {
			http.Error(w, "Gagal distribusi: "+err.Error(), http.StatusUnprocessableEntity)
			return
		}
		http.Error(w, "Gagal melakukan distribusi cerdas: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Distribusi peserta ke ruangan/kursi berhasil dilakukan"})
}

// =================================================================================
// OTHER HANDLERS
// =================================================================================

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

// --- GENERATE NOMOR UJIAN HANDLER ---
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

	// Call service
	count, err := h.service.GenerateNomorUjianForUjianMaster(r.Context(), schemaName, ujianMasterID, input.Prefix)
	if err != nil {
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// --- EXCEL EXPORT/IMPORT HANDLERS ---

// ExportPesertaToExcel exports peserta data to Excel/CSV
func (h *Handler) ExportPesertaToExcel(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	// Get format from query parameter (default: xlsx)
	format := r.URL.Query().Get("format")
	if format != "csv" && format != "xlsx" {
		format = "xlsx"
	}

	// Call service to generate file
	fileData, filename, err := h.service.ExportPesertaToExcel(r.Context(), schemaName, ujianMasterID, format)
	if err != nil {
		http.Error(w, "Gagal export data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Set appropriate headers
	if format == "csv" {
		w.Header().Set("Content-Type", "text/csv")
	} else {
		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(fileData)))

	// Send file
	w.WriteHeader(http.StatusOK)
	w.Write(fileData)
}

// ImportPesertaFromExcel imports peserta nomor ujian from Excel file
func (h *Handler) ImportPesertaFromExcel(w http.ResponseWriter, r *http.Request) {
	schemaName := r.Context().Value(middleware.SchemaNameKey).(string)
	ujianMasterID := chi.URLParam(r, "id")

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10MB max
	if err != nil {
		http.Error(w, "Gagal parsing form data", http.StatusBadRequest)
		return
	}

	// Get uploaded file
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "File tidak ditemukan di form data", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read file data
	fileData := make([]byte, fileHeader.Size)
	_, err = file.Read(fileData)
	if err != nil {
		http.Error(w, "Gagal membaca file", http.StatusInternalServerError)
		return
	}

	// Call service to process import
	result, err := h.service.ImportPesertaFromExcel(r.Context(), schemaName, ujianMasterID, fileData)
	if err != nil {
		http.Error(w, "Gagal import data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

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
