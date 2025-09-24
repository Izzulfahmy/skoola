// file: frontend/src/components/PenilaianPanel.tsx
import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { message, Spin, Empty, Space } from 'antd';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { getAllMateriByPengajarKelas } from '../api/pembelajaran';
import { getPenilaian, upsertNilai } from '../api/penilaian';
import type { MateriPembelajaran, PenilaianData, PenilaianInput } from '../types';
import type { PenilaianPanelRef } from '../pages/teacher/PenilaianPage';

interface PenilaianPanelProps {
  pengajarKelasId: string;
  kelasId: string;
}

const PenilaianPanel = forwardRef<PenilaianPanelRef, PenilaianPanelProps>(({ pengajarKelasId, kelasId }, ref) => {
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstance = useRef<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([]);

  const allTpDetails = useMemo(() => {
    return materiList.flatMap(m => m.tujuan_pembelajaran);
  }, [materiList]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const materiData = await getAllMateriByPengajarKelas(pengajarKelasId);
        const materi = materiData || [];
        setMateriList(materi);

        const allTps = materi.flatMap(m => m.tujuan_pembelajaran).map(tp => tp.id);
        const dataPenilaian = await getPenilaian(kelasId, allTps);
        setPenilaianData(dataPenilaian.siswa || []);

      } catch (error) {
        message.error('Gagal memuat data awal untuk penilaian.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pengajarKelasId, kelasId]);

  useEffect(() => {
    if (!loading && spreadsheetRef.current && penilaianData.length > 0 && allTpDetails.length > 0) {
      if (spreadsheetInstance.current) {
        spreadsheetInstance.current.destroy();
      }

      const nestedHeaders: any[][] = [
        [
          { title: 'Siswa', colspan: 2, align: 'center' },
          ...materiList.map(materi => ({
            title: materi.nama_materi,
            colspan: materi.tujuan_pembelajaran.length,
            align: 'center' as const,
          }))
        ]
      ];
      
      const columns: jspreadsheet.Column[] = [
        { type: 'text', title: 'NIS', width: 120, readOnly: true, align: 'left' },
        { type: 'text', title: 'Nama Lengkap', width: 250, readOnly: true, align: 'left' },
        ...allTpDetails.map(tp => ({
          type: 'numeric',
          title: `TP ${tp.urutan}`,
          width: 80,
          mask: '0',
        } as jspreadsheet.Column)),
      ];

      const data = penilaianData.map(siswa => {
        const rowData: (string | number)[] = [
            siswa.nis || '-',
            siswa.nama_siswa,
        ];
        allTpDetails.forEach(tp => {
            const nilai = siswa.nilai[tp.id];
            rowData.push(nilai !== null && nilai !== undefined ? nilai : '');
        });
        return rowData;
      });

      spreadsheetInstance.current = jspreadsheet(spreadsheetRef.current, {
        data,
        nestedHeaders,
        columns,
        // @ts-ignore
        columnHeaders: false,
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
        // --- PERBAIKAN DI SINI: `instance` adalah elemennya, bukan `instance.el` ---
        onload: function(instance: HTMLElement) { // Beri tipe HTMLElement pada instance
          allTpDetails.forEach((tp, index) => {
            const colIndex = index + 2;
            const headerCell = instance.querySelector(`thead tr:last-child td[data-x="${colIndex}"]`);
            if (headerCell) {
              headerCell.setAttribute('title', tp.deskripsi_tujuan);
            }
          });
        },
        // ----------------------------------------------------------------------
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, penilaianData, allTpDetails]);
  
  useImperativeHandle(ref, () => ({
    handleSave: async () => {
      if (!spreadsheetInstance.current) return;
      
      try {
        const dataFromSheet = spreadsheetInstance.current.getData();
        const payload: PenilaianInput[] = [];

        dataFromSheet.forEach((row: any[], rowIndex: number) => {
          const siswa = penilaianData[rowIndex];
          if (!siswa) return;

          allTpDetails.forEach((tp, tpIndex) => {
            const nilaiCell = row[tpIndex + 2];
            const nilai = (nilaiCell === '' || nilaiCell === null || nilaiCell === undefined) ? null : parseFloat(nilaiCell as string);
            
            payload.push({
              anggota_kelas_id: siswa.anggota_kelas_id,
              tujuan_pembelajaran_id: tp.id,
              nilai: nilai,
            });
          });
        });
        
        await upsertNilai(payload);
        message.success('Semua perubahan nilai berhasil disimpan.');
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
      {allTpDetails.length > 0 ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="spreadsheet-container">
            <div ref={spreadsheetRef} />
          </div>
        </Space>
      ) : (
        <Empty description="Belum ada Tujuan Pembelajaran yang bisa dinilai untuk mata pelajaran ini." style={{ marginTop: 32 }} />
      )}
    </div>
  );
});

export default PenilaianPanel;