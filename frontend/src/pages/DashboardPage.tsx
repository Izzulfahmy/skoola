// file: src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Statistic, Typography, Button, message, Space } from 'antd';
import { UserOutlined, TeamOutlined, BankOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getTeachers } from '../api/teachers';
import { getStudents } from '../api/students';
import { getSchoolProfile } from '../api/profile';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ teacherCount: 0, studentCount: 0 });
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data secara bersamaan untuk efisiensi
        const [teachers, students, profile] = await Promise.all([
          getTeachers(),
          getStudents(),
          getSchoolProfile(),
        ]);
        
        setStats({
          teacherCount: teachers.length,
          studentCount: students.length,
        });
        setSchoolName(profile.nama_sekolah);

      } catch (error) {
        message.error('Gagal memuat data dasbor. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* --- Bagian Header Sambutan --- */}
      <div>
        <Title level={2}>Selamat Datang di Dasbor</Title>
        <Text type="secondary">Ini adalah ringkasan untuk {schoolName}.</Text>
      </div>

      {/* --- Bagian Kartu Statistik --- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Guru"
              value={stats.teacherCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Siswa"
              value={stats.studentCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        {/* Anda bisa menambahkan kartu statistik lain di sini di masa depan */}
      </Row>

      {/* --- Bagian Kartu Aksi Cepat --- */}
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>Aksi Cepat</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}><BankOutlined /> Kelola Profil Sekolah</Title>
                <Text type="secondary">Perbarui informasi detail sekolah Anda.</Text>
                <Button type="primary" onClick={() => navigate('/profile')} style={{ marginTop: 8 }}>
                  Buka Halaman <ArrowRightOutlined />
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}><UserOutlined /> Kelola Data Guru</Title>
                <Text type="secondary">Tambah, edit, atau hapus data guru.</Text>
                <Button type="primary" onClick={() => navigate('/teachers')} style={{ marginTop: 8 }}>
                  Buka Halaman <ArrowRightOutlined />
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}><TeamOutlined /> Kelola Data Siswa</Title>
                <Text type="secondary">Tambah, edit, atau hapus data siswa.</Text>
                <Button type="primary" onClick={() => navigate('/students')} style={{ marginTop: 8 }}>
                  Buka Halaman <ArrowRightOutlined />
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </Space>
  );
};

export default DashboardPage;