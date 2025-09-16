// file: internal/teacher/service_test.go
package teacher

import (
	"context"
	"errors"
	"testing"
)

// Definisikan error mock di sini agar bisa digunakan kembali di seluruh tes.
var ErrMockDB = errors.New("database connection error")

func TestService_GetByID(t *testing.T) {
	testCases := []struct {
		name            string
		teacherID       string
		setupMock       func(mock *MockRepository)
		expectedErr     error
		expectedTeacher *Teacher
	}{
		{
			name:      "Success - Teacher Found",
			teacherID: "valid-id",
			setupMock: func(mock *MockRepository) {
				mock.GetByIDFunc = func(ctx context.Context, schemaName string, id string) (*Teacher, error) {
					if id == "valid-id" {
						return &Teacher{ID: "valid-id", NamaLengkap: "Budi"}, nil
					}
					return nil, nil
				}
			},
			expectedErr:     nil,
			expectedTeacher: &Teacher{ID: "valid-id", NamaLengkap: "Budi"},
		},
		{
			name:      "Failure - Teacher Not Found",
			teacherID: "not-found-id",
			setupMock: func(mock *MockRepository) {
				mock.GetByIDFunc = func(ctx context.Context, schemaName string, id string) (*Teacher, error) {
					return nil, nil
				}
			},
			expectedErr:     nil,
			expectedTeacher: nil,
		},
		{
			name:      "Failure - Database Error",
			teacherID: "any-id",
			setupMock: func(mock *MockRepository) {
				mock.GetByIDFunc = func(ctx context.Context, schemaName string, id string) (*Teacher, error) {
					// Gunakan variabel error yang sudah kita definisikan di atas
					return nil, ErrMockDB
				}
			},
			// Harapkan error yang SAMA PERSIS (variabel yang sama)
			expectedErr:     ErrMockDB,
			expectedTeacher: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := &MockRepository{}
			tc.setupMock(mockRepo)
			service := NewService(mockRepo, nil)

			teacher, err := service.GetByID(context.Background(), "test-schema", tc.teacherID)

			// Assert: Periksa error menggunakan errors.Is
			// Ini sekarang akan berhasil karena kita membandingkan dengan ErrMockDB yang sama
			if !errors.Is(err, tc.expectedErr) {
				t.Errorf("Expected error '%v', but got '%v'", tc.expectedErr, err)
			}

			// Assert: Periksa objek guru
			if (teacher == nil && tc.expectedTeacher != nil) || (teacher != nil && tc.expectedTeacher == nil) {
				t.Errorf("Expected teacher '%v', but got '%v'", tc.expectedTeacher, teacher)
			}

			if teacher != nil && tc.expectedTeacher != nil && teacher.ID != tc.expectedTeacher.ID {
				t.Errorf("Expected teacher ID '%s', but got '%s'", tc.expectedTeacher.ID, teacher.ID)
			}
		})
	}
}
