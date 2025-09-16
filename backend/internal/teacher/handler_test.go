// file: internal/teacher/handler_test.go
package teacher

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

func TestHandler_GetByID(t *testing.T) {
	// Buat sebuah objek guru tiruan untuk digunakan di semua tes
	mockTeacher := &Teacher{
		ID:          "test-id",
		UserID:      "user-id-123",
		NamaLengkap: "Guru Uji Coba",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	// Ubah objek tiruan menjadi JSON string untuk perbandingan body
	mockTeacherJSON, _ := json.Marshal(mockTeacher)

	testCases := []struct {
		name               string
		teacherID          string
		setupMock          func(mock *MockRepository)
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:      "Success - 200 OK",
			teacherID: "test-id",
			setupMock: func(mock *MockRepository) {
				mock.GetByIDFunc = func(ctx context.Context, schemaName string, id string) (*Teacher, error) {
					return mockTeacher, nil
				}
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       string(mockTeacherJSON),
		},
		{
			name:      "Not Found - 404 Not Found",
			teacherID: "not-found-id",
			setupMock: func(mock *MockRepository) {
				mock.GetByIDFunc = func(ctx context.Context, schemaName string, id string) (*Teacher, error) {
					return nil, nil // Service mengembalikan nil saat tidak ditemukan
				}
			},
			expectedStatusCode: http.StatusNotFound,
			expectedBody:       "Guru tidak ditemukan\n",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Arrange
			mockRepo := &MockRepository{}
			tc.setupMock(mockRepo)

			// Kita butuh service sungguhan yang menggunakan mock repo
			service := NewService(mockRepo, nil)
			handler := NewHandler(service)

			// Buat request HTTP tiruan
			req := httptest.NewRequest(http.MethodGet, "/teachers/"+tc.teacherID, nil)
			// Buat perekam respons tiruan
			rr := httptest.NewRecorder()

			// PENTING: Karena kita tidak menggunakan router chi secara penuh,
			// kita harus secara manual menyisipkan parameter URL ke dalam context
			// agar chi.URLParam bisa berfungsi.
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("teacherID", tc.teacherID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			// Sisipkan juga schemaName ke context, seolah-olah dari middleware
			req = req.WithContext(context.WithValue(req.Context(), "schemaName", "test-schema"))

			// Act
			// Panggil handler secara langsung
			handler.GetByID(rr, req)

			// Assert
			// Periksa kode status
			if rr.Code != tc.expectedStatusCode {
				t.Errorf("expected status %d, got %d", tc.expectedStatusCode, rr.Code)
			}

			// Periksa body respons
			// strings.TrimSpace digunakan untuk menghapus newline di akhir body dari http.Error
			if strings.TrimSpace(rr.Body.String()) != strings.TrimSpace(tc.expectedBody) {
				t.Errorf("expected body '%s', got '%s'", tc.expectedBody, rr.Body.String())
			}
		})
	}
}
