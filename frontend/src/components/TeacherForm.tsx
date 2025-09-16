// file: src/components/TeacherForm.tsx
import { Form, Input, Button } from 'antd';
import type { CreateTeacherInput, Teacher } from '../types';

interface TeacherFormProps {
  onFinish: (values: CreateTeacherInput) => void;
  onCancel: () => void;
  initialValues?: Teacher;
  loading: boolean;
}

const TeacherForm = ({ onFinish, onCancel, initialValues, loading }: TeacherFormProps) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="nama_lengkap"
        label="Nama Lengkap"
        rules={[{ required: true, message: 'Nama lengkap tidak boleh kosong' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: 'Email tidak boleh kosong', type: 'email' }]}
      >
        <Input />
      </Form.Item>
      {!initialValues && ( // Hanya tampilkan field password saat membuat guru baru
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password tidak boleh kosong', min: 8 }]}
        >
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item name="nip" label="NIP">
        <Input />
      </Form.Item>
      <Form.Item name="alamat" label="Alamat">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="nomor_telepon" label="Nomor Telepon">
        <Input />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Batal
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Simpan
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TeacherForm;