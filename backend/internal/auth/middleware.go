// file: backend/internal/auth/middleware.go
package auth

import (
	"context"
	"net/http"
	"strings"

	"skoola/internal/middleware" // <-- 1. IMPORT PAKET BARU

	"github.com/golang-jwt/jwt/v5"
)

// 2. Definisi kunci konteks (contextKey, UserIDKey, dll.) telah dihapus dari sini.

// Middleware struct untuk menampung dependensi seperti kunci rahasia.
type Middleware struct {
	jwtSecret []byte
}

// NewMiddleware membuat instance baru dari auth middleware.
func NewMiddleware(jwtSecret string) *Middleware {
	return &Middleware{
		jwtSecret: []byte(jwtSecret),
	}
}

// AuthMiddleware sekarang adalah method dari struct Middleware.
func (m *Middleware) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Ambil header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header otorisasi tidak ditemukan", http.StatusUnauthorized)
			return
		}

		// 2. Header harus berformat "Bearer <token>"
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || strings.ToLower(headerParts[0]) != "bearer" {
			http.Error(w, "Format header otorisasi salah", http.StatusUnauthorized)
			return
		}
		tokenString := headerParts[1]

		// 3. Parse dan verifikasi token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return m.jwtSecret, nil
		})

		// 4. Tangani error saat parsing
		if err != nil {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		// 5. Cek apakah token valid dan ambil claims-nya
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			ctx := r.Context()
			// 3. GUNAKAN KUNCI DARI PAKET middleware
			ctx = context.WithValue(ctx, middleware.UserIDKey, claims["sub"])
			ctx = context.WithValue(ctx, middleware.UserRoleKey, claims["role"])
			ctx = context.WithValue(ctx, middleware.SchemaNameKey, claims["sch"])

			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
		}
	})
}

// Authorize adalah fungsi tingkat tinggi yang membuat middleware otorisasi.
func Authorize(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 4. GUNAKAN KUNCI DARI PAKET middleware
			userRole, ok := r.Context().Value(middleware.UserRoleKey).(string)
			if !ok {
				http.Error(w, "Peran pengguna tidak ditemukan di dalam token", http.StatusInternalServerError)
				return
			}

			isAllowed := false
			for _, role := range allowedRoles {
				if userRole == role {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				http.Error(w, "Anda tidak memiliki hak akses untuk sumber daya ini", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
