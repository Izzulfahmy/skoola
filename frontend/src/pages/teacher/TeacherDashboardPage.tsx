// file: src/pages/teacher/TeacherDashboardPage.tsx
import { useEffect, useState } from 'react';
import { Spin, Typography, message, Card } from 'antd';
import { getMyDetails } from '../../api/teachers';
import type { Teacher } from '../../types';

const { Title, Text } = Typography;

const TeacherDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const data = await getMyDetails();
        setTeacherData(data);
      } catch (error) {
        message.error('Gagal memuat data guru. Silakan login kembali.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherInfo();
  }, []);

  const getGreeting = () => {
    if (!teacherData) return '';

    const { nama_lengkap, jenis_kelamin, gelar_akademik } = teacherData;
    let salutation = '';

    if (jenis_kelamin === 'Laki-laki') {
      salutation = 'Bapak ';
    } else if (jenis_kelamin === 'Perempuan') {
      salutation = 'Ibu ';
    }

    const nameWithTitle = gelar_akademik ? `${nama_lengkap}, ${gelar_akademik}` : nama_lengkap;

    return `Selamat Datang ${salutation}${nameWithTitle}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={2}>{getGreeting()}</Title>
      <Text type="secondary">Anda telah masuk ke Panel Guru Skoola.</Text>
    </Card>
  );
};

export default TeacherDashboardPage;