// file: src/pages/teacher/MateriAjarPage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Typography, Select, Empty, Alert } from 'antd';
import { getMyClasses } from '../../api/teachers';
import { getAllPengajarByKelas } from '../../api/rombel';
import type { Kelas, PengajarKelas } from '../../types';
import MateriPembelajaranPanel from '../../components/MateriPembelajaranPanel';
import { BookOutlined, ApartmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const MateriAjarPage = () => {
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

  // Styling helpers yang lebih compact
  const labelStyle: React.CSSProperties = { 
    fontSize: '12px', 
    color: '#8c8c8c', 
    marginBottom: 4, 
    display: 'block', 
    fontWeight: 500 
  };
  
  const sidebarStyle: React.CSSProperties = { 
    background: '#fafafa', 
    padding: '16px', // Padding dikurangi dari 20px
    borderRadius: '8px', 
    border: '1px solid #f0f0f0', 
    height: 'fit-content' // Tinggi menyesuaikan konten
  };
  
  const contentAreaStyle: React.CSSProperties = { 
    minHeight: 500, 
    borderRadius: '8px', 
    paddingLeft: '8px' 
  };

  return (
    // Padding Card dikurangi dari 24px menjadi 20px agar header lebih naik
    <Card bodyStyle={{ padding: '20px 24px' }} bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}>
      
      {/* Header Compact: Margin bawah dikurangi */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 0, marginTop: 0 }}>Materi Ajar Saya</Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>Kelola struktur materi, tujuan pembelajaran (TP), dan rencana penilaian.</Text>
      </div>
      
      <Row gutter={24}>
        {/* Sidebar: Dipersempit (md={6} lg={5}) agar konten utama lebih luas */}
        <Col xs={24} md={6} lg={5}>
          <div style={sidebarStyle}>
            <div style={{ marginBottom: 12 }}>
              <span style={labelStyle}><ApartmentOutlined /> Pilih Kelas</span>
              <Select
                style={{ width: '100%' }}
                placeholder="Pilih kelas"
                onChange={(value) => setSelectedKelasId(value)}
                loading={loading}
                size="middle" // Ukuran diperkecil dari 'large' ke 'middle'
              >
                {myClasses.map(kelas => (
                  <Option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</Option>
                ))}
              </Select>
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <span style={labelStyle}><BookOutlined /> Pilih Mata Pelajaran</span>
              <Select
                style={{ width: '100%' }}
                placeholder="Pilih mapel"
                onChange={(value) => setSelectedPengajarId(value)}
                disabled={!selectedKelasId || pengajarList.length === 0}
                value={selectedPengajarId}
                size="middle" // Ukuran diperkecil
              >
                {pengajarList.map(p => (
                  <Option key={p.id} value={p.id}>{p.nama_mapel}</Option>
                ))}
              </Select>
            </div>

            {!selectedKelasId && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 8, lineHeight: 1.3 }}>
                    Pilih kelas untuk memuat mapel.
                </Text>
            )}
          </div>
        </Col>
        
        {/* Main Content Area: Diperluas (md={18} lg={19}) */}
        <Col xs={24} md={18} lg={19}>
          <div style={contentAreaStyle}>
            {loading ? (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                 <Spin tip="Memuat data..." />
               </div>
            ) : selectedPengajarId ? (
              <>
                {/* Divider header dihapus/disederhanakan agar lebih clean */}
                <div style={{ paddingBottom: 16 }}>
                   <MateriPembelajaranPanel key={selectedPengajarId} pengajarKelasId={selectedPengajarId} />
                </div>
              </>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={<span style={{ color: '#bfbfbf' }}>Area kerja belum aktif. Silakan pilih data di menu sebelah kiri.</span>} 
                style={{ marginTop: 80 }} 
              />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default MateriAjarPage;