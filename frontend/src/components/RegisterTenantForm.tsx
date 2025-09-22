// file: frontend/src/components/RegisterTenantForm.tsx
import { useState, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { getAllNaungan } from '../api/naungan';
import type { Naungan } from '../types';
import type { RegisterTenantInput } from '../api/tenants';

const { Option } = Select;

interface RegisterTenantFormProps {
  onFinish: (values: RegisterTenantInput) => void;
  onCancel: () => void;
  loading: boolean;
}

const RegisterTenantForm = ({ onFinish, onCancel, loading }: RegisterTenantFormProps) => {
  const [naunganList, setNaunganList] = useState<Naungan[]>([]);
  const [naunganLoading, setNaunganLoading] = useState(true);

  useEffect(() => {
    const fetchNaunganList = async () => {
      try {
        const data = await getAllNaungan();
        setNaunganList(data);
      } catch (error) {
        console.error("Gagal memuat data naungan:", error);
      } finally {
        setNaunganLoading(false);
      }
    };
    fetchNaunganList();
  }, []);

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="naungan_id" label="Naungan (Opsional)">
        <Select
          placeholder="Pilih naungan jika sekolah berada di bawah naungan"
          loading={naunganLoading}
          allowClear
        >
          {naunganList.map(n => (
            <Option key={n.id} value={n.id}>{n.nama_naungan}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="nama_sekolah"
        label="Nama Sekolah"
        rules={[{ required: true, message: 'Nama sekolah tidak boleh kosong' }]}
      >
        <Input placeholder="Contoh: SMA Negeri 1 Jakarta" />
      </Form.Item>

      <Form.Item
        name="schema_name"
        label="ID Unik Sekolah (Schema Name)"
        rules={[
          { required: true, message: 'ID Unik tidak boleh kosong' },
          {
            pattern: /^[a-z0-9_]+$/,
            message: 'Hanya boleh huruf kecil, angka, dan underscore (_)',
          },
        ]}
      >
        <Input placeholder="Contoh: sman1jkt" />
      </Form.Item>

      <Form.Item
        name="admin_name"
        label="Nama Lengkap Admin Pertama"
        rules={[{ required: true, message: 'Nama admin tidak boleh kosong' }]}
      >
        <Input placeholder="Nama admin untuk sekolah ini" />
      </Form.Item>

      <Form.Item
        name="admin_email"
        label="Email Admin Pertama"
        rules={[
          { required: true, message: 'Email admin tidak boleh kosong' },
          { type: 'email', message: 'Format email tidak valid' },
        ]}
      >
        <Input placeholder="Email untuk login admin sekolah" />
      </Form.Item>

      <Form.Item
        name="admin_pass"
        label="Password Admin Pertama"
        rules={[
          { required: true, message: 'Password tidak boleh kosong' },
          { min: 8, message: 'Password minimal 8 karakter' },
        ]}
      >
        <Input.Password placeholder="Password untuk login admin sekolah" />
      </Form.Item>

      <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Batal
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Daftarkan Sekolah
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterTenantForm;