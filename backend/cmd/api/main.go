// file: backend/cmd/api/main.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"skoola/internal/auth"
	"skoola/internal/profile"
	"skoola/internal/student"
	"skoola/internal/teacher"
	"skoola/internal/tenant"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

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

	validate := validator.New()

	// Inisialisasi semua Repositori
	teacherRepo := teacher.NewRepository(db)
	studentRepo := student.NewRepository(db)
	tenantRepo := tenant.NewRepository(db)
	profileRepo := profile.NewRepository(db)

	// --- PERUBAHAN DI SINI ---
	// Berikan tenantRepo ke dalam authService
	authService := auth.NewService(teacherRepo, tenantRepo, jwtSecret)
	authHandler := auth.NewHandler(authService)
	authMiddleware := auth.NewMiddleware(jwtSecret)

	// Inisialisasi Service dan Handler lainnya
	teacherService := teacher.NewService(teacherRepo, validate, db)
	teacherHandler := teacher.NewHandler(teacherService)
	studentService := student.NewService(studentRepo, validate)
	studentHandler := student.NewHandler(studentService)
	tenantService := tenant.NewService(tenantRepo, teacherRepo, validate, db)
	tenantHandler := tenant.NewHandler(tenantService)
	profileService := profile.NewService(profileRepo, validate)
	profileHandler := profile.NewHandler(profileService)

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

	// Rute Publik
	r.Post("/login", authHandler.Login)

	// Rute Superadmin
	r.Route("/tenants", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.AuthorizeSuperadmin).Get("/", tenantHandler.GetAll)
		r.With(auth.AuthorizeSuperadmin).Post("/register", tenantHandler.Register)
		r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-email", tenantHandler.UpdateAdminEmail)
		r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-password", tenantHandler.ResetAdminPassword)
		r.With(auth.AuthorizeSuperadmin).Delete("/{schemaName}", tenantHandler.DeleteTenant)
		r.With(auth.AuthorizeSuperadmin).Post("/run-migrations", tenantHandler.RunMigrations)
	})

	// Rute Admin/Guru Sekolah
	r.Route("/teachers", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin", "teacher")).Get("/", teacherHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{teacherID}", teacherHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", teacherHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{teacherID}", teacherHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{teacherID}", teacherHandler.Delete)
	})

	r.Route("/students", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin", "teacher")).Get("/", studentHandler.GetAll)
		r.With(auth.Authorize("admin", "teacher")).Get("/{studentID}", studentHandler.GetByID)
		r.With(auth.Authorize("admin")).Post("/", studentHandler.Create)
		r.With(auth.Authorize("admin")).Put("/{studentID}", studentHandler.Update)
		r.With(auth.Authorize("admin")).Delete("/{studentID}", studentHandler.Delete)
	})

	// Rute Profil Sekolah
	r.Route("/profile", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)
		r.With(auth.Authorize("admin")).Get("/", profileHandler.GetProfile)
		r.With(auth.Authorize("admin")).Put("/", profileHandler.UpdateProfile)
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
