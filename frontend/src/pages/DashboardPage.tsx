import { useEffect, useState } from 'react';
// 1. Impor 'Grid' dari antd
import { Card, Col, Row, Spin, Statistic, Typography, message, Space, List, Avatar, Empty, Tag, Grid } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  ArrowRightOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  SettingOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getTeachers } from '../api/teachers';
import { getStudents } from '../api/students';
import { getSchoolProfile } from '../api/profile';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllKelasByTahunAjaran } from '../api/rombel';
import { getKurikulumByTahunAjaran } from '../api/kurikulum';
import type { TahunAjaran } from '../types';

const { Title, Text } = Typography;
// 2. Deklarasikan hook useBreakpoint
const { useBreakpoint } = Grid;

const DashboardPage = () => {
  const navigate = useNavigate();
  // 3. Gunakan hook di dalam komponen
  const screens = useBreakpoint(); 

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    teacherCount: 0, 
    studentCount: 0,
    rombelCount: 0,
    kurikulumCount: 0,
  });
  const [schoolName, setSchoolName] = useState('');
  const [activeTahunAjaran, setActiveTahunAjaran] = useState<TahunAjaran | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachers, students, profile, tahunAjaranList] = await Promise.all([
          getTeachers(),
          getStudents(),
          getSchoolProfile(),
          getAllTahunAjaran(),
        ]);
        
        setStats(prev => ({
          ...prev,
          teacherCount: teachers?.length || 0,
          studentCount: students?.length || 0,
        }));
        setSchoolName(profile.nama_sekolah);
        
        const aktif = (tahunAjaranList || []).find(ta => ta.status === 'Aktif');
        setActiveTahunAjaran(aktif || null);

        if (aktif) {
          const [rombelData, kurikulumData] = await Promise.all([
            getAllKelasByTahunAjaran(aktif.id),
            getKurikulumByTahunAjaran(aktif.id),
          ]);
          setStats(prev => ({
            ...prev,
            rombelCount: rombelData?.length || 0,
            kurikulumCount: kurikulumData?.length || 0,
          }));
        }

      } catch (error)
 {
        message.error('Gagal memuat data dasbor. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      icon: <ApartmentOutlined />,
      title: 'Manajemen Rombel',
      description: 'Kelola kelas, siswa, dan guru pengajar.',
      path: '/admin/rombel'
    },
    {
      icon: <TeamOutlined />,
      title: 'Manajemen Siswa',
      description: 'Tambah, edit, atau hapus data siswa.',
      path: '/admin/students'
    },
    {
      icon: <UserOutlined />,
      title: 'Manajemen Guru',
      description: 'Kelola data guru dan riwayat kepegawaian.',
      path: '/admin/teachers'
    },
    {
      icon: <SettingOutlined />,
      title: 'Pengaturan Sekolah',
      description: 'Profil sekolah, tingkatan, jabatan, dll.',
      path: '/admin/settings'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      
      {/* 1. Header Halaman (Responsif) */}
      <Row 
        justify="space-between" 
        align="middle" 
        style={{ marginBottom: 16 }}
        gutter={[16, 16]}
      >
        <Col xs={24} md={16}>
          <Title level={2} style={{ margin: 0 }}>Selamat Datang</Title>
          <Text type="secondary">Ringkasan utama untuk {schoolName}.</Text>
        </Col>
        <Col xs={24} md={8}>
          {activeTahunAjaran ? (
            <Space 
              direction="vertical" 
              // 4. TERAPKAN PERBAIKAN DI SINI
              // Jika layar 'md' (medium) atau lebih besar, align 'end' (kanan)
              // Jika tidak (layar 'xs' atau 'sm'), align 'start' (kiri)
              align={screens.md ? 'end' : 'start'}
              size={0} 
              style={{ width: '100%' }}
            >
              <Text strong>Tahun Ajaran Aktif</Text>
              <Tag icon={<CalendarOutlined />} color="success">
                {activeTahunAjaran.nama_tahun_ajaran} - {activeTahunAjaran.semester}
              </Tag>
            </Space>
          ) : (
             // Pastikan tag ini juga rata kiri di mobile
            <div style={{ textAlign: screens.md ? 'right' : 'left' }}>
              <Tag color="error">Tahun Ajaran Belum Diatur</Tag>
            </div>
          )}
        </Col>
      </Row>

      {/* 2. Baris Statistik KPI */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Guru"
              value={stats.teacherCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Siswa"
              value={stats.studentCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Jumlah Rombel"
              value={stats.rombelCount}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#d46b08' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Kurikulum Aktif"
              value={stats.kurikulumCount}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row> 

      {/* 3. Baris Konten (Akses Cepat & Aktivitas) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
           <Card title="Akses Cepat" style={{ height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={quickActions}
              renderItem={(item) => (
                <List.Item
                  onClick={() => navigate(item.path)}
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  actions={[<ArrowRightOutlined />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size="large" icon={item.icon} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />}
                    title={<Text strong>{item.title}</Text>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
           </Card>
        </Col>
        <Col xs={24} lg={12}>
            <Card title="Aktivitas Terbaru" style={{ height: '100%' }}>
                <Empty description="Fitur aktivitas terbaru akan segera hadir." />
            </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default DashboardPage;