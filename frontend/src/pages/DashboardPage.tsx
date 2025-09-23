// file: src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Statistic, Typography, Button, message, Space, List, Avatar, Empty, Divider } from 'antd';
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

const DashboardPage = () => {
  const navigate = useNavigate();
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
          teacherCount: teachers ? teachers.length : 0,
          studentCount: students ? students.length : 0,
        }));
        setSchoolName(profile.nama_sekolah);
        
        const aktif = tahunAjaranList.find(ta => ta.status === 'Aktif');
        setActiveTahunAjaran(aktif || null);

        if (aktif) {
          const [rombelData, kurikulumData] = await Promise.all([
            getAllKelasByTahunAjaran(aktif.id),
            getKurikulumByTahunAjaran(aktif.id),
          ]);
          setStats(prev => ({
            ...prev,
            rombelCount: rombelData.length,
            kurikulumCount: kurikulumData.length,
          }));
        }

      } catch (error) {
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
      path: '/rombel'
    },
    {
      icon: <TeamOutlined />,
      title: 'Manajemen Siswa',
      description: 'Tambah, edit, atau hapus data siswa.',
      path: '/students'
    },
    {
      icon: <UserOutlined />,
      title: 'Manajemen Guru',
      description: 'Kelola data guru dan riwayat kepegawaian.',
      path: '/teachers'
    },
    {
      icon: <SettingOutlined />,
      title: 'Pengaturan Sekolah',
      description: 'Profil sekolah, tingkatan, jabatan, dll.',
      path: '/settings'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2}>Selamat Datang di Dasbor</Title>
        <Text type="secondary">Ini adalah ringkasan untuk {schoolName}.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
            <Card title="Statistik Utama">
                <Row>
                    <Col xs={12} sm={12}>
                        <Statistic
                          title="Total Guru"
                          value={stats.teacherCount}
                          prefix={<UserOutlined />}
                        />
                    </Col>
                    <Col xs={12} sm={12}>
                        <Statistic
                          title="Total Siswa"
                          value={stats.studentCount}
                          prefix={<TeamOutlined />}
                        />
                    </Col>
                </Row>
            </Card>
        </Col>

        <Col xs={24} lg={12}>
            <Card title="Tahun Ajaran Aktif">
                <Statistic
                  value={activeTahunAjaran ? `${activeTahunAjaran.nama_tahun_ajaran} - ${activeTahunAjaran.semester}` : 'Tidak Ada'}
                  prefix={<CalendarOutlined />}
                  valueStyle={{marginBottom: 16}}
                />
                <Divider style={{margin: '12px 0'}}/>
                <Row>
                    <Col span={12}>
                        <Statistic
                          title="Jumlah Rombel"
                          value={stats.rombelCount}
                          prefix={<ApartmentOutlined />}
                        />
                    </Col>
                     <Col span={12}>
                        <Statistic
                          title="Kurikulum"
                          value={stats.kurikulumCount}
                          prefix={<ReadOutlined />}
                        />
                    </Col>
                </Row>
            </Card>
        </Col>
      </Row>

      {/* --- BAGIAN AKSES CEPAT YANG DIPERBARUI --- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
           <Card title="Akses Cepat">
            <List
              itemLayout="horizontal"
              dataSource={quickActions}
              renderItem={(item) => (
                <List.Item
                  actions={[<Button type="text" shape="circle" icon={<ArrowRightOutlined />} onClick={() => navigate(item.path)} />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size="large" icon={item.icon} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />}
                    title={<a onClick={() => navigate(item.path)}>{item.title}</a>}
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