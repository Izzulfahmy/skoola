// file: frontend/src/components/PenilaianPanel.tsx
import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { message, Spin, Empty, Tooltip } from 'antd';
import { createRoot } from 'react-dom/client';
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
  const tooltipRoots = useRef<Map<string, any>>(new Map());

  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianSiswaData[]>([]);

  useEffect(() => {
    return () => {
      tooltipRoots.current.forEach(root => root.unmount());
    };
  }, []);

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

  const { columns, nestedHeaders, data, allColumnsMeta } = useMemo(() => {
    const allColumnsMeta: { key: string, type: 'tp' | 'sumatif', tpId: number, sumatifId?: string }[] = [];
    const dynamicColumns: jspreadsheet.Column[] = [];

    const headerRow1: any[] = [{ title: 'Siswa', colspan: 2, align: 'center' }];
    const headerRow2: any[] = [{ title: 'NIS' }, { title: 'Nama Lengkap' }];
    
    materiList.forEach(materi => {
      let colspan = 0;
      materi.tujuan_pembelajaran.forEach(tp => {
        const hasSubPenilaian = tp.penilaian_sumatif && tp.penilaian_sumatif.length > 0;
        
        if (viewMode === 'detail' && hasSubPenilaian) {
          colspan += tp.penilaian_sumatif.length;
          tp.penilaian_sumatif.forEach(ps => {
            headerRow2.push({ title: `${ps.kode_jenis_ujian}`, tooltip: ps.nama_penilaian });
            dynamicColumns.push({ type: 'numeric', width: 80, mask: '0' });
            allColumnsMeta.push({ key: `sumatif-${ps.id}`, type: 'sumatif', tpId: tp.id, sumatifId: ps.id });
          });
        } else {
          colspan += 1;
          const isReadOnly = viewMode === 'rata-rata' && hasSubPenilaian;
          headerRow2.push({ title: `TP ${tp.urutan}`, tooltip: tp.deskripsi_tujuan });
          const columnOptions: any = { type: 'numeric', width: 80, mask: '0', readOnly: isReadOnly };
          if (isReadOnly) {
            columnOptions.className = 'jss-readonly';
          }
          dynamicColumns.push(columnOptions);
          allColumnsMeta.push({ key: `tp-${tp.id}`, type: 'tp', tpId: tp.id });
        }
      });
      if (colspan > 0) {
        headerRow1.push({ title: materi.nama_materi, colspan, align: 'center' });
      }
    });

    const finalNestedHeaders = [headerRow1, headerRow2];
    const finalColumns: jspreadsheet.Column[] = [
      { type: 'text', width: 120, readOnly: true, align: 'left' },
      { type: 'text', width: 250, readOnly: true, align: 'left' },
      ...dynamicColumns,
    ];

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

    return { columns: finalColumns, nestedHeaders: finalNestedHeaders, data: finalData, allColumnsMeta };
  }, [materiList, penilaianData, viewMode]);

  useEffect(() => {
    if (!loading && spreadsheetRef.current && data.length > 0 && columns.length > 2) {
        if (spreadsheetInstance.current) {
            spreadsheetInstance.current.destroy();
            tooltipRoots.current.forEach(root => root.unmount());
            tooltipRoots.current.clear();
        }

        spreadsheetInstance.current = jspreadsheet(spreadsheetRef.current, {
            data: data as jspreadsheet.CellValue[][],
            nestedHeaders,
            columns,
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
            onload: function(instance: HTMLElement) {
                nestedHeaders[1].forEach((header, index) => {
                    const headerCell = instance.querySelector(`thead tr:last-child td[data-x="${index}"]`);
                    if (headerCell && header.tooltip) {
                        const root = createRoot(headerCell);
                        tooltipRoots.current.set(header.title, root);
                        root.render(
                            <Tooltip title={header.tooltip} mouseEnterDelay={0.2}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    {header.title}
                                </div>
                            </Tooltip>
                        );
                    }
                });
            },
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, columns, nestedHeaders]);

  useImperativeHandle(ref, () => ({
    handleSave: async () => {
      if (!spreadsheetInstance.current) return;
      
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

            // Periksa apakah kolom readonly sebelum menambahkan ke payload
            const isReadOnly = columns[colIndex + 2]?.readOnly;

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
    return <Spin tip="Memuat data penilaian..." style={{ display: 'block', marginTop: '20px' }} />;
  }
  
  return (
    <div>
      {data.length > 0 && columns.length > 2 ? (
        <div className="spreadsheet-container">
          <div ref={spreadsheetRef} />
        </div>
      ) : (
        <Empty description="Belum ada Tujuan Pembelajaran yang bisa dinilai untuk mata pelajaran ini." style={{ marginTop: 32 }} />
      )}
    </div>
  );
});

export default PenilaianPanel;