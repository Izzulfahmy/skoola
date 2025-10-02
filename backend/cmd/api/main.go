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
	"skoola/internal/connection"
	"skoola/internal/ekstrakurikuler"
	"skoola/internal/foundation"
	"skoola/internal/jabatan"
	"skoola/internal/jenisujian"
	"skoola/internal/jenjang"
	"skoola/internal/kelompokmapel"
	"skoola/internal/kurikulum"
	"skoola/internal/matapelajaran"
	"skoola/internal/pembelajaran"
	"skoola/internal/penilaian"
	"skoola/internal/penilaiansumatif"
	"skoola/internal/presensi"
	"skoola/internal/prestasi" // <-- Impor paket baru
	"skoola/internal/profile"
	"skoola/internal/rombel"
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

	// Repositories
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
	mataPelajaranRepo := matapelajaran.NewRepository(db)
	kurikulumRepo := kurikulum.NewRepository(db)
	rombelRepo := rombel.NewRepository(db)
	pembelajaranRepo := pembelajaran.NewRepository(db)
	penilaianRepo := penilaian.NewRepository(db)
	kelompokMapelRepo := kelompokmapel.NewRepository(db)
	jenisUjianRepo := jenisujian.NewRepository(db)
	penilaianSumatifRepo := penilaiansumatif.NewRepository(db)
	presensiRepo := presensi.NewRepository(db)
	ekstrakurikulerRepo := ekstrakurikuler.NewRepository(db)
	prestasiRepo := prestasi.NewRepository(db) // <-- Tambahkan repo baru

	// Services
	authService := auth.NewService(teacherRepo, tenantRepo, jwtSecret)
	naunganService := foundation.NewService(naunganRepo, validate)
	teacherService := teacher.NewService(teacherRepo, tahunAjaranRepo, validate, db)
	studentService := student.NewService(studentRepo, studentHistoryRepo, validate, db)
	studentHistoryService := student.NewHistoryService(studentHistoryRepo, validate)
	tenantService := tenant.NewService(tenantRepo, teacherRepo, validate, db)
	profileService := profile.NewService(profileRepo, validate)
	jenjangService := jenjang.NewService(jenjangRepo, validate)
	jabatanService := jabatan.NewService(jabatanRepo, validate)
	tingkatanService := tingkatan.NewService(tingkatanRepo, validate)
	tahunAjaranService := tahunajaran.NewService(tahunAjaranRepo, validate, db)
	mataPelajaranService := matapelajaran.NewService(mataPelajaranRepo, validate)
	kelompokMapelService := kelompokmapel.NewService(kelompokMapelRepo, mataPelajaranRepo, validate)
	kurikulumService := kurikulum.NewService(kurikulumRepo, validate)
	rombelService := rombel.NewService(rombelRepo, validate)
	pembelajaranService := pembelajaran.NewService(pembelajaranRepo, validate)
	penilaianService := penilaian.NewService(penilaianRepo, validate)
	jenisUjianService := jenisujian.NewService(jenisUjianRepo, validate)
	penilaianSumatifService := penilaiansumatif.NewService(penilaianSumatifRepo, validate)
	presensiService := presensi.NewService(presensiRepo, validate)
	ekstrakurikulerService := ekstrakurikuler.NewService(ekstrakurikulerRepo, validate)
	prestasiService := prestasi.NewService(prestasiRepo, validate) // <-- Tambahkan service baru

	// Handlers
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
	mataPelajaranHandler := matapelajaran.NewHandler(mataPelajaranService)
	kelompokMapelHandler := kelompokmapel.NewHandler(kelompokMapelService)
	kurikulumHandler := kurikulum.NewHandler(kurikulumService)
	rombelHandler := rombel.NewHandler(rombelService)
	pembelajaranHandler := pembelajaran.NewHandler(pembelajaranService)
	penilaianHandler := penilaian.NewHandler(penilaianService)
	jenisUjianHandler := jenisujian.NewHandler(jenisUjianService)
	penilaianSumatifHandler := penilaiansumatif.NewHandler(penilaianSumatifService)
	presensiHandler := presensi.NewHandler(presensiService)
	connectionHandler := connection.NewHandler()
	ekstrakurikulerHandler := ekstrakurikuler.NewHandler(ekstrakurikulerService)
	prestasiHandler := prestasi.NewHandler(prestasiService) // <-- Tambahkan handler baru

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Tenant-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Post("/login", authHandler.Login)
	r.With(authMiddleware.AuthMiddleware, auth.AuthorizeSuperadmin).Post("/tenants/register", tenantHandler.Register)

	r.Get("/livez", connectionHandler.Livez)
	r.Get("/connection-test", connectionHandler.Test)

	r.Route("/", func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)

		r.Route("/naungan", func(r chi.Router) {
			r.With(auth.AuthorizeSuperadmin).Get("/", naunganHandler.GetAll)
			r.With(auth.AuthorizeSuperadmin).Get("/{naunganID}", naunganHandler.GetByID)
			r.With(auth.AuthorizeSuperadmin).Post("/", naunganHandler.Create)
			r.With(auth.AuthorizeSuperadmin).Put("/{naunganID}", naunganHandler.Update)
			r.With(auth.AuthorizeSuperadmin).Delete("/{naunganID}", naunganHandler.Delete)
		})

		r.Route("/tenants", func(r chi.Router) {
			r.With(auth.AuthorizeSuperadmin).Get("/", tenantHandler.GetAll)
			r.With(auth.AuthorizeSuperadmin).Get("/without-naungan", tenantHandler.GetTenantsWithoutNaungan)
			r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-email", tenantHandler.UpdateAdminEmail)
			r.With(auth.AuthorizeSuperadmin).Put("/{schemaName}/admin-password", tenantHandler.ResetAdminPassword)
			r.With(auth.AuthorizeSuperadmin).Delete("/{schemaName}", tenantHandler.DeleteTenant)
			r.With(auth.AuthorizeSuperadmin).Post("/run-migrations", tenantHandler.RunMigrations)
		})

		r.Route("/teachers", func(r chi.Router) {
			r.With(auth.Authorize("teacher")).Get("/me/details", teacherHandler.GetMyDetails)
			r.With(auth.Authorize("teacher")).Get("/me/classes", teacherHandler.GetMyKelas)
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
			r.With(auth.Authorize("admin")).Get("/available", studentHandler.GetAvailableStudents)
			r.With(auth.Authorize("admin")).Get("/import/template", studentHandler.GenerateTemplate)
			r.With(auth.Authorize("admin")).Post("/import", studentHandler.ImportStudents)

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
			r.With(auth.Authorize("admin")).Get("/", profileHandler.GetProfile)
			r.With(auth.Authorize("admin")).Put("/", profileHandler.UpdateProfile)
		})

		r.Route("/jenjang", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", jenjangHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", jenjangHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", jenjangHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", jenjangHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", jenjangHandler.Delete)
		})

		// --- PERUBAHAN DAN PENAMBAHAN ADA DI BAWAH INI ---
		r.Route("/ekstrakurikuler", func(r chi.Router) {
			// Rute untuk Master Data (di menu Pengaturan)
			r.With(auth.Authorize("admin")).Get("/", ekstrakurikulerHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", ekstrakurikulerHandler.Create)
			r.With(auth.Authorize("admin")).Put("/{id}", ekstrakurikulerHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", ekstrakurikulerHandler.Delete)

			// Rute untuk Sesi (di menu baru Manajemen Ekstrakurikuler)
			r.With(auth.Authorize("admin")).Get("/sesi", ekstrakurikulerHandler.GetSesi) // GET /ekstrakurikuler/sesi?ekskulId=1&tahunAjaranId=2
			r.With(auth.Authorize("admin")).Put("/sesi/{sesiId}", ekstrakurikulerHandler.UpdateSesiDetail)

			// Rute untuk Anggota
			r.With(auth.Authorize("admin")).Get("/sesi/{sesiId}/anggota", ekstrakurikulerHandler.GetAnggota)
			r.With(auth.Authorize("admin")).Post("/sesi/{sesiId}/anggota", ekstrakurikulerHandler.AddAnggota)
			r.With(auth.Authorize("admin")).Delete("/anggota/{anggotaId}", ekstrakurikulerHandler.RemoveAnggota)
		})
		// --------------------------------------------------

		r.Route("/jabatan", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", jabatanHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", jabatanHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", jabatanHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", jabatanHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", jabatanHandler.Delete)
		})

		r.Route("/tingkatan", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", tingkatanHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", tingkatanHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", tingkatanHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", tingkatanHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", tingkatanHandler.Delete)
		})

		r.Route("/tahun-ajaran", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", tahunAjaranHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", tahunAjaranHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", tahunAjaranHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", tahunAjaranHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", tahunAjaranHandler.Delete)
		})

		r.Route("/mata-pelajaran", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Put("/reorder", mataPelajaranHandler.UpdateUrutan)
			r.With(auth.Authorize("admin")).Get("/", kelompokMapelHandler.GetAll)
			r.With(auth.Authorize("admin")).Get("/taught", mataPelajaranHandler.GetAllTaught)
			r.With(auth.Authorize("admin")).Post("/", mataPelajaranHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", mataPelajaranHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", mataPelajaranHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", mataPelajaranHandler.Delete)
		})

		r.Route("/kelompok-mapel", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", kelompokMapelHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", kelompokMapelHandler.Create)
			r.With(auth.Authorize("admin")).Put("/{id}", kelompokMapelHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", kelompokMapelHandler.Delete)
		})

		r.Route("/kurikulum", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", kurikulumHandler.GetAll)
			r.With(auth.Authorize("admin")).Get("/by-tahun-ajaran", kurikulumHandler.GetByTahunAjaran)
			r.With(auth.Authorize("admin")).Post("/", kurikulumHandler.Create)
			r.With(auth.Authorize("admin")).Put("/{id}", kurikulumHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", kurikulumHandler.Delete)
			r.With(auth.Authorize("admin")).Post("/add-to-tahun-ajaran", kurikulumHandler.AddKurikulumToTahunAjaran)
			r.With(auth.Authorize("admin")).Get("/fase", kurikulumHandler.GetAllFase)
			r.With(auth.Authorize("admin")).Post("/fase", kurikulumHandler.CreateFase)
			r.With(auth.Authorize("admin")).Get("/tingkatan", kurikulumHandler.GetAllTingkatan)
			r.With(auth.Authorize("admin")).Get("/pemetaan", kurikulumHandler.GetFaseTingkatan)
			r.With(auth.Authorize("admin")).Post("/pemetaan", kurikulumHandler.CreatePemetaan)
			r.With(auth.Authorize("admin")).Delete("/pemetaan/ta/{tahunAjaranID}/k/{kurikulumID}/t/{tingkatanID}", kurikulumHandler.DeletePemetaan)
		})

		r.Route("/rombel", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", rombelHandler.GetAllKelasByTahunAjaran)
			r.With(auth.Authorize("admin")).Post("/", rombelHandler.CreateKelas)
			r.With(auth.Authorize("admin", "teacher")).Get("/{kelasID}", rombelHandler.GetKelasByID)
			r.With(auth.Authorize("admin")).Put("/{kelasID}", rombelHandler.UpdateKelas)
			r.With(auth.Authorize("admin")).Delete("/{kelasID}", rombelHandler.DeleteKelas)
			r.With(auth.Authorize("admin", "teacher")).Get("/{kelasID}/anggota", rombelHandler.GetAllAnggotaByKelas)
			r.With(auth.Authorize("admin")).Post("/{kelasID}/anggota", rombelHandler.AddAnggotaKelas)
			r.With(auth.Authorize("admin")).Delete("/anggota/{anggotaID}", rombelHandler.RemoveAnggotaKelas)
			r.With(auth.Authorize("admin")).Put("/anggota/reorder", rombelHandler.UpdateAnggotaKelasUrutan)
			r.With(auth.Authorize("admin", "teacher")).Get("/{kelasID}/pengajar", rombelHandler.GetAllPengajarByKelas)
			r.With(auth.Authorize("admin")).Post("/{kelasID}/pengajar", rombelHandler.CreatePengajarKelas)
			r.With(auth.Authorize("admin")).Delete("/pengajar/{pengajarID}", rombelHandler.RemovePengajarKelas)
		})

		r.Route("/pembelajaran", func(r chi.Router) {
			r.With(auth.Authorize("admin", "teacher")).Get("/rencana/by-pengajar/{pengajarKelasID}", pembelajaranHandler.GetAllRencanaPembelajaran)
			r.With(auth.Authorize("admin", "teacher")).Put("/rencana/reorder", pembelajaranHandler.UpdateRencanaUrutan)
			r.With(auth.Authorize("admin", "teacher")).Post("/materi", pembelajaranHandler.CreateMateri)
			r.With(auth.Authorize("admin", "teacher")).Put("/materi/{materiID}", pembelajaranHandler.UpdateMateri)
			r.With(auth.Authorize("admin", "teacher")).Delete("/materi/{materiID}", pembelajaranHandler.DeleteMateri)
			r.With(auth.Authorize("admin", "teacher")).Post("/ujian", pembelajaranHandler.CreateUjian)
			r.With(auth.Authorize("admin", "teacher")).Put("/ujian/{id}", pembelajaranHandler.UpdateUjian)
			r.With(auth.Authorize("admin", "teacher")).Delete("/ujian/{id}", pembelajaranHandler.DeleteUjian)
			r.With(auth.Authorize("admin", "teacher")).Post("/tujuan", pembelajaranHandler.CreateTujuan)
			r.With(auth.Authorize("admin", "teacher")).Put("/tujuan/{tujuanID}", pembelajaranHandler.UpdateTujuan)
			r.With(auth.Authorize("admin", "teacher")).Delete("/tujuan/{tujuanID}", pembelajaranHandler.DeleteTujuan)
			r.With(auth.Authorize("admin", "teacher")).Put("/tujuan/reorder", pembelajaranHandler.UpdateUrutanTujuan)
		})

		r.Route("/penilaian", func(r chi.Router) {
			r.With(auth.Authorize("admin", "teacher")).Get("/kelas/{kelasID}/pengajar/{pengajarKelasID}", penilaianHandler.GetPenilaianLengkap)
			r.With(auth.Authorize("admin", "teacher")).Post("/batch-upsert", penilaianHandler.UpsertNilaiBulk)
		})

		r.Route("/penilaian-sumatif", func(r chi.Router) {
			r.With(auth.Authorize("admin", "teacher")).Get("/", penilaianSumatifHandler.GetByTujuanPembelajaranID)
			r.With(auth.Authorize("admin", "teacher")).Post("/", penilaianSumatifHandler.Create)
			r.With(auth.Authorize("admin", "teacher")).Put("/{id}", penilaianSumatifHandler.Update)
			r.With(auth.Authorize("admin", "teacher")).Delete("/{id}", penilaianSumatifHandler.Delete)
		})

		r.Route("/jenis-ujian", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", jenisUjianHandler.GetAll)
			r.With(auth.Authorize("admin")).Post("/", jenisUjianHandler.Create)
			r.With(auth.Authorize("admin")).Get("/{id}", jenisUjianHandler.GetByID)
			r.With(auth.Authorize("admin")).Put("/{id}", jenisUjianHandler.Update)
			r.With(auth.Authorize("admin")).Delete("/{id}", jenisUjianHandler.Delete)
		})

		r.Route("/presensi", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/kelas/{kelasID}", presensiHandler.GetPresensi)
			r.With(auth.Authorize("admin")).Post("/", presensiHandler.UpsertPresensi)
			r.With(auth.Authorize("admin")).Delete("/", presensiHandler.DeletePresensi)
		})

		// <-- Rute baru untuk prestasi
		r.Route("/prestasi", func(r chi.Router) {
			r.With(auth.Authorize("admin")).Get("/", prestasiHandler.GetAllByTahunAjaran)
			r.With(auth.Authorize("admin")).Post("/", prestasiHandler.Create)
			r.With(auth.Authorize("admin")).Delete("/{id}", prestasiHandler.Delete)
		})
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
