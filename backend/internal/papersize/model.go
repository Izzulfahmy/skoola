package papersize

import "time"

// PaperSize merepresentasikan data dari tabel 'paper_size'.
type PaperSize struct {
	ID          string    `json:"id"`
	NamaKertas  string    `json:"nama_kertas"`
	Satuan      string    `json:"satuan"`
	Panjang     float64   `json:"panjang"`
	Lebar       float64   `json:"lebar"`
	MarginAtas  float64   `json:"margin_atas"`
	MarginBawah float64   `json:"margin_bawah"`
	MarginKiri  float64   `json:"margin_kiri"`
	MarginKanan float64   `json:"margin_kanan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// UpsertPaperSizeInput adalah DTO untuk membuat atau memperbarui data.
type UpsertPaperSizeInput struct {
	NamaKertas  string  `json:"nama_kertas" validate:"required,min=1,max=100"`
	Satuan      string  `json:"satuan" validate:"required,oneof=mm cm in"`
	Panjang     float64 `json:"panjang" validate:"required,gt=0"`
	Lebar       float64 `json:"lebar" validate:"required,gt=0"`
	MarginAtas  float64 `json:"margin_atas" validate:"required,min=0"`
	MarginBawah float64 `json:"margin_bawah" validate:"required,min=0"`
	MarginKiri  float64 `json:"margin_kiri" validate:"required,min=0"`
	MarginKanan float64 `json:"margin_kanan" validate:"required,min=0"`
}
