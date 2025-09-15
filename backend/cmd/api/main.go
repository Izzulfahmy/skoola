package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"skoola/internal/teacher" // Sesuaikan dengan path modul Anda

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/lib/pq" // Driver PostgreSQL
)

func main() {
	// 1. Koneksi ke Database
	// Ganti dengan connection string PostgreSQL Anda yang sebenarnya.
	connStr := "user=postgres password=@Vinceru2 dbname=skoola_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Gagal terhubung ke database:", err)
	}
	defer db.Close()

	// Cek koneksi
	if err := db.Ping(); err != nil {
		log.Fatal("Database tidak dapat dijangkau:", err)
	}
	fmt.Println("Berhasil terhubung ke database!")

	// 2. Inisialisasi semua lapisan (Wiring Dependencies)
	teacherRepo := teacher.NewRepository(db)
	teacherService := teacher.NewService(teacherRepo)
	teacherHandler := teacher.NewHandler(teacherService)

	// 3. Setup Router menggunakan Chi
	r := chi.NewRouter()

	// Gunakan beberapa middleware standar yang berguna
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// 4. Definisikan routing untuk API
	r.Route("/teachers", func(r chi.Router) {
		// Terapkan middleware untuk identifikasi tenant pada grup route ini
		r.Use(TenantContextMiddleware)

		r.Post("/", teacherHandler.Create)
		r.Get("/", teacherHandler.GetAll)
		r.Get("/{teacherID}", teacherHandler.GetByID)
		r.Put("/{teacherID}", teacherHandler.Update)

		// Hubungkan endpoint DELETE ke handler Delete.
		r.Delete("/{teacherID}", teacherHandler.Delete) // <-- TAMBAHKAN INI
	})

	// 5. Jalankan Server
	port := "8080"
	log.Printf("Server berjalan di port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

// TenantContextMiddleware adalah middleware untuk mengekstrak ID tenant
// dari header dan menyisipkannya ke dalam request context.
func TenantContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Di aplikasi nyata, ini bisa dari JWT, subdomain, dll.
		// Untuk contoh ini, kita ambil dari header `X-Tenant-ID`.
		tenantID := r.Header.Get("X-Tenant-ID")
		if tenantID == "" {
			http.Error(w, "Header X-Tenant-ID wajib diisi", http.StatusBadRequest)
			return
		}

		// Sisipkan tenantID ke dalam context
		ctx := context.WithValue(r.Context(), "schemaName", tenantID)

		// Lanjutkan ke handler berikutnya dengan context yang sudah diperbarui
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
