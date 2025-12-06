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
      width: 60,
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
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.nama_tingkatan}</Text>
        </Space>
      ),
    },
    {
      title: 'Mata Pelajaran',
      dataIndex: 'mata_pelajaran',
      key: 'mata_pelajaran',
      render: (text: string) => {
        if (!text) return <Text type="secondary" style={{ fontSize: '13px' }}>-</Text>;
        const mapelList = text.split(', ');
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {mapelList.map((mapel) => (
              <Tag 
                key={mapel} 
                color={getTagColor(mapel)} 
                style={{ marginRight: 0, borderRadius: '4px', fontSize: '12px' }}
                bordered={false} // Membuat tag terlihat lebih modern/flat
              >
                {mapel}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Siswa',
      dataIndex: 'jumlah_siswa',
      key: 'jumlah_siswa',
      align: 'center' as const,
      width: 100,
      render: (count: number) => <Text style={{ fontSize: '13px' }}>{count}</Text>,
    },
    {
      title: 'Wali Kelas',
      dataIndex: 'nama_wali_kelas',
      key: 'nama_wali_kelas',
      width: 220,
      render: (text: string) => (
        <Text style={{ fontSize: '13px' }} type={text ? undefined : "secondary"}>{text || 'Belum ditentukan'}</Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    // Style Card disesuaikan dengan halaman lain (Padding 20px 24px)
    <Card 
      bodyStyle={{ padding: '20px 24px' }} 
      bordered={false} 
      style={{ borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}
    >
      {/* Header Compact */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 0, marginTop: 0 }}>Kelas yang Saya Ajar</Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>Daftar kelas dan mata pelajaran yang Anda ampu pada tahun ajaran aktif.</Text>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={myClasses} 
        rowKey="id"
        pagination={false} 
        size="small" // Tabel minimalis (baris pendek)
        bordered
      />
    </Card>
  );
};

export default KelasSayaPage;