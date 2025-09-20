// file: frontend/src/components/AdminSettingsTab.tsx
import { useEffect, useState } from 'react';
// --- PERBAIKAN DI SINI: Menambahkan 'Space' ---
import { Form, Input, Button, Spin, Alert, message, Row, Col, Descriptions, Space } from 'antd';
import { getAdminDetails, updateTeacher } from '../api/teachers';
import type { Teacher, UpdateTeacherInput } from '../types';

const AdminSettingsTab = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminData, setAdminData] = useState<Teacher | null>(null);

  const fetchAdminDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDetails();
      setAdminData(data);
      form.setFieldsValue(data);
    } catch (err) {
      setError('Gagal memuat data admin. Pastikan Anda memiliki hak akses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const onFinish = async (values: UpdateTeacherInput) => {
    if (!adminData) return;
    setIsSubmitting(true);
    try {
        // Gabungkan data yang ada dengan data dari form
        const dataToUpdate = { ...adminData, ...values };
        await updateTeacher(adminData.id, dataToUpdate);
        message.success('Data admin berhasil diperbarui!');
        setIsEditing(false);
        fetchAdminDetails(); // Ambil data terbaru setelah update
    } catch (err: any) {
        const errorMessage = err.response?.data || 'Gagal memperbarui data admin.';
        message.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spin tip="Memuat data admin..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
        {!isEditing ? (
            <>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Nama Lengkap">{adminData?.nama_lengkap || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Email">{adminData?.email || '-'}</Descriptions.Item>
                    <Descriptions.Item label="NIP / NUPTK">{adminData?.nip_nuptk || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Nomor HP">{adminData?.no_hp || '-'}</Descriptions.Item>
                </Descriptions>
                <Button type="primary" onClick={() => setIsEditing(true)} style={{ marginTop: 16 }}>
                    Ubah Data Admin
                </Button>
            </>
        ) : (
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={adminData || {}}>
                 <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="nama_lengkap" label="Nama Lengkap" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                     <Col xs={24} sm={12}>
                        <Form.Item name="nip_nuptk" label="NIP / NUPTK">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="no_hp" label="Nomor HP">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Space>
                        <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>Batal</Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            Simpan Perubahan
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        )}
    </div>
  );
};

export default AdminSettingsTab;