// file: frontend/src/components/PenilaianPanel.tsx
import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { message, Spin, Empty } from 'antd';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { getPenilaianLengkap, upsertNilaiBulk } from '../api/penilaian';
import type { MateriPembelajaran, PenilaianSiswaData, BulkUpsertNilaiInput } from '../types';
import type { PenilaianPanelRef, ViewMode } from '../pages/teacher/PenilaianPage';

interface PenilaianPanelProps {
  pengajarKelasId: string;
  kelasId: string;
  viewMode: ViewMode;
}

const PenilaianPanel = forwardRef<PenilaianPanelRef, PenilaianPanelProps>(({ pengajarKelasId, kelasId, viewMode }, ref) => {
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstance = useRef<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianSiswaData[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPenilaianLengkap(kelasId, pengajarKelasId);
      setMateriList(response.materi || []);
      setPenilaianData(response.penilaian.siswa || []);
    } catch (error) {
      message.error('Gagal memuat data awal untuk penilaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pengajarKelasId, kelasId]);

  const { columns, data, nestedHeaders, allColumnsMeta } = useMemo(() => {
    if (materiList.length === 0) {
      return { columns: [], data: [], nestedHeaders: [], allColumnsMeta: [] };
    }

    // Header Level 2 (Paling Bawah) & Konfigurasi Kolom Utama
    const finalColumns: jspreadsheet.Column[] = [
      { type: 'text', title: 'NIS', width: 120, readOnly: true, align: 'left' },
      { type: 'text', title: 'Nama Lengkap', width: 250, readOnly: true, align: 'left' },
    ];

    // Header Level 1 (Paling Atas)
    const nestedHeadersLvl1: any[] = [
      { title: '', colspan: 1 }, // Placeholder untuk kolom NIS
      { title: '', colspan: 1 }, // Placeholder untuk kolom Nama Lengkap
    ];
    
    const allColumnsMeta: { key: string, type: 'tp' | 'sumatif', tpId: number, sumatifId?: string }[] = [];

    materiList.forEach((materi) => {
      if (!materi.tujuan_pembelajaran || materi.tujuan_pembelajaran.length === 0) return;

      let materiColspan = 0;
      
      materi.tujuan_pembelajaran.forEach((tp) => {
        const hasSubPenilaian = tp.penilaian_sumatif && tp.penilaian_sumatif.length > 0;

        if (viewMode === 'detail' && hasSubPenilaian) {
           materiColspan += tp.penilaian_sumatif.length;
           tp.penilaian_sumatif.forEach((ps) => {
            finalColumns.push({
              type: 'numeric',
              width: 90,
              mask: '0',
              title: ps.kode_jenis_ujian, // Header baris bawah
              tooltip: `${tp.deskripsi_tujuan} - ${ps.nama_penilaian}`,
            } as any);
            allColumnsMeta.push({ key: `sumatif-${ps.id}`, type: 'sumatif', tpId: tp.id, sumatifId: ps.id });
          });
        } else {
          materiColspan += 1;
          const isReadOnly = viewMode === 'rata-rata' && hasSubPenilaian;
          finalColumns.push({
            type: 'numeric',
            width: 100,
            mask: '0',
            readOnly: isReadOnly,
            title: `TP ${tp.urutan}`, // Header baris bawah
            tooltip: tp.deskripsi_tujuan,
            className: isReadOnly ? 'jss-readonly' : ''
          } as any);
          allColumnsMeta.push({ key: `tp-${tp.id}`, type: 'tp', tpId: tp.id });
        }
      });

      if (materiColspan > 0) {
        nestedHeadersLvl1.push({ title: materi.nama_materi, colspan: materiColspan });
      }
    });
    
    const finalNestedHeaders = [nestedHeadersLvl1];

    const finalData = penilaianData.map(siswa => {
      const rowData: (string | number | null)[] = [ siswa.nis || '-', siswa.nama_siswa ];
      allColumnsMeta.forEach(meta => {
        if (meta.type === 'tp') {
            const tpInfo = materiList.flatMap(m => m.tujuan_pembelajaran).find(t => t.id === meta.tpId);
            const hasSub = tpInfo && tpInfo.penilaian_sumatif?.length > 0;
            if (viewMode === 'rata-rata' && hasSub) {
                const sumatifs = tpInfo?.penilaian_sumatif || [];
                const values = sumatifs.map(ps => siswa.nilai_sumatif[ps.id]?.nilai).filter(n => n != null) as number[];
                const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : null;
                rowData.push(avg !== null ? parseFloat(avg.toFixed(1)) : '');
            } else {
                rowData.push(siswa.nilai_formatif[meta.tpId]?.nilai ?? '');
            }
        } else if (meta.type === 'sumatif' && meta.sumatifId) {
            rowData.push(siswa.nilai_sumatif[meta.sumatifId]?.nilai ?? '');
        }
      });
      return rowData;
    });

    return { columns: finalColumns, data: finalData, nestedHeaders: finalNestedHeaders, allColumnsMeta };
  }, [materiList, penilaianData, viewMode]);

  useEffect(() => {
    if (!loading && spreadsheetRef.current && data.length > 0 && columns.length > 2) {
        if (spreadsheetInstance.current) {
            spreadsheetInstance.current.destroy();
        }
        spreadsheetInstance.current = jspreadsheet(spreadsheetRef.current, {
            data: data as jspreadsheet.CellValue[][],
            columns,
            nestedHeaders,
            allowInsertRow: false,
            allowDeleteRow: false,
            allowInsertColumn: false,
            allowDeleteColumn: false,
            columnDrag: false,
            rowDrag: false,
            tableOverflow: true,
            tableWidth: '100%',
            tableHeight: '60vh',
            defaultColAlign: 'center',
        });
    } else if (spreadsheetInstance.current) {
        spreadsheetInstance.current.destroy();
        spreadsheetInstance.current = null;
    }
  }, [loading, data, columns, nestedHeaders]);
  
  useImperativeHandle(ref, () => ({
    handleSave: async () => {
      if (!spreadsheetInstance.current) {
        message.info('Tidak ada data untuk disimpan.');
        return;
      };
      
      try {
        const dataFromSheet = spreadsheetInstance.current.getData();
        const payload: BulkUpsertNilaiInput = {
          nilai_formatif: [],
          nilai_sumatif: [],
        };

        dataFromSheet.forEach((row: any[], rowIndex: number) => {
          const siswa = penilaianData[rowIndex];
          if (!siswa) return;

          allColumnsMeta.forEach((meta, colIndex) => {
            const nilaiCell = row[colIndex + 2];
            const nilai = (nilaiCell === '' || nilaiCell === null || nilaiCell === undefined) ? null : parseFloat(nilaiCell as string);
            const isReadOnly = (columns[colIndex + 2] as any)?.readOnly;

            if (meta.type === 'tp' && !isReadOnly) {
              const originalNilai = siswa.nilai_formatif[meta.tpId]?.nilai ?? null;
              if(nilai !== originalNilai) {
                payload.nilai_formatif.push({
                  anggota_kelas_id: siswa.anggota_kelas_id,
                  tujuan_pembelajaran_id: meta.tpId,
                  nilai: nilai,
                });
              }
            } else if (meta.type === 'sumatif' && meta.sumatifId) {
              const originalNilai = siswa.nilai_sumatif[meta.sumatifId]?.nilai ?? null;
              if (nilai !== originalNilai) {
                  payload.nilai_sumatif.push({
                      anggota_kelas_id: siswa.anggota_kelas_id,
                      penilaian_sumatif_id: meta.sumatifId,
                      nilai: nilai,
                  });
              }
            }
          });
        });
        
        if (payload.nilai_formatif.length > 0 || payload.nilai_sumatif.length > 0) {
            await upsertNilaiBulk(payload);
            message.success('Semua perubahan nilai berhasil disimpan.');
            fetchData();
        } else {
            message.info('Tidak ada perubahan nilai untuk disimpan.');
        }

      } catch (error) {
        message.error('Gagal menyimpan perubahan.');
      }
    }
  }));

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><Spin tip="Memuat data penilaian..." /></div>;
  }
  
  return (
    <div>
      {data.length > 0 && columns.length > 2 ? (
        <div className="spreadsheet-container">
          <div ref={spreadsheetRef} />
        </div>
      ) : (
        <Empty description="Belum ada data siswa atau tujuan pembelajaran yang bisa dinilai untuk mata pelajaran ini." style={{ marginTop: 32 }} />
      )}
    </div>
  );
});

export default PenilaianPanel;