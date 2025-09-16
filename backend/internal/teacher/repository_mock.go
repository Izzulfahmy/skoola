// file: internal/teacher/repository_mock.go
package teacher

import "context"

// MockRepository adalah implementasi tiruan dari Repository.
type MockRepository struct {
	CreateFunc     func(ctx context.Context, schemaName string, user *User, teacher *Teacher) error
	GetAllFunc     func(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByIDFunc    func(ctx context.Context, schemaName string, id string) (*Teacher, error)
	GetByEmailFunc func(ctx context.Context, schemaName string, email string) (*User, error)
	UpdateFunc     func(ctx context.Context, schemaName string, teacher *Teacher) error
	DeleteFunc     func(ctx context.Context, schemaName string, teacherID string) error
}

// Implementasikan semua method dari interface Repository.
// Setiap method hanya akan memanggil fungsi yang kita simpan di struct.

func (m *MockRepository) Create(ctx context.Context, schemaName string, user *User, teacher *Teacher) error {
	return m.CreateFunc(ctx, schemaName, user, teacher)
}

func (m *MockRepository) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	return m.GetAllFunc(ctx, schemaName)
}

func (m *MockRepository) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	return m.GetByIDFunc(ctx, schemaName, id)
}

func (m *MockRepository) GetByEmail(ctx context.Context, schemaName string, email string) (*User, error) {
	return m.GetByEmailFunc(ctx, schemaName, email)
}

func (m *MockRepository) Update(ctx context.Context, schemaName string, teacher *Teacher) error {
	return m.UpdateFunc(ctx, schemaName, teacher)
}

func (m *MockRepository) Delete(ctx context.Context, schemaName string, teacherID string) error {
	return m.DeleteFunc(ctx, schemaName, teacherID)
}
