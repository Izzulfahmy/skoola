// file: frontend/src/components/PenilaianPanel.tsx
import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { message, Spin, Empty } from 'antd';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { getPenilaianLengkap, upsertNilaiBulk } from '../api/penilaian';
import type { RencanaPembelajaranItem, PenilaianSiswaData, BulkUpsertNilaiInput } from '../types';
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
  const [rencanaList, setRencanaList] = useState<RencanaPembelajaranItem[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianSiswaData[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPenilaianLengkap(kelasId, pengajarKelasId);
      setRencanaList(response.rencana || []);
      setPenilaianData(response.penilaian.siswa || []);
    } catch (error) {
      message.error('Gagal memuat data awal untuk penilaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pengajarKelasId, kelasId, viewMode]);

  const { columns, data, nestedHeaders, allColumnsMeta } = useMemo(() => {
    if (rencanaList.length === 0) {
      return { columns: [], data: [], nestedHeaders: [], allColumnsMeta: [] };
    }

    const finalColumns: jspreadsheet.Column[] = [
      { type: 'text', title: 'NIS', width: 120, readOnly: true, align: 'left' },
      {
        type: 'text',
        title: 'Nama Lengkap',
        width: 250,
        readOnly: true,
        align: 'left',
        wordWrap: true,
      },
    ];

    const nestedHeadersLvl1: any[] = [{ title: '', colspan: 2 }];
    const nestedHeadersLvl2: any[] = viewMode === 'detail' ? [{ title: '', colspan: 2 }] : [];
    
    const allColumnsMeta: { key: string, type: 'tp' | 'sumatif', tpId?: number, sumatifId?: string, ujianId?: number }[] = [];
    
    let materiCounter = 1;

    rencanaList.forEach((item) => {
      let itemColspan = 0;

      if (item.type === 'materi') {
          const tujuanPembelajaran = item.tujuan_pembelajaran || [];
          if (tujuanPembelajaran.length === 0) return;

          tujuanPembelajaran.forEach((tp) => {
              const hasSubPenilaian = tp.penilaian_sumatif && tp.penilaian_sumatif.length > 0;
              if (viewMode === 'detail') {
                  if (hasSubPenilaian) {
                      const tpColspan = tp.penilaian_sumatif.length;
                      itemColspan += tpColspan;
                      nestedHeadersLvl2.push({ title: `TP ${tp.urutan}`, colspan: tpColspan });
                      tp.penilaian_sumatif.forEach((ps) => {
                          finalColumns.push({ type: 'numeric', width: 90, mask: '0', title: ps.kode_jenis_ujian, tooltip: `${tp.deskripsi_tujuan} - ${ps.nama_penilaian}` } as any);
                          allColumnsMeta.push({ key: `sumatif-${ps.id}`, type: 'sumatif', tpId: tp.id, sumatifId: ps.id });
                      });
                  } else {
                      itemColspan += 1;
                      nestedHeadersLvl2.push({ title: `TP ${tp.urutan}`, colspan: 1 });
                      finalColumns.push({ type: 'numeric', width: 100, mask: '0', title: '\u00A0', tooltip: tp.deskripsi_tujuan } as any);
                      allColumnsMeta.push({ key: `tp-${tp.id}`, type: 'tp', tpId: tp.id });
                  }
              } else {
                  itemColspan += 1;
                  const isReadOnly = hasSubPenilaian;
                  const titleText = `TP ${tp.urutan}${isReadOnly ? '*' : ''}`;
                  finalColumns.push({ type: 'numeric', width: 100, mask: '0', readOnly: isReadOnly, title: titleText, tooltip: tp.deskripsi_tujuan, className: isReadOnly ? 'jss-readonly' : '' } as any);
                  allColumnsMeta.push({ key: `tp-${tp.id}`, type: 'tp', tpId: tp.id });
              }
          });
          if (itemColspan > 0) {
              nestedHeadersLvl1.push({ 
                title: `Materi ${materiCounter}`, 
                tooltip: item.nama, 
                colspan: itemColspan 
              });
              materiCounter++;
          }
      } else if (item.type === 'ujian') {
          const penilaianSumatif = item.penilaian_sumatif || [];
          
          if (viewMode === 'detail') {
              itemColspan = Math.max(1, penilaianSumatif.length);
              nestedHeadersLvl2.push({ title: 'Rincian Ujian', colspan: itemColspan });
              
              if (penilaianSumatif.length > 0) {
                  penilaianSumatif.forEach((ps) => {
                      finalColumns.push({ type: 'numeric', width: 90, mask: '0', title: ps.kode_jenis_ujian, tooltip: `${item.nama} - ${ps.nama_penilaian}` } as any);
                      allColumnsMeta.push({ key: `sumatif-${ps.id}`, type: 'sumatif', ujianId: item.id, sumatifId: ps.id });
                  });
              } else {
                  finalColumns.push({ type: 'text', width: 100, title: '\u00A0', readOnly: true, tooltip: `Belum ada rincian untuk ${item.nama}` } as any);
                  allColumnsMeta.push({ key: `ujian-placeholder-${item.id}`, type: 'sumatif', ujianId: item.id });
              }
          } else { 
              itemColspan = 1;
              const isReadOnly = penilaianSumatif.length > 0;
              const titleText = `Nilai Akhir${isReadOnly ? '*' : ''}`;
              finalColumns.push({ type: 'numeric', width: 100, mask: '0', readOnly: isReadOnly, title: titleText, tooltip: item.nama, className: isReadOnly ? 'jss-readonly' : '' } as any);
              allColumnsMeta.push({ key: `ujian-${item.id}`, type: 'sumatif', ujianId: item.id });
          }

          if (itemColspan > 0) {
              nestedHeadersLvl1.push({ 
                title: item.nama, 
                tooltip: item.nama, 
                colspan: itemColspan 
              });
          }
      }
    });
    
    const finalNestedHeaders = viewMode === 'detail' ? [nestedHeadersLvl1, nestedHeadersLvl2] : [nestedHeadersLvl1];
    
    const allTujuanPembelajaran = rencanaList.flatMap(item => item.type === 'materi' ? item.tujuan_pembelajaran || [] : []);

    const finalData = penilaianData.map(siswa => {
      const rowData: (string | number | null)[] = [ siswa.nis || '-', siswa.nama_siswa ];
      allColumnsMeta.forEach(meta => {
        if (meta.type === 'tp' && meta.tpId) {
            const tpInfo = allTujuanPembelajaran.find(t => t.id === meta.tpId);
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
        } else if (meta.type === 'sumatif' && meta.ujianId && !meta.sumatifId) { 
            const ujianInfo = rencanaList.find(item => item.id === meta.ujianId && item.type === 'ujian');
            const penilaianSumatif = ujianInfo?.penilaian_sumatif || [];
            if (viewMode === 'rata-rata' && penilaianSumatif.length > 0) {
                const values = penilaianSumatif.map(ps => siswa.nilai_sumatif[ps.id]?.nilai).filter(n => n != null) as number[];
                const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : null;
                rowData.push(avg !== null ? parseFloat(avg.toFixed(1)) : '');
            } else {
                rowData.push('');
            }
        }
      });
      return rowData;
    });

    return { columns: finalColumns, data: finalData, nestedHeaders: finalNestedHeaders, allColumnsMeta };
  }, [rencanaList, penilaianData, viewMode]);

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

            if (meta.type === 'tp' && !isReadOnly && meta.tpId) {
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
        <Empty description="Belum ada data siswa atau rencana pembelajaran yang bisa dinilai untuk mata pelajaran ini." style={{ marginTop: 32 }} />
      )}
    </div>
  );
});

export default PenilaianPanel;