// file: src/pages/teacher/KelasSayaPage.tsx
import { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, List, Tag, Empty, Alert } from 'antd';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getMyClasses } from '../../api/teachers';
import type { Kelas } from '../../types';
import { Link } from 'react-router-dom';

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
    <Card>
      <Title level={2}>Kelas yang Saya Ajar</Title>
      <Text type="secondary">Berikut adalah daftar kelas yang Anda ajar pada tahun ajaran aktif.</Text>
      
      {myClasses.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={myClasses}
          renderItem={(kelas) => (
            <List.Item>
              <Card 
                hoverable
                title={kelas.nama_kelas}
                actions={[<Link to={`/rombel/${kelas.id}`}>Lihat Detail <ArrowRightOutlined /></Link>]}
              >
                <p><Tag color="geekblue">{kelas.nama_tingkatan}</Tag></p>
                <p><UserOutlined style={{ marginRight: 8 }}/> {kelas.jumlah_siswa} Siswa</p>
                <Text type="secondary">Wali: {kelas.nama_wali_kelas || '-'}</Text>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Anda belum ditugaskan untuk mengajar di kelas manapun pada tahun ajaran aktif." style={{marginTop: 32}}/>
      )}
    </Card>
  );
};

export default KelasSayaPage;