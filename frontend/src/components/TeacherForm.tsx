// file: src/components/TeacherForm.tsx
import { Form, Input, Button, Row, Col, DatePicker, Select, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { CreateTeacherInput, Teacher } from '../types';
import dayjs from 'dayjs';
// --- 1. IMPOR KOMPONEN BARU ---
import EmploymentHistoryTab from './EmploymentHistoryTab';

interface TeacherFormProps {
  onFinish: (values: CreateTeacherInput) => void;
  onCancel: () => void;
  initialValues?: Teacher;
  loading: boolean;
}

const { Option } = Select;

const TeacherForm = ({ onFinish, onCancel, initialValues, loading }: TeacherFormProps) => {
  const [form] = Form.useForm();

  const formattedInitialValues = initialValues ? {
    ...initialValues,
    tanggal_lahir: initialValues.tanggal_lahir ? dayjs(initialValues.tanggal_lahir, 'YYYY-MM-DD') : null,
  } : {
    kewarganegaraan: 'Indonesia',
  };

  const handleFinish = (values: any) => {
    const finalValues = {
      ...values,
      tanggal_lahir: values.tanggal_lahir ? values.tanggal_lahir.format('YYYY-MM-DD') : undefined,
    };
    onFinish(finalValues);
  };

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Data Akun',
      children: (
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_lengkap" label="Nama Lengkap" rules={[{ required: true, message: 'Nama lengkap tidak boleh kosong' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="nip_nuptk" label="NIP / NUPTK">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email tidak boleh kosong', type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
          {!initialValues && (
            <Col xs={24} sm={12}>
              <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password minimal 8 karakter', min: 8 }]}>
                <Input.Password />
              </Form.Item>
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Biodata',
      children: (
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_panggilan" label="Nama Panggilan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="gelar_akademik" label="Gelar Akademik">
              <Input placeholder="Contoh: S.Pd."/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="tempat_lahir" label="Tempat Lahir">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="tanggal_lahir" label="Tanggal Lahir">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="jenis_kelamin" label="Jenis Kelamin">
              <Select placeholder="Pilih jenis kelamin">
                <Option value="Laki-laki">Laki-laki</Option>
                <Option value="Perempuan">Perempuan</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="agama" label="Agama">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kewarganegaraan" label="Kewarganegaraan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="no_hp" label="Nomor HP">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Alamat',
      children: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="alamat_lengkap" label="Alamat Lengkap (Sesuai KTP)">
              <Input.TextArea rows={3}/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="desa_kelurahan" label="Desa / Kelurahan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kecamatan" label="Kecamatan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kota_kabupaten" label="Kota / Kabupaten">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="provinsi" label="Provinsi">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kode_pos" label="Kode Pos">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  // --- 2. TAMBAHKAN TAB SECARA KONDISIONAL ---
  // Tab Riwayat Kepegawaian hanya akan muncul jika form dalam mode edit (initialValues ada)
  if (initialValues) {
    tabItems.push({
      key: '4',
      label: 'Riwayat Kepegawaian',
      children: <EmploymentHistoryTab teacherId={initialValues.id} />,
    });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={formattedInitialValues}
    >
      <Tabs 
        items={tabItems} 
      />

      <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
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