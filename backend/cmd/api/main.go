package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"skoola/internal/auth"
	"skoola/internal/student"
	"skoola/internal/teacher"

	"github.com/joho/godotenv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-playground/validator/v10"
	_ "github.com/lib/pq"
)

func main() {
	// 1. Muat konfigurasi dari file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Gagal memuat file .env. Menggunakan environment variables sistem.")
	}

	// 2. Baca semua konfigurasi dari environment
	connStr := os.Getenv("DB_CONNECTION_STRING")
	if connStr == "" {
		log.Fatal("DB_CONNECTION_STRING tidak ditemukan di environment")
	}
	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET_KEY tidak ditemukan di environment")
	}

	// 3. Koneksi ke Database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Gagal terhubung ke database:", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatal("Database tidak dapat dijangkau:", err)
	}
	fmt.Println("Berhasil terhubung ke database!")

	validate := validator.New()

	// 4. Inisialisasi semua lapisan dengan dependensi yang benar
	teacherRepo := teacher.NewRepository(db)
	teacherService := teacher.NewService(teacherRepo, validate)
	teacherHandler := teacher.NewHandler(teacherService)

	// Perbarui inisialisasi auth
	authService := auth.NewService(teacherRepo, jwtSecret)
	authHandler := auth.NewHandler(authService)
	authMiddleware := auth.NewMiddleware(jwtSecret) // Buat instance middleware

	studentRepo := student.NewRepository(db)
	studentService := student.NewService(studentRepo, validate)
	studentHandler := student.NewHandler(studentService)

	// 5. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// === ROUTE PUBLIK ===
	r.Post("/login", authHandler.Login)

	// === ROUTE YANG DILINDUNGI ===
	r.Route("/teachers", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware) // Gunakan method dari instance
		r.With(auth.Authorize("admin", "teacher")).Get("/", teacherHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{teacherID}", teacherHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", teacherHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{teacherID}", teacherHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{teacherID}", teacherHandler.Delete)
	})

	r.Route("/students", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware) // Gunakan method dari instance
		r.With(auth.Authorize("admin", "teacher")).Get("/", studentHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{studentID}", studentHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", studentHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{studentID}", studentHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{studentID}", studentHandler.Delete)
	})

	// 6. Jalankan Server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080" // Default port jika tidak diset
	}
	log.Printf("Server berjalan di port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

// TenantContextMiddleware tidak lagi digunakan pada route yang dilindungi
// karena informasinya sudah diambil dari token JWT oleh AuthMiddleware.
// Namun, kita bisa tetap menyimpannya di sini jika suatu saat dibutuhkan
// untuk route publik yang memerlukan tenant.
func TenantContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tenantID := r.Header.Get("X-Tenant-ID")
		if tenantID == "" {
			http.Error(w, "Header X-Tenant-ID wajib diisi", http.StatusBadRequest)
			return
		}
		ctx := context.WithValue(r.Context(), "schemaName", tenantID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
