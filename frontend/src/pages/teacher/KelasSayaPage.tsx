// file: src/pages/teacher/KelasSayaPage.tsx
import { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, Table, Alert, Space, Tag } from 'antd';
import { getMyClasses } from '../../api/teachers';
import type { Kelas } from '../../types';

const { Title, Text } = Typography;

const KelasSayaPage = () => {
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<Kelas[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getMyClasses();
        setMyClasses(data || []);
      } catch (err) {
        setError('Gagal memuat daftar kelas. Silakan coba lagi.');
        message.error('Gagal memuat daftar kelas.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fungsi helper untuk menghasilkan warna konsisten berdasarkan nama mapel
  const getTagColor = (mapel: string) => {
    const colors = [
      'magenta', 'red', 'volcano', 'orange', 'gold', 
      'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
    ];
    let hash = 0;
    for (let i = 0; i < mapel.length; i++) {
      hash = mapel.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Kelas',
      dataIndex: 'nama_kelas',
      key: 'nama_kelas',
      width: 150,
      render: (text: string, record: Kelas) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>{record.nama_tingkatan}</Text>
        </Space>
      ),
    },
    {
      title: 'Mata Pelajaran',
      dataIndex: 'mata_pelajaran',
      key: 'mata_pelajaran',
      render: (text: string) => {
        if (!text) return <Text type="secondary">-</Text>;
        // Memisahkan string "Mapel A, Mapel B" menjadi array dan me-render Tag
        const mapelList = text.split(', ');
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {mapelList.map((mapel) => (
              <Tag 
                key={mapel} 
                color={getTagColor(mapel)} 
                style={{ marginRight: 0 }}
              >
                {mapel}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Jumlah Siswa',
      dataIndex: 'jumlah_siswa',
      key: 'jumlah_siswa',
      align: 'center' as const,
      width: 120,
      render: (count: number) => <Text>{count}</Text>,
    },
    {
      title: 'Wali Kelas',
      dataIndex: 'nama_wali_kelas',
      key: 'nama_wali_kelas',
      width: 200,
      render: (text: string) => (
        <Text type={text ? undefined : "secondary"}>{text || 'Belum ditentukan'}</Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card bodyStyle={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Kelas yang Saya Ajar</Title>
        <Text type="secondary">Daftar kelas dan mata pelajaran yang Anda ampu pada tahun ajaran aktif.</Text>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={myClasses} 
        rowKey="id"
        pagination={false} 
        size="small" // Membuat tabel lebih pendek/minimalis
        bordered
      />
    </Card>
  );
};

export default KelasSayaPage;