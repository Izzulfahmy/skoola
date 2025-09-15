package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"skoola/internal/auth"
	"skoola/internal/student" // <-- TAMBAHKAN INI
	"skoola/internal/teacher"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-playground/validator/v10"
	_ "github.com/lib/pq"
)

func main() {
	// 1. Koneksi ke Database
	connStr := "user=postgres password=@Vinceru2 dbname=skoola_db sslmode=disable"
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

	// 2. Inisialisasi semua lapisan (Wiring Dependencies)

	// Inisialisasi lapisan teacher
	teacherRepo := teacher.NewRepository(db)
	teacherService := teacher.NewService(teacherRepo, validate)
	teacherHandler := teacher.NewHandler(teacherService)

	// Inisialisasi lapisan auth
	authService := auth.NewService(teacherRepo)
	authHandler := auth.NewHandler(authService)

	// Inisialisasi lapisan student <-- TAMBAHKAN BLOK INI
	studentRepo := student.NewRepository(db)
	studentService := student.NewService(studentRepo, validate)
	studentHandler := student.NewHandler(studentService)

	// 3. Setup Router menggunakan Chi
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
		r.Use(TenantContextMiddleware)
		r.Use(auth.AuthMiddleware)

		r.Post("/", teacherHandler.Create)
		r.Get("/", teacherHandler.GetAll)
		r.Get("/{teacherID}", teacherHandler.GetByID)
		r.Put("/{teacherID}", teacherHandler.Update)
		r.Delete("/{teacherID}", teacherHandler.Delete)
	})

	// Grup route baru untuk students <-- TAMBAHKAN BLOK INI
	r.Route("/students", func(r chi.Router) {
		// Terapkan middleware yang sama untuk melindungi endpoint siswa
		r.Use(TenantContextMiddleware)
		r.Use(auth.AuthMiddleware)

		r.Post("/", studentHandler.Create)
		r.Get("/", studentHandler.GetAll)
	})

	// 5. Jalankan Server
	port := "8080"
	log.Printf("Server berjalan di port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

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
