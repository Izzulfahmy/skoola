// file: backend/internal/kurikulum/model.go
package kurikulum

// Kurikulum merepresentasikan data dari tabel 'kurikulum'.
type Kurikulum struct {
	ID            int     `json:"id"`
	NamaKurikulum string  `json:"nama_kurikulum"`
	Deskripsi     *string `json:"deskripsi"`
}

// Fase merepresentasikan data dari tabel 'fase'.
type Fase struct {
	ID        int     `json:"id"`
	NamaFase  string  `json:"nama_fase"`
	Deskripsi *string `json:"deskripsi"`
}

// Tingkatan aalah struktur data untuk menampung data tingkatan.
type Tingkatan struct {
	ID            int    `json:"id"`
	NamaTingkatan string `json:"nama_tingkatan"`
}

// FaseTingkatan aalah DTO yang menggabungkan Fase dan Tingkatan yang dipetakan.
type FaseTingkatan struct {
	Fase
	TingkatanID   int    `json:"tingkatan_id"`
	NamaTingkatan string `json:"nama_tingkatan"`
}

// PemetaanInput adalah DTO untuk membuat pemetaan baru.
type PemetaanInput struct {
	TahunAjaranID string `json:"tahun_ajaran_id" validate:"required"`
	KurikulumID   int    `json:"kurikulum_id" validate:"required"`
	TingkatanID   int    `json:"tingkatan_id" validate:"required"`
	FaseID        int    `json:"fase_id" validate:"required"`
}

// UpsertKurikulumInput adalah DTO untuk membuat atau memperbarui data kurikulum.
type UpsertKurikulumInput struct {
	NamaKurikulum string `json:"nama_kurikulum" validate:"required,min=3,max=100"`
	Deskripsi     string `json:"deskripsi" validate:"omitempty"`
}

// UpsertFaseInput adalah DTO untuk membuat atau memperbarui data fase.
type UpsertFaseInput struct {
	NamaFase  string `json:"nama_fase" validate:"required,min=1,max=100"`
	Deskripsi string `json:"deskripsi" validate:"omitempty"`
}
