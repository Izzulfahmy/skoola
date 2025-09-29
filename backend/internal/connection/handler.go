// file: backend/internal/connection/handler.go
package connection

import (
	"encoding/json"
	"net/http"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

// Livez adalah endpoint sederhana untuk health check.
func (h *Handler) Livez(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Test adalah endpoint untuk melakukan tes koneksi (latensi dan bandwidth).
func (h *Handler) Test(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Please use GET method", http.StatusMethodNotAllowed)
		return
	}

	// Set header untuk mencegah caching
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Connection", "keep-alive")

	// Kirim header segera untuk mengukur latensi di sisi klien
	w.WriteHeader(http.StatusOK)
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	// Kirim payload besar untuk mengukur bandwidth
	// 1MB payload
	largePayload := make([]byte, 1024*1024)
	for i := range largePayload {
		largePayload[i] = 'a' // Isi dengan data dummy
	}

	_, err := w.Write(largePayload)
	if err != nil {
		// Jika terjadi error saat menulis payload, tidak banyak yang bisa dilakukan
		// karena header sudah terkirim. Cukup log error di server jika perlu.
		return
	}
}
