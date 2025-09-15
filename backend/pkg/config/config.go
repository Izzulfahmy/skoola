package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config menampung semua konfigurasi aplikasi.
type Config struct {
	DatabaseURL string
	AppPort     string
}

// LoadConfig memuat konfigurasi dari file .env.
func LoadConfig() (*Config, error) {
	// Memuat file .env dari root proyek
	if err := godotenv.Load(); err != nil {
		log.Println("File .env tidak ditemukan, menggunakan environment variables sistem")
	}

	cfg := &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		AppPort:     os.Getenv("APP_PORT"),
	}

	if cfg.AppPort == "" {
		cfg.AppPort = "8080" // Default port jika tidak diset
	}

	return cfg, nil
}
