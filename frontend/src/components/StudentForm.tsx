// file: src/components/StudentForm.tsx
import { Form, Input, Button, Row, Col, DatePicker, Select, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { CreateStudentInput, Student } from '../types';
import dayjs from 'dayjs';
import AcademicHistoryTab from './AcademicHistoryTab';

interface StudentFormProps {
  onFinish: (values: CreateStudentInput) => void;
  onCancel: () => void;
  initialValues?: Student;
  loading: boolean;
  onHistoryUpdate: () => void; // <-- TAMBAHKAN PROPS BARU
}

const { Option } = Select;

const StudentForm = ({ onFinish, onCancel, initialValues, loading, onHistoryUpdate }: StudentFormProps) => { // <-- GUNAKAN PROPS BARU
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
      label: 'Data Akademik & Pribadi',
      children: (
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_lengkap" label="Nama Lengkap" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_panggilan" label="Nama Panggilan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="nis" label="NIS (Nomor Induk Siswa)">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="nisn" label="NISN">
              <Input />
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
             <Form.Item name="nomor_ujian_sekolah" label="Nomor Ujian Sekolah">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: 'Kelahiran & Domisili',
      children: (
         <Row gutter={16}>
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
            <Form.Item name="agama" label="Agama">
               <Select placeholder="Pilih agama">
                  <Option value="Islam">Islam</Option>
                  <Option value="Kristen Protestan">Kristen Protestan</Option>
                  <Option value="Kristen Katolik">Kristen Katolik</Option>
                  <Option value="Hindu">Hindu</Option>
                  <Option value="Buddha">Buddha</Option>
                  <Option value="Khonghucu">Khonghucu</Option>
                  <Option value="Lainnya">Lainnya</Option>
                </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kewarganegaraan" label="Kewarganegaraan">
              <Input />
            </Form.Item>
          </Col>
           <Col span={24}>
            <Form.Item name="alamat_lengkap" label="Alamat Lengkap (Sesuai KK)">
              <Input.TextArea rows={2}/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}><Form.Item name="desa_kelurahan" label="Desa / Kelurahan"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="kecamatan" label="Kecamatan"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="kota_kabupaten" label="Kota / Kabupaten"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="provinsi" label="Provinsi"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="kode_pos" label="Kode Pos"><Input /></Form.Item></Col>
        </Row>
      )
    },
    {
      key: '3',
      label: 'Data Wali',
      children: (
         <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="nama_ayah" label="Nama Ayah"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="nama_ibu" label="Nama Ibu"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="nama_wali" label="Nama Wali (Opsional)"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="nomor_kontak_wali" label="Nomor Kontak Wali/Ortu"><Input /></Form.Item></Col>
         </Row>
      )
    }
  ];

  if (initialValues) {
    tabItems.push({
      key: '4',
      label: 'Riwayat Akademik',
      // TERUSKAN PROPS KE CHILD COMPONENT
      children: <AcademicHistoryTab studentId={initialValues.id} onHistoryUpdate={onHistoryUpdate} />,
    });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={formattedInitialValues}
    >
      <Tabs defaultActiveKey="1" items={tabItems} />

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

export default StudentForm;