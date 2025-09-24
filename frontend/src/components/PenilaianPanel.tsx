// file: frontend/src/components/PenilaianPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import { TreeSelect, Button, message, Spin, Empty, Table, InputNumber, Space, Typography, Tag, Alert, Tooltip } from 'antd'; // <-- 1. Tambahkan Tooltip di sini
import type { TableColumnsType } from 'antd';
import { SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { getAllMateriByPengajarKelas } from '../api/pembelajaran';
import { getPenilaian, upsertNilai } from '../api/penilaian';
import type { MateriPembelajaran, PenilaianData, PenilaianInput, TujuanPembelajaran } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';


const { Text, Title } = Typography;

interface PenilaianPanelProps {
  pengajarKelasId: string;
  kelasId: string;
}

const PenilaianPanel = ({ pengajarKelasId, kelasId }: PenilaianPanelProps) => {
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedTpIds, setSelectedTpIds] = useState<number[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const treeData = useMemo(() => {
    return materiList.map(materi => ({
      title: materi.nama_materi,
      value: `materi-${materi.id}`,
      key: `materi-${materi.id}`,
      children: materi.tujuan_pembelajaran.map(tp => ({
        title: tp.deskripsi_tujuan,
        value: tp.id,
        key: `tp-${tp.id}`,
      })),
    }));
  }, [materiList]);

  const selectedTpDetails = useMemo(() => {
    const allTps: TujuanPembelajaran[] = materiList.flatMap(m => m.tujuan_pembelajaran);
    return allTps.filter(tp => selectedTpIds.includes(tp.id));
  }, [materiList, selectedTpIds]);


  // Fetch materi and TP for TreeSelect
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

  // Fetch student grades when selected TPs change
  useEffect(() => {
    if (selectedTpIds.length > 0) {
      const fetchNilai = async () => {
        setLoading(true);
        try {
          const data = await getPenilaian(kelasId, selectedTpIds);
          setPenilaianData(data.siswa || []);
          if (data.last_updated) {
            setLastUpdated(format(new Date(data.last_updated), "d MMMM yyyy, HH:mm", { locale: id }));
          } else {
            setLastUpdated(null);
          }
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
  }, [kelasId, selectedTpIds]);

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
        selectedTpIds.forEach(tpId => {
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
        // Re-fetch to get latest updated_at timestamp
        const data = await getPenilaian(kelasId, selectedTpIds);
        if (data.last_updated) {
          setLastUpdated(format(new Date(data.last_updated), "d MMMM yyyy, HH:mm", { locale: id }));
        }
    } catch (error) {
        message.error('Gagal menyimpan nilai.');
    } finally {
        setIsSaving(false);
    }
  };

  const columns: TableColumnsType<PenilaianData> = [
    {
      title: 'No',
      key: 'no',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text><br/>
          <Text type="secondary">NIS: {record.nis || '-'}</Text>
        </div>
      )
    },
    ...selectedTpDetails.map(tp => ({
      title: (
        <Tooltip title={tp.deskripsi_tujuan}>
            <span>{`TP ${tp.id}`}</span>
        </Tooltip>
      ),
      dataIndex: ['nilai', tp.id],
      key: `tp-${tp.id}`,
      width: 120,
      render: (_: any, record: PenilaianData) => (
        <InputNumber
          min={0}
          max={100}
          value={record.nilai[tp.id]}
          onChange={value => handleNilaiChange(record.anggota_kelas_id, tp.id, value)}
          style={{ width: '100%' }}
        />
      ),
    })),
  ];

  if (loading && materiList.length === 0) return <Spin />;

  return (
    <div>
      <Title level={5}>Pilih Tujuan Pembelajaran (TP)</Title>
      <TreeSelect
        treeData={treeData}
        value={selectedTpIds}
        onChange={setSelectedTpIds}
        treeCheckable={true}
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder="Pilih TP yang akan dinilai"
        style={{ width: '100%', marginBottom: 16 }}
        treeDefaultExpandAll
        treeLine // <-- 2. Ganti prop dari `showTreeIcon` menjadi `treeLine`
      />

      {selectedTpIds.length > 0 && (
        <>
            <Space direction="vertical" style={{width: '100%'}}>
                <Alert 
                    message={
                        <Space>
                            <Text>Menampilkan {selectedTpIds.length} kolom penilaian.</Text>
                            {lastUpdated && <Tag color="geekblue">Terakhir disimpan: {lastUpdated}</Tag>}
                        </Space>
                    } 
                    type="info"
                />
                <Table
                    columns={columns}
                    dataSource={penilaianData}
                    rowKey="anggota_kelas_id"
                    loading={loading}
                    pagination={false}
                    bordered
                    size="small"
                />
                <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button icon={<ClearOutlined />} onClick={() => setSelectedTpIds([])}>Batal</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isSaving}>
                        Simpan Perubahan
                    </Button>
                </Space>
            </Space>
        </>
      )}

      {selectedTpIds.length === 0 && (
          <Empty description="Pilih satu atau lebih Tujuan Pembelajaran untuk memulai penilaian." style={{marginTop: 32}}/>
      )}
    </div>
  );
};

export default PenilaianPanel;