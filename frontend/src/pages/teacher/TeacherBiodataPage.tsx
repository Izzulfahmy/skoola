// file: src/pages/teacher/TeacherBiodataPage.tsx
import { useEffect, useState } from 'react';
import { Spin, Typography, Card, Tabs, Descriptions, Tag, Alert, Avatar, Row, Col, Divider, Space } from 'antd';
import { UserOutlined, ContactsOutlined, IdcardOutlined, ManOutlined, WomanOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { getMyDetails } from '../../api/teachers';
import type { Teacher } from '../../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const { Title, Text } = Typography;

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
        setError('Gagal memuat data biodata.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherInfo();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>;
  if (error) return <Alert message={error} type="error" showIcon />;

  // Styling custom untuk tampilan yang lebih rapat (compact) dan rapi
  const labelStyle: React.CSSProperties = { color: '#8c8c8c', fontSize: '13px', paddingBottom: '2px' };
  const contentStyle: React.CSSProperties = { fontWeight: 500, color: '#262626', fontSize: '14px' };
  const cardStyle: React.CSSProperties = { borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)', overflow: 'hidden' };
  
  // Mengurangi margin bawah tab agar tidak terlalu jauh dengan konten
  const tabBarStyle: React.CSSProperties = { marginBottom: 16, borderBottom: '1px solid #f0f0f0' };

  // Helper function untuk merender item agar kode lebih bersih
  const renderItem = (label: string, value: React.ReactNode, span = 1) => (
    <Descriptions.Item label={label} span={span} labelStyle={labelStyle} contentStyle={contentStyle}>
      {value || '-'}
    </Descriptions.Item>
  );

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <Space><UserOutlined />Pribadi</Space>,
      children: (
        <Descriptions column={{ xs: 1, sm: 1, md: 2, lg: 3 }} size="small" layout="vertical" colon={false}>
          {renderItem("Nama Lengkap", teacherData?.nama_lengkap)}
          {renderItem("Nama Panggilan", teacherData?.nama_panggilan)}
          {renderItem("Gelar Akademik", teacherData?.gelar_akademik)}
          {renderItem("Jenis Kelamin", 
            teacherData?.jenis_kelamin === 'Laki-laki' ? <Space><ManOutlined style={{color:'#1890ff'}}/> Laki-laki</Space> :
            teacherData?.jenis_kelamin === 'Perempuan' ? <Space><WomanOutlined style={{color:'#eb2f96'}}/> Perempuan</Space> : '-'
          )}
          {renderItem("Tempat Lahir", teacherData?.tempat_lahir)}
          {renderItem("Tanggal Lahir", formatDate(teacherData?.tanggal_lahir))}
          {renderItem("Agama", teacherData?.agama)}
          {renderItem("Kewarganegaraan", teacherData?.kewarganegaraan)}
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: <Space><ContactsOutlined />Kontak & Alamat</Space>,
      children: (
        <Row gutter={[32, 24]}>
            {/* Kolom Kiri: Kontak */}
            <Col xs={24} md={9}>
                <Divider orientation="left" style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#bfbfbf' }}>
                    <ContactsOutlined /> Kontak
                </Divider>
                <Descriptions column={1} size="small" layout="vertical" colon={false}>
                    <Descriptions.Item label={<Space><MailOutlined /> Email</Space>} labelStyle={labelStyle} contentStyle={contentStyle}>
                        {teacherData?.email || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space><PhoneOutlined /> No HP</Space>} labelStyle={labelStyle} contentStyle={contentStyle}>
                        {teacherData?.no_hp || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Col>
            
            {/* Kolom Kanan: Alamat (Lebih lebar agar rapi) */}
            <Col xs={24} md={15}>
                <Divider orientation="left" style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#bfbfbf' }}>
                    <EnvironmentOutlined /> Domisili
                </Divider>
                <Descriptions column={2} size="small" layout="vertical" colon={false}>
                    {renderItem("Alamat Lengkap", teacherData?.alamat_lengkap, 2)}
                    {renderItem("Desa/Kelurahan", teacherData?.desa_kelurahan)}
                    {renderItem("Kecamatan", teacherData?.kecamatan)}
                    {renderItem("Kota/Kabupaten", teacherData?.kota_kabupaten)}
                    {renderItem("Provinsi", teacherData?.provinsi)}
                    {renderItem("Kode Pos", teacherData?.kode_pos)}
                </Descriptions>
            </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: <Space><IdcardOutlined />Kepegawaian</Space>,
      children: (
        <Descriptions column={{ xs: 1, sm: 2 }} size="small" layout="vertical" colon={false}>
          {renderItem("NIP / NUPTK", <Text copyable>{teacherData?.nip_nuptk}</Text>)}
          {renderItem("Status", teacherData?.status_saat_ini && <Tag color="blue" style={{margin:0}}>{teacherData.status_saat_ini}</Tag>)}
          {renderItem("Lama Mengajar", teacherData?.lama_mengajar)}
        </Descriptions>
      ),
    },
  ];

  return (
    // Mengurangi padding default Card agar tidak terlalu boros tempat
    <Card bordered={false} bodyStyle={{ padding: '20px 24px' }} style={cardStyle}>
      
      {/* Header Profile yang lebih compact */}
      <Row align="middle" gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <Avatar 
            size={64} 
            shape="square"
            style={{ backgroundColor: '#f56a00', verticalAlign: 'middle', fontSize: 24, borderRadius: 12 }}
          >
            {teacherData?.nama_lengkap?.charAt(0).toUpperCase()}
          </Avatar>
        </Col>
        <Col flex="auto">
          <Title level={4} style={{ margin: 0, marginBottom: 4, fontWeight: 700 }}>
            {teacherData?.nama_lengkap || 'Guru'}
          </Title>
          <Space size="small" style={{ color: '#8c8c8c', fontSize: '13px' }}>
            <IdcardOutlined /> <span>{teacherData?.nip_nuptk || 'Belum ada NIP'}</span>
            <Divider type="vertical" style={{ borderColor: '#d9d9d9' }} />
            <span>{teacherData?.gelar_akademik || 'Tenaga Pengajar'}</span>
          </Space>
        </Col>
      </Row>

      {/* Tabs Menu */}
      <Tabs 
        defaultActiveKey="1" 
        items={items} 
        tabBarStyle={tabBarStyle}
        size="small" // Membuat tab header sedikit lebih kecil
      />
    </Card>
  );
};

export default TeacherBiodataPage;