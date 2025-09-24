// file: frontend/src/components/PenilaianPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button, message, Spin, Empty, Table, InputNumber, Space, Typography, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getAllMateriByPengajarKelas } from '../api/pembelajaran';
import { getPenilaian, upsertNilai } from '../api/penilaian';
import type { MateriPembelajaran, PenilaianData, PenilaianInput } from '../types';

const { Text } = Typography;

interface PenilaianPanelProps {
  pengajarKelasId: string;
  kelasId: string;
}

const PenilaianPanel = ({ pengajarKelasId, kelasId }: PenilaianPanelProps) => {
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([]);

  const allTpDetails = useMemo(() => {
    return materiList.flatMap(m => m.tujuan_pembelajaran);
  }, [materiList]);

  const allTpIds = useMemo(() => {
    return allTpDetails.map(tp => tp.id);
  }, [allTpDetails]);

  // Fetch materi dan TP
  useEffect(() => {
    const fetchMateri = async () => {
      setLoading(true);
      try {
        const data = await getAllMateriByPengajarKelas(pengajarKelasId);
        setMateriList(data || []);
      } catch (error) {
        message.error('Gagal memuat daftar materi pembelajaran.');
      } finally {
        setLoading(false);
      }
    };
    fetchMateri();
  }, [pengajarKelasId]);

  // Fetch nilai siswa berdasarkan semua TP yang ada
  useEffect(() => {
    if (allTpIds.length > 0) {
      const fetchNilai = async () => {
        setLoading(true);
        try {
          const data = await getPenilaian(kelasId, allTpIds);
          setPenilaianData(data.siswa || []);
        } catch (error) {
          message.error('Gagal memuat data nilai siswa.');
        } finally {
          setLoading(false);
        }
      };
      fetchNilai();
    } else {
      setPenilaianData([]);
    }
  }, [kelasId, allTpIds]);

  const handleNilaiChange = (anggotaKelasId: string, tpId: number, nilai: number | null) => {
    setPenilaianData(prevData =>
      prevData.map(siswa => {
        if (siswa.anggota_kelas_id === anggotaKelasId) {
          return {
            ...siswa,
            nilai: {
              ...siswa.nilai,
              [tpId]: nilai,
            },
          };
        }
        return siswa;
      })
    );
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const payload: PenilaianInput[] = [];
    penilaianData.forEach(siswa => {
        allTpIds.forEach(tpId => {
            payload.push({
                anggota_kelas_id: siswa.anggota_kelas_id,
                tujuan_pembelajaran_id: tpId,
                nilai: siswa.nilai[tpId] !== undefined ? siswa.nilai[tpId] : null,
            });
        });
    });

    try {
        await upsertNilai(payload);
        message.success('Semua perubahan nilai berhasil disimpan.');
    } catch (error) {
        message.error('Gagal menyimpan nilai.');
    } finally {
        setIsSaving(false);
    }
  };

  // --- PERUBAHAN UTAMA DI SINI: Membuat kolom bertingkat ---
  const columns: TableColumnsType<PenilaianData> = [
    {
      title: 'No',
      key: 'no',
      width: 50,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
      fixed: 'left',
      width: 220,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text><br/>
          <Text type="secondary">NIS: {record.nis || '-'}</Text>
        </div>
      )
    },
    // Iterasi melalui materi untuk membuat header grup
    ...materiList.map(materi => ({
      title: materi.nama_materi,
      align: 'center' as const,
      // Setiap materi akan memiliki anak kolom yaitu TP-TP nya
      children: materi.tujuan_pembelajaran.map(tp => ({
        title: (
          <Tooltip title={tp.deskripsi_tujuan}>
              <span>{`TP ${tp.urutan}`}</span>
          </Tooltip>
        ),
        dataIndex: ['nilai', tp.id],
        key: `tp-${tp.id}`,
        width: 80,
        align: 'center' as const,
        render: (_: any, record: PenilaianData) => (
          <InputNumber
            min={0}
            max={100}
            value={record.nilai[tp.id]}
            onChange={value => handleNilaiChange(record.anggota_kelas_id, tp.id, value)}
            controls={false}
            style={{ width: '100%', textAlign: 'center' }}
          />
        ),
      })),
    })),
  ];

  if (loading && materiList.length === 0) return <Spin />;

  return (
    <div>
      {allTpDetails.length > 0 ? (
        <Space direction="vertical" style={{width: '100%'}}>
            {/* --- Kotak Alert dihilangkan --- */}
            <Table
                columns={columns}
                dataSource={penilaianData}
                rowKey="anggota_kelas_id"
                loading={loading}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
            />
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isSaving}>
                    Simpan Perubahan
                </Button>
            </Space>
        </Space>
      ) : (
        <Empty description="Belum ada Tujuan Pembelajaran yang bisa dinilai untuk mata pelajaran ini." style={{marginTop: 32}}/>
      )}
    </div>
  );
};

export default PenilaianPanel;