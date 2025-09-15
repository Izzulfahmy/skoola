// file: internal/auth/middleware.go
package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Definisikan tipe baru untuk kunci konteks, sama seperti di main.go
type contextKey string

const UserIDKey = contextKey("userID")
const UserRoleKey = contextKey("userRole")
const SchemaNameKey = contextKey("schemaName")

// AuthMiddleware adalah middleware untuk memverifikasi token JWT.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Ambil header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header otorisasi tidak ditemukan", http.StatusUnauthorized)
			return
		}

		// 2. Header harus berformat "Bearer <token>"
		// Kita pisahkan untuk mendapatkan tokennya saja.
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || strings.ToLower(headerParts[0]) != "bearer" {
			http.Error(w, "Format header otorisasi salah", http.StatusUnauthorized)
			return
		}
		tokenString := headerParts[1]

		// 3. Parse dan verifikasi token
		// Kita menggunakan jwt.Parse untuk memvalidasi tanda tangan token.
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Pastikan metode signing-nya adalah HMAC (sesuai dengan yang kita gunakan saat membuat token)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler // Metode signing tidak valid
			}
			return JWTSecretKey, nil
		})

		// 4. Tangani error saat parsing
		if err != nil {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		// 5. Cek apakah token valid dan ambil claims-nya
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// 6. (Sangat Berguna) Simpan informasi dari token ke dalam context.
			// Handler selanjutnya bisa mengakses informasi user tanpa perlu query database lagi.
			ctx := r.Context()
			ctx = context.WithValue(ctx, UserIDKey, claims["sub"])
			ctx = context.WithValue(ctx, UserRoleKey, claims["role"])
			ctx = context.WithValue(ctx, SchemaNameKey, claims["sch"])

			// Lanjutkan ke handler berikutnya dengan context yang sudah diperbarui
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
		}
	})
}
