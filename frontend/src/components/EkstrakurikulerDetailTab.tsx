// file: frontend/src/components/EkstrakurikulerDetailTab.tsx
import { useState, useEffect } from 'react';
import { Form, Select, Button, message, Spin, Typography, Space, Descriptions, Alert } from 'antd';
import { getTeachers } from '../api/teachers';
import { updateSesiDetail } from '../api/ekstrakurikuler';
import type { Teacher, EkstrakurikulerSesi, UpdateSesiDetailInput } from '../types';

const { Text } = Typography;

interface DetailTabProps {
  sesi: EkstrakurikulerSesi;
  onSesiUpdate: () => void;
}

const EkstrakurikulerDetailTab = ({ sesi, onSesiUpdate }: DetailTabProps) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        setTeachers(await getTeachers());
      } catch (error) {
        message.error('Gagal memuat daftar guru.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ pembina_id: sesi?.pembina_id });
  }, [sesi, form]);

  const handleFinish = async (values: UpdateSesiDetailInput) => {
    setIsSubmitting(true);
    try {
      const payload = { pembina_id: values.pembina_id || null };
      await updateSesiDetail(sesi.id, payload);
      message.success('Detail pembina berhasil diperbarui!');
      onSesiUpdate();
      setIsEditing(false);
    } catch (err) {
      message.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}><Spin /></div>;
  }
  
  const currentPembina = teachers.find(t => t.id === sesi.pembina_id);

  if (isEditing) {
    return (
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ paddingTop: '16px' }}>
        <Form.Item name="pembina_id" label="Guru Pembina">
          <Select
            placeholder="Pilih atau hapus pembina"
            allowClear
            showSearch
            optionFilterProp="label"
            options={teachers.map(t => ({ value: t.id, label: t.nama_lengkap }))}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
            <Button onClick={() => setIsEditing(false)}>Batal</Button>
          </Space>
        </Form.Item>
      </Form>
    );
  }

  return (
    <Descriptions 
      bordered 
      column={1}
      title="Informasi Pembina"
      extra={
        <Button type="link" onClick={() => setIsEditing(true)}>
          {currentPembina ? 'Ubah' : 'Tugaskan Pembina'}
        </Button>
      }
    >
      <Descriptions.Item label="Nama Pembina">
        {currentPembina ? (
          <Text strong>{currentPembina.nama_lengkap}</Text>
        ) : (
          <Text type="secondary">Belum ada pembina yang ditugaskan.</Text>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        {currentPembina ? (
          <Alert message="Aktif" type="success" showIcon style={{ padding: '0px 12px' }}/>
        ) : (
            <Alert message="Tidak Aktif" type="warning" showIcon style={{ padding: '0px 12px' }}/>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default EkstrakurikulerDetailTab;