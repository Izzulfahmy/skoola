// file: backend/internal/middleware/context.go
package middleware

// contextKey adalah tipe yang tidak diekspor untuk mencegah tabrakan dengan
// kunci konteks dari paket lain.
type contextKey string

// Definisikan semua kunci konteks yang akan digunakan di seluruh aplikasi.
const (
	UserIDKey     = contextKey("userID")
	UserRoleKey   = contextKey("userRole")
	SchemaNameKey = contextKey("schemaName")
)
