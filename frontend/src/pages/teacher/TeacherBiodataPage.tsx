// file: src/pages/teacher/TeacherBiodataPage.tsx
import { useEffect, useState } from 'react';
import { Spin, Typography, message, Card, Tabs, Descriptions, Tag, Alert } from 'antd';
import type { TabsProps } from 'antd';
import { getMyDetails } from '../../api/teachers';
import type { Teacher } from '../../types';
import { format } from 'date-fns';

const { Title } = Typography;

const TeacherBiodataPage = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const data = await getMyDetails();
        setTeacherData(data);
      } catch (err) {
        setError('Gagal memuat data biodata. Silakan coba lagi nanti.');
        message.error('Gagal memuat data biodata.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="Memuat biodata..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Biodata Diri',
      children: (
        <Descriptions bordered column={1} layout="horizontal">
          <Descriptions.Item label="Nama Lengkap">{teacherData?.nama_lengkap || '-'}</Descriptions.Item>
          <Descriptions.Item label="Nama Panggilan">{teacherData?.nama_panggilan || '-'}</Descriptions.Item>
          <Descriptions.Item label="Gelar Akademik">{teacherData?.gelar_akademik || '-'}</Descriptions.Item>
          <Descriptions.Item label="Jenis Kelamin">{teacherData?.jenis_kelamin || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tempat, Tanggal Lahir">
            {`${teacherData?.tempat_lahir || ''}${teacherData?.tanggal_lahir ? `, ${format(new Date(teacherData.tanggal_lahir), 'dd MMMM yyyy')}` : ''}` || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Agama">{teacherData?.agama || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kewarganegaraan">{teacherData?.kewarganegaraan || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: 'Alamat & Kontak',
      children: (
        <Descriptions bordered column={1} layout="horizontal">
          <Descriptions.Item label="Email">{teacherData?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Nomor HP">{teacherData?.no_hp || '-'}</Descriptions.Item>
          <Descriptions.Item label="Alamat Lengkap">{teacherData?.alamat_lengkap || '-'}</Descriptions.Item>
          <Descriptions.Item label="Desa/Kelurahan">{teacherData?.desa_kelurahan || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kecamatan">{teacherData?.kecamatan || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kota/Kabupaten">{teacherData?.kota_kabupaten || '-'}</Descriptions.Item>
          <Descriptions.Item label="Provinsi">{teacherData?.provinsi || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kode Pos">{teacherData?.kode_pos || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '3',
      label: 'Kepegawaian',
      children: (
         <Descriptions bordered column={1} layout="horizontal">
          <Descriptions.Item label="NIP / NUPTK">{teacherData?.nip_nuptk || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status Saat Ini">
            {teacherData?.status_saat_ini ? <Tag color="success">{teacherData.status_saat_ini}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Lama Mengajar">{teacherData?.lama_mengajar || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2} style={{ marginBottom: 24 }}>Biodata Saya</Title>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </Card>
  );
};

export default TeacherBiodataPage;