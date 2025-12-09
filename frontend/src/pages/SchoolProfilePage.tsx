// file: frontend/src/pages/SchoolProfilePage.tsx
import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Spin, Typography, Row, Col, Card, notification } from 'antd';
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons';
import { getSchoolProfile, updateSchoolProfile } from '../api/profile';
import type { SchoolProfile } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

// --- KOMPONEN NOTIFIKASI MINIMALIS ---
const CompactNotification = ({ onClose }: { onClose: () => void }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 3000; // 3 detik
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const decrement = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div style={{ padding: '12px 16px' }}> 
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        
        {/* Sisi Kiri: Ikon + Teks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: '18px' }} />
          <span style={{ fontWeight: 600, fontSize: '13px', color: '#262626' }}>
            Perubahan Disimpan
          </span>
        </div>

        {/* Sisi Kanan: Tombol Tutup Custom */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{ 
            cursor: 'pointer',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            color: '#bfbfbf',
            transition: 'all 0.2s',
            zIndex: 10 // Pastikan berada di atas layer lain
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = '#595959';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#bfbfbf';
          }}
        >
          <CloseOutlined style={{ fontSize: '10px' }} />
        </div>
      </div>
      
      {/* Progress Bar Menyatu */}
      <div style={{ height: '3px', background: '#f0f0f0', borderRadius: '1.5px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: '#52c41a', 
          width: `${progress}%`, 
          transition: 'width 0.03s linear' 
        }} />
      </div>
    </div>
  );
};

const SchoolProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<SchoolProfile | null>(null);

  // Hook notifikasi
  const [api, contextHolder] = notification.useNotification();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getSchoolProfile();
      setInitialData(profileData);
      form.setFieldsValue(profileData);
    } catch (error) {
      message.error('Gagal memuat data profil sekolah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onFinish = async (values: SchoolProfile) => {
    setSubmitting(true);
    try {
      const dataToSubmit = { ...initialData, ...values };
      await updateSchoolProfile(dataToSubmit);
      
      // --- NOTIFIKASI POJOK KANAN ATAS (FINAL FIX) ---
      const key = `notif-${Date.now()}`;
      
      api.open({
        key,
        message: <CompactNotification onClose={() => api.destroy(key)} />,
        description: null,
        duration: 0,
        closable: false, // [PENTING] Ini menghilangkan tombol tutup bawaan sepenuhnya
        placement: 'topRight',
        style: {
          width: '280px',
          padding: 0,
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: 'none',
          overflow: 'hidden'
        },
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil sekolah.';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin tip="Memuat data profil..." size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }} />;
  }

  return (
    <Card>
      {/* Context Holder untuk menampilkan notifikasi */}
      {contextHolder}
      
      <Title level={3} style={{ marginBottom: '24px' }}>Profil Sekolah</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialData || {}}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="nama_sekolah" label="Nama Sekolah" rules={[{ required: true, message: 'Nama sekolah tidak boleh kosong' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="npsn" label="NPSN">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="kepala_sekolah" label="Nama Kepala Sekolah">
              <Input />
            </Form.Item>
          </Col>
           <Col xs={24} md={12}>
            <Form.Item name="naungan" label="Naungan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="alamat" label="Alamat Sekolah">
              <TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="kelurahan" label="Kelurahan / Desa">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="kecamatan" label="Kecamatan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="kota_kabupaten" label="Kota / Kabupaten">
              <Input />
            </Form.Item>
          </Col>
           <Col xs={24} md={12} lg={8}>
            <Form.Item name="provinsi" label="Provinsi">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="kode_pos" label="Kode Pos">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="telepon" label="Nomor Telepon">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="email" label="Email Sekolah">
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="website" label="Website Sekolah">
              <Input addonBefore="https://" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Simpan Perubahan
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SchoolProfilePage;