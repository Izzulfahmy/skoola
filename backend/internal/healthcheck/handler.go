package healthcheck

import (
	"encoding/json"
	"net/http"
)

// StatusHandler adalah handler untuk endpoint health check.
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Siapkan data yang akan dikirim sebagai response.
	data := map[string]string{
		"status":      "available",
		"environment": "development",
		"version":     "1.0.0",
	}

	// 2. Ubah data (map) menjadi format JSON.
	js, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 3. Atur header response untuk memberitahu client bahwa kita mengirim JSON.
	w.Header().Set("Content-Type", "application/json")

	// 4. Tulis response JSON ke client.
	w.Write(js)
}
