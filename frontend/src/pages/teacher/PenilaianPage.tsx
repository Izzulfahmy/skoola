// file: src/pages/teacher/PenilaianPage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Typography, Select, Empty, Alert } from 'antd';
import { getMyClasses } from '../../api/teachers';
import { getAllPengajarByKelas } from '../../api/rombel';
import type { Kelas, PengajarKelas } from '../../types';
import PenilaianPanel from '../../components/PenilaianPanel';

const { Title, Text } = Typography;
const { Option } = Select;

const PenilaianPage = () => {
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [pengajarList, setPengajarList] = useState<PengajarKelas[]>([]);
  const [selectedPengajarId, setSelectedPengajarId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const classesData = await getMyClasses();
        setMyClasses(classesData || []);
      } catch (err) {
        setError('Gagal memuat daftar kelas Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelasId) {
      const fetchPengajar = async () => {
        setLoading(true);
        setSelectedPengajarId(null);
        try {
          const pengajarData = await getAllPengajarByKelas(selectedKelasId);
          setPengajarList(pengajarData || []);
        } catch (err) {
          setError('Gagal memuat daftar mata pelajaran di kelas ini.');
        } finally {
          setLoading(false);
        }
      };
      fetchPengajar();
    } else {
      setPengajarList([]);
    }
  }, [selectedKelasId]);

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={2}>Penilaian Siswa</Title>
      <Text type="secondary">Pilih kelas dan mata pelajaran untuk mengelola penilaian siswa.</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Typography.Paragraph strong>1. Pilih Kelas</Typography.Paragraph>
          <Select
            style={{ width: '100%' }}
            placeholder="Pilih kelas yang Anda ajar"
            onChange={(value) => setSelectedKelasId(value)}
            loading={loading}
          >
            {myClasses.map(kelas => (
              <Option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</Option>
            ))}
          </Select>
          
          <Typography.Paragraph strong style={{ marginTop: 16 }}>2. Pilih Mata Pelajaran</Typography.Paragraph>
          <Select
            style={{ width: '100%' }}
            placeholder="Pilih mata pelajaran"
            onChange={(value) => setSelectedPengajarId(value)}
            disabled={!selectedKelasId || pengajarList.length === 0}
            value={selectedPengajarId}
          >
            {pengajarList.map(p => (
              <Option key={p.id} value={p.id}>{p.nama_mapel}</Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={24} md={16}>
          <Card>
            {loading ? <Spin /> :
             selectedPengajarId && selectedKelasId ? (
              <PenilaianPanel 
                key={selectedPengajarId} 
                pengajarKelasId={selectedPengajarId} 
                kelasId={selectedKelasId}
              />
            ) : (
              <Empty description="Pilih kelas dan mata pelajaran untuk memulai." style={{ paddingTop: 60, paddingBottom: 60 }} />
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default PenilaianPage;