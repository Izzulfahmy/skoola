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
        // PERUBAHAN 1: Mengubah aturan menjadi minimal 1 karakter
        rules={[{ required: true, message: 'Nama lengkap tidak boleh kosong', min: 1 }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="nis"
        label="NIS (Nomor Induk Siswa)"
        // PERUBAHAN 2: Menghapus aturan panjang minimal, hanya menyisakan validasi angka
        rules={[
          {
            pattern: /^[0-9]*$/,
            message: 'NIS harus berupa angka.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="nisn"
        label="NISN (Nomor Induk Siswa Nasional)"
        // PERUBAHAN 3: Menghapus aturan panjang, hanya menyisakan validasi angka
        rules={[
          {
            pattern: /^[0-9]*$/,
            message: 'NISN harus berupa angka.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="alamat"
        label="Alamat"
        // PERUBAHAN 4: Menghapus semua aturan validasi dari Alamat
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="nama_wali" label="Nama Wali">
        <Input />
      </Form.Item>
      <Form.Item 
        name="nomor_telepon_wali" 
        label="Nomor Telepon Wali"
        // PERUBAHAN 5: Menghapus aturan panjang, hanya menyisakan validasi angka
        rules={[
          {
            pattern: /^[0-9]*$/,
            message: 'Nomor Telepon Wali harus berupa angka.',
          },
        ]}
      >
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