// file: frontend/src/pages/SchoolProfilePage.tsx
import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Spin, Typography, Row, Col, Card } from 'antd';
import { getSchoolProfile, updateSchoolProfile } from '../api/profile';
import type { SchoolProfile } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const SchoolProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<SchoolProfile | null>(null);

  // Fungsi untuk mengambil data profil dari server
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getSchoolProfile();
      setInitialData(profileData);
      form.setFieldsValue(profileData); // Set nilai form setelah data diterima
    } catch (error) {
      message.error('Gagal memuat data profil sekolah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fungsi yang dijalankan saat form disubmit
  const onFinish = async (values: SchoolProfile) => {
    setSubmitting(true);
    try {
      // Pastikan ID tetap ada, karena backend mungkin membutuhkannya
      const dataToSubmit = { ...initialData, ...values };
      await updateSchoolProfile(dataToSubmit);
      message.success('Profil sekolah berhasil diperbarui!');
    } catch (error) {
      message.error('Gagal memperbarui profil sekolah.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin tip="Memuat data profil..." size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }} />;
  }

  return (
    <Card>
      <Title level={2} style={{ marginBottom: '24px' }}>Profil Sekolah</Title>
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