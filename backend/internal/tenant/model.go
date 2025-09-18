// file: backend/internal/tenant/model.go
package tenant

import "time"

type Tenant struct {
	ID          string    `json:"id"`
	NamaSekolah string    `json:"nama_sekolah"`
	SchemaName  string    `json:"schema_name"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RegisterTenantInput struct {
	NamaSekolah string `json:"nama_sekolah" validate:"required"`
	SchemaName  string `json:"schema_name" validate:"required"`
	AdminEmail  string `json:"admin_email" validate:"required,email"`
	AdminPass   string `json:"admin_pass" validate:"required,min=8"`
	AdminName   string `json:"admin_name" validate:"required"`
}
