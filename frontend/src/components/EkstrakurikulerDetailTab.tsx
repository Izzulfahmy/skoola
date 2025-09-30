// file: frontend/src/components/EkstrakurikulerDetailTab.tsx
import { useState, useEffect } from 'react';
import { Form, Select, Button, message, Spin } from 'antd';
import { getTeachers } from '../api/teachers';
import { updateSesiDetail } from '../api/ekstrakurikuler';
import type { Teacher, EkstrakurikulerSesi, UpdateSesiDetailInput } from '../types';

interface DetailTabProps {
  sesi: EkstrakurikulerSesi;
  onSesiUpdate: () => void;
}

const EkstrakurikulerDetailTab = ({ sesi, onSesiUpdate }: DetailTabProps) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers(); // FIX: Menggunakan getTeachers
        setTeachers(data);
      } catch (error) {
        message.error('Gagal memuat daftar guru.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      pembina_id: sesi.pembina_id
    });
  }, [sesi, form]);

  const handleFinish = async (values: UpdateSesiDetailInput) => {
    setIsSubmitting(true);
    try {
      const payload = { pembina_id: values.pembina_id || null };
      await updateSesiDetail(sesi.id, payload);
      message.success('Detail sesi berhasil diperbarui!');
      onSesiUpdate();
    } catch (err) {
      message.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="pembina_id" label="Guru Pembina">
        <Select
          placeholder="Pilih guru pembina"
          allowClear
          showSearch
          optionFilterProp="label"
          options={teachers.map(t => ({
            value: t.id,
            label: t.nama_lengkap
          }))}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Simpan Perubahan
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EkstrakurikulerDetailTab;