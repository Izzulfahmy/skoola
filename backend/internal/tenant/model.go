// file: backend/internal/tenant/model.go
package tenant

import "time"

// Tenant merepresentasikan data dari tabel 'public.tenants'.
type Tenant struct {
	ID          string    `json:"id"`
	NamaSekolah string    `json:"nama_sekolah"`
	SchemaName  string    `json:"schema_name"`
	NaunganID   *string   `json:"naungan_id"`   // Boleh NULL
	NamaNaungan *string   `json:"nama_naungan"` // Untuk ditampilkan di frontend
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// DTO untuk input pendaftaran tenant baru
type RegisterTenantInput struct {
	NamaSekolah string  `json:"nama_sekolah" validate:"required"`
	SchemaName  string  `json:"schema_name" validate:"required"`
	AdminEmail  string  `json:"admin_email" validate:"required,email"`
	AdminPass   string  `json:"admin_pass" validate:"required,min=8"`
	AdminName   string  `json:"admin_name" validate:"required"`
	NaunganID   *string `json:"naungan_id,omitempty"`
}

// DTO untuk input update email admin
type UpdateAdminEmailInput struct {
	Email string `json:"email" validate:"required,email"`
}

// DTO untuk input reset password admin
type ResetAdminPasswordInput struct {
	Password string `json:"password" validate:"required,min=8"`
}
