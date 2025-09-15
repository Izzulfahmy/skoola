package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // Driver PostgreSQL
)

// ConnectDB membuka dan menguji koneksi ke database.
// DSN = Data Source Name (contoh: "postgres://user:password@localhost:5432/dbname?sslmode=disable")
func ConnectDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("gagal membuka koneksi database: %w", err)
	}

	// Mengatur konfigurasi pool koneksi
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	// Menguji koneksi
	err = db.Ping()
	if err != nil {
		db.Close() // Tutup koneksi jika ping gagal
		return nil, fmt.Errorf("gagal terhubung ke database: %w", err)
	}

	fmt.Println("Berhasil terhubung ke database!")
	return db, nil
}
