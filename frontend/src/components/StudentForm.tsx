// file: src/components/StudentForm.tsx
import { Form, Input, Button } from 'antd';
import type { CreateStudentInput, Student } from '../types';

interface StudentFormProps {
  onFinish: (values: CreateStudentInput) => void;
  onCancel: () => void;
  initialValues?: Student;
  loading: boolean;
}

const StudentForm = ({ onFinish, onCancel, initialValues, loading }: StudentFormProps) => {
  return (
    <Form
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
      <Form.Item name="nis" label="NIS (Nomor Induk Siswa)">
        <Input />
      </Form.Item>
      <Form.Item name="nisn" label="NISN (Nomor Induk Siswa Nasional)">
        <Input />
      </Form.Item>
      <Form.Item name="alamat" label="Alamat">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="nama_wali" label="Nama Wali">
        <Input />
      </Form.Item>
      <Form.Item name="nomor_telepon_wali" label="Nomor Telepon Wali">
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

export default StudentForm;