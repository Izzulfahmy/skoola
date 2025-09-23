// file: backend/cmd/api/main.go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"skoola/internal/auth"
	"skoola/internal/foundation"
	"skoola/internal/jabatan"
	"skoola/internal/jenjang"
	"skoola/internal/matapelajaran" // <-- 1. IMPOR PAKET BARU
	"skoola/internal/profile"
	"skoola/internal/student"
	"skoola/internal/tahunajaran"
	"skoola/internal/teacher"
	"skoola/internal/tenant"
	"skoola/internal/tingkatan"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func runPublicMigrations(db *sql.DB) error {
	log.Println("Memeriksa dan menjalankan migrasi untuk skema public...")

	publicMigrations := []string{
		"./db/migrations/005_add_foundations.sql",
	}

	for _, path := range publicMigrations {
		absPath, err := filepath.Abs(path)
		if err != nil {
			return fmt.Errorf("gagal mendapatkan path absolut untuk %s: %w", path, err)
		}
		migrationSQL, err := os.ReadFile(absPath)
		if err != nil {
			return fmt.Errorf("gagal membaca file migrasi %s: %w", path, err)
		}
		if _, err := db.ExecContext(context.Background(), string(migrationSQL)); err != nil {
			log.Printf("Info: Gagal menjalankan migrasi %s, mungkin sudah ada: %v\n", path, err)
		}
	}
	log.Println("Pemeriksaan migrasi public selesai.")
	return nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Gagal memuat file .env.")
	}

	connStr := os.Getenv("DB_CONNECTION_STRING")
	if connStr == "" {
		log.Fatal("DB_CONNECTION_STRING tidak ditemukan")
	}
	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET_KEY tidak ditemukan")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Gagal terhubung ke database:", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatal("Database tidak dapat dijangkau:", err)
	}
	fmt.Println("Berhasil terhubung ke database!")

	if err := runPublicMigrations(db); err != nil {
		log.Fatalf("Gagal menjalankan migrasi public: %v", err)
	}

	validate := validator.New()

	// --- Inisialisasi Repository ---
	naunganRepo := foundation.NewRepository(db)
	teacherRepo := teacher.NewRepository(db)
	studentRepo := student.NewRepository(db)
	tenantRepo := tenant.NewRepository(db)
	profileRepo := profile.NewRepository(db)
	studentHistoryRepo := student.NewHistoryRepository(db)
	jenjangRepo := jenjang.NewRepository(db)
	jabatanRepo := jabatan.NewRepository(db)
	tingkatanRepo := tingkatan.NewRepository(db)
	tahunAjaranRepo := tahunajaran.NewRepository(db)
	mataPelajaranRepo := matapelajaran.NewRepository(db) // <-- 2. INISIALISASI REPO BARU

	// --- Inisialisasi Service ---
	authService := auth.NewService(teacherRepo, tenantRepo, jwtSecret)
	naunganService := foundation.NewService(naunganRepo, validate)
	teacherService := teacher.NewService(teacherRepo, validate, db)
	studentService := student.NewService(studentRepo, studentHistoryRepo, validate, db)
	studentHistoryService := student.NewHistoryService(studentHistoryRepo, validate)
	tenantService := tenant.NewService(tenantRepo, teacherRepo, validate, db)
	profileService := profile.NewService(profileRepo, validate)
	jenjangService := jenjang.NewService(jenjangRepo, validate)
	jabatanService := jabatan.NewService(jabatanRepo, validate)
	tingkatanService := tingkatan.NewService(tingkatanRepo, validate)
	tahunAjaranService := tahunajaran.NewService(tahunAjaranRepo, validate, db)
	mataPelajaranService := matapelajaran.NewService(mataPelajaranRepo, validate) // <-- 3. INISIALISASI SERVICE BARU

	// --- Inisialisasi Handler & Middleware ---
	authHandler := auth.NewHandler(authService)
	authMiddleware := auth.NewMiddleware(jwtSecret)
	naunganHandler := foundation.NewHandler(naunganService)
	teacherHandler := teacher.NewHandler(teacherService)
	studentHandler := student.NewHandler(studentService)
	studentHistoryHandler := student.NewHistoryHandler(studentHistoryService)
	tenantHandler := tenant.NewHandler(tenantService)
	profileHandler := profile.NewHandler(profileService)
	jenjangHandler := jenjang.NewHandler(jenjangService)
	jabatanHandler := jabatan.NewHandler(jabatanService)
	tingkatanHandler := tingkatan.NewHandler(tingkatanService)
	tahunAjaranHandler := tahunajaran.NewHandler(tahunAjaranService)
	mataPelajaranHandler := matapelajaran.NewHandler(mataPelajaranService) // <-- 4. INISIALISASI HANDLER BARU

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Tenant-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Post("/login", authHandler.Login)

	// --- RUTE-RUTE LAINNYA TETAP SAMA ---
	r.Route("/naungan", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.AuthorizeSuperadmin).Get("/", naunganHandler.GetAll)
		r.With(auth.AuthorizeSuperadmin).Get("/{naunganID}", naunganHandler.GetByID)
		r.With(auth.AuthorizeSuperadmin).Post("/", naunganHandler.Create)
		r.With(auth.AuthorizeSuperadmin).Put("/{naunganID}", naunganHandler.Update)
		r.With(auth.AuthorizeSuperadmin).Delete("/{naunganID}", naunganHandler.Delete)
	})

	r.Route("/tenants", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.AuthorizeSuperadmin).Get("/", tenantHandler.GetAll)
		r.With(auth.AuthorizeSuperadmin).Get("/without-naungan", tenantHandler.GetTenantsWithoutNaungan)
		r.With(auth.AuthorizeSuperadmin).Post("/register", tenantHandler.Register)
		r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-email", tenantHandler.UpdateAdminEmail)
		r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-password", tenantHandler.ResetAdminPassword)
		r.With(auth.AuthorizeSuperadmin).Delete("/{schemaName}", tenantHandler.DeleteTenant)
		r.With(auth.AuthorizeSuperadmin).Post("/run-migrations", tenantHandler.RunMigrations)
	})

	r.Route("/teachers", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/admin/details", teacherHandler.GetAdminDetails)
		r.Route("/history", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Post("/{teacherID}", teacherHandler.CreateHistory)
			r.With(auth.Authorize("admin")).Get("/{teacherID}", teacherHandler.GetHistoryByTeacherID)
			r.With(auth.Authorize("admin")).Put("/{historyID}", teacherHandler.UpdateHistory)
			r.With(auth.Authorize("admin")).Delete("/{historyID}", teacherHandler.DeleteHistory)
		})
		r.With(auth.Authorize("admin", "teacher")).Get("/", teacherHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{teacherID}", teacherHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", teacherHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{teacherID}", teacherHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{teacherID}", teacherHandler.Delete)
	})

	r.Route("/students", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.Route("/history", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/{studentID}", studentHistoryHandler.GetByStudentID)
			r.With(auth.Authorize("admin")).Post("/{studentID}", studentHistoryHandler.Create)
			r.With(auth.Authorize("admin")).Put("/{historyID}", studentHistoryHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{historyID}", studentHistoryHandler.Delete)
		})
		r.With(auth.Authorize("admin", "teacher")).Get("/", studentHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{studentID}", studentHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", studentHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{studentID}", studentHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{studentID}", studentHandler.Delete)
	})

	r.Route("/profile", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", profileHandler.GetProfile)
		r.With(auth.Authorize("admin")).Put("/", profileHandler.UpdateProfile)
	})

	r.Route("/jenjang", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", jenjangHandler.GetAll)
		r.With(auth.Authorize("admin")).Post("/", jenjangHandler.Create)
		r.With(auth.Authorize("admin")).Get("/{id}", jenjangHandler.GetByID)
		r.With(auth.Authorize("admin")).Put("/{id}", jenjangHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{id}", jenjangHandler.Delete)
	})

	r.Route("/jabatan", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", jabatanHandler.GetAll)
		r.With(auth.Authorize("admin")).Post("/", jabatanHandler.Create)
		r.With(auth.Authorize("admin")).Get("/{id}", jabatanHandler.GetByID)
		r.With(auth.Authorize("admin")).Put("/{id}", jabatanHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{id}", jabatanHandler.Delete)
	})

	r.Route("/tingkatan", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", tingkatanHandler.GetAll)
		r.With(auth.Authorize("admin")).Post("/", tingkatanHandler.Create)
		r.With(auth.Authorize("admin")).Get("/{id}", tingkatanHandler.GetByID)
		r.With(auth.Authorize("admin")).Put("/{id}", tingkatanHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{id}", tingkatanHandler.Delete)
	})

	r.Route("/tahun-ajaran", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", tahunAjaranHandler.GetAll)
		r.With(auth.Authorize("admin")).Post("/", tahunAjaranHandler.Create)
		r.With(auth.Authorize("admin")).Get("/{id}", tahunAjaranHandler.GetByID)
		r.With(auth.Authorize("admin")).Put("/{id}", tahunAjaranHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{id}", tahunAjaranHandler.Delete)
	})

	// --- 5. DAFTARKAN RUTE BARU UNTUK MATA PELAJARAN ---
	r.Route("/mata-pelajaran", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", mataPelajaranHandler.GetAll)
		r.With(auth.Authorize("admin")).Post("/", mataPelajaranHandler.Create)
		r.With(auth.Authorize("admin")).Get("/{id}", mataPelajaranHandler.GetByID)
		r.With(auth.Authorize("admin")).Put("/{id}", mataPelajaranHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{id}", mataPelajaranHandler.Delete)
	})

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server berjalan di port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
