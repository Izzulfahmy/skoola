// frontend/src/pages/UjianMasterPage.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Select, Spin, Table, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllUjianMaster } from '../api/ujianMaster';
import type { TahunAjaran, UjianMaster } from '../types';

const { Title } = Typography;

const UjianMasterPage = () => {
  const navigate = useNavigate();
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>(undefined);

  const { data: tahunAjaranData, isLoading: isTahunAjaranLoading } = useQuery<TahunAjaran[]>({
    queryKey: ['tahunAjaran'],
    queryFn: getAllTahunAjaran,
  });

  useEffect(() => {
    if (tahunAjaranData && !selectedTahunAjaran) {
      // Perbandingan 'Aktif' sudah benar
      const activeTahunAjaran = tahunAjaranData.find(ta => ta.status === 'Aktif');
      if (activeTahunAjaran) {
        setSelectedTahunAjaran(activeTahunAjaran.id);
      }
    }
  }, [tahunAjaranData, selectedTahunAjaran]);

  const { data: ujianData, isLoading: isUjianLoading, isError } = useQuery<UjianMaster[]>({
    queryKey: ['ujianMaster', selectedTahunAjaran],
    queryFn: () => getAllUjianMaster(selectedTahunAjaran!),
    enabled: !!selectedTahunAjaran,
  });
  
  if (isError) {
      message.error("Gagal memuat data paket ujian. Silakan coba lagi.");
  }

  const columns = [
    {
      title: 'Nama Paket Ujian',
      dataIndex: 'nama_paket_ujian',
      key: 'nama_paket_ujian',
      render: (text: string, record: UjianMaster) => (
        <a onClick={() => navigate(`/admin/ujian/${record.id}`)}>{text}</a>
      ),
    },
    { title: 'Jenis Ujian', dataIndex: 'nama_jenis_ujian', key: 'nama_jenis_ujian' },
    { title: 'Jumlah Soal', dataIndex: 'jumlah_soal', key: 'jumlah_soal' },
    { title: 'Durasi (menit)', dataIndex: 'durasi', key: 'durasi' },
  ];

  const isLoading = isTahunAjaranLoading || (!!selectedTahunAjaran && isUjianLoading);

  return (
    <Card>
      <Title level={4}>Manajemen Paket Ujian</Title>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Select
          style={{ width: 250 }}
          placeholder="Pilih Tahun Ajaran"
          value={selectedTahunAjaran}
          onChange={(value) => setSelectedTahunAjaran(value)}
          loading={isTahunAjaranLoading}
          options={tahunAjaranData?.map(ta => ({
            // **PERBAIKAN FINAL DI SINI**
            // Menggunakan `nama_tahun_ajaran` sesuai dengan tipe data TahunAjaran
            label: `${ta.nama_tahun_ajaran} - ${ta.semester}`,
            value: ta.id,
          }))}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/admin/ujian/create')}
        >
          Buat Paket Ujian Baru
        </Button>
      </div>

      <Spin spinning={isLoading}>
        <Table
          dataSource={ujianData}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Spin>
    </Card>
  );
};

export default UjianMasterPage;