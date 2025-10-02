import { useState, useEffect } from 'react';
import {
  Button,
  message,
  Modal,
  Table,
  Alert,
  Form,
  Input,
  Space,
  Popconfirm,
  Select,
  Row,
  Col,
  Typography,
  DatePicker,
  Tag,
  Empty,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllKelasByTahunAjaran, getAllAnggotaByKelas } from '../api/rombel';
import { getPrestasiByTahunAjaran, createPrestasi, deletePrestasi } from '../api/prestasi';
import type { TahunAjaran, Kelas, AnggotaKelas, Prestasi, UpsertPrestasiInput } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const PrestasiPage = () => {
  const [form] = Form.useForm();
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [kelasRombel, setKelasRombel] = useState<Kelas[]>([]);
  const [anggotaRombel, setAnggotaRombel] = useState<AnggotaKelas[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>(undefined);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const taData = await getAllTahunAjaran();
        const listTA = taData || [];
        setTahunAjaranList(listTA);

        if (listTA.length > 0) {
          const aktif = listTA.find(ta => ta.status === 'Aktif');
          const newSelectedId = aktif ? aktif.id : listTA[0].id;
          setSelectedTahunAjaran(newSelectedId);
        } else {
          // Jika tidak ada tahun ajaran, hentikan loading
          setLoading(false);
        }
      } catch (err) {
        setError('Gagal memuat data tahun ajaran.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTahunAjaran) {
        setPrestasiList([]); // Kosongkan data jika tidak ada tahun ajaran terpilih
        return;
      }
      setLoading(true);
      try {
        const [prestasiData, kelasData] = await Promise.all([
          getPrestasiByTahunAjaran(selectedTahunAjaran),
          getAllKelasByTahunAjaran(selectedTahunAjaran),
        ]);
        setPrestasiList(prestasiData || []);
        setKelasRombel(kelasData || []);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data. Pastikan server backend berjalan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTahunAjaran]);


  useEffect(() => {
    if (selectedKelas) {
      const fetchAnggota = async () => {
        try {
          const anggotaData = await getAllAnggotaByKelas(selectedKelas);
          setAnggotaRombel(anggotaData);
        } catch (error) {
          message.error('Gagal memuat data siswa');
        }
      };
      fetchAnggota();
    } else {
      setAnggotaRombel([]);
    }
    form.setFieldsValue({ anggota_kelas_id: undefined });
  }, [selectedKelas, form]);

  const showModal = () => {
    if (!selectedTahunAjaran) {
      message.warning('Silakan pilih tahun ajaran terlebih dahulu.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedKelas(null);
  };

  const handleFinish = async (values: any) => {
    if (!selectedTahunAjaran) return;
    setIsSubmitting(true);
    const payload: UpsertPrestasiInput = {
      ...values,
      tahun_ajaran_id: selectedTahunAjaran,
      tanggal: values.tanggal.format('YYYY-MM-DD'),
    };
    try {
      await createPrestasi(payload);
      message.success('Prestasi baru berhasil ditambahkan!');
      handleCancel();
       if (selectedTahunAjaran) { // Refetch data
          setLoading(true);
          getPrestasiByTahunAjaran(selectedTahunAjaran)
              .then(data => setPrestasiList(data || []))
              .finally(() => setLoading(false));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedTahunAjaran) return;
    try {
      await deletePrestasi(id);
      message.success('Prestasi berhasil dihapus!');
       if (selectedTahunAjaran) { // Refetch data
          setLoading(true);
          getPrestasiByTahunAjaran(selectedTahunAjaran)
              .then(data => setPrestasiList(data || []))
              .finally(() => setLoading(false));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<Prestasi> = [
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
      sorter: (a, b) => a.nama_siswa.localeCompare(b.nama_siswa),
    },
    {
      title: 'Kelas',
      dataIndex: 'nama_kelas',
      key: 'nama_kelas',
    },
    {
      title: 'Nama Prestasi',
      dataIndex: 'nama_prestasi',
      key: 'nama_prestasi',
    },
    {
      title: 'Tingkat',
      dataIndex: 'tingkat',
      key: 'tingkat',
      render: (tingkat) => <Tag color="blue">{tingkat}</Tag>,
    },
    {
      title: 'Peringkat',
      dataIndex: 'peringkat',
      key: 'peringkat',
      render: (peringkat) => <Tag color="gold">{peringkat}</Tag>,
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal',
      key: 'tanggal',
      render: (date) => format(new Date(date), 'dd MMMM yyyy'),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Hapus Prestasi"
          description="Apakah Anda yakin ingin menghapus data ini?"
          onConfirm={() => handleDelete(record.id)}
          okText="Ya, Hapus"
          cancelText="Batal"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (initialLoading) {
    return <Alert message="Memuat data awal..." type="info" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Manajemen Prestasi Siswa
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedTahunAjaran}
              style={{ width: 250 }}
              options={tahunAjaranList.map(ta => ({
                value: ta.id,
                label: `${ta.nama_tahun_ajaran} - ${ta.semester}${ta.status === 'Aktif' ? ' (Aktif)' : ''}`,
              }))}
              onChange={setSelectedTahunAjaran}
              placeholder="Pilih Tahun Ajaran"
              loading={initialLoading}
              disabled={tahunAjaranList.length === 0}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal} disabled={!selectedTahunAjaran}>
              Tambah Prestasi
            </Button>
          </Space>
        </Col>
      </Row>

      {tahunAjaranList.length === 0 ? (
          <Empty description={
              <span>
                  Belum ada data Tahun Ajaran.
                  <br />
                  Silakan <Link to="/tahun-ajaran">buat Tahun Ajaran baru</Link> terlebih dahulu.
              </span>
          } />
      ) : (
          <Table
              columns={columns}
              dataSource={prestasiList}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
          />
      )}

      <Modal
        title="Tambah Prestasi Baru"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item label="Rombel" name="kelas_id" rules={[{ required: true, message: 'Rombel harus dipilih' }]}>
            <Select
              placeholder="Pilih rombel"
              onChange={setSelectedKelas}
              options={kelasRombel.map(k => ({ value: k.id, label: k.nama_kelas }))}
              showSearch
              optionFilterProp="children"
            />
          </Form.Item>
          <Form.Item label="Siswa" name="anggota_kelas_id" rules={[{ required: true, message: 'Siswa harus dipilih' }]}>
            <Select
              placeholder="Pilih siswa"
              disabled={!selectedKelas}
              showSearch
              optionFilterProp="children"
            >
              {anggotaRombel.map(a => (
                <Option key={a.id} value={a.id}>{a.nama_lengkap}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="nama_prestasi" label="Nama Prestasi/Kejuaraan" rules={[{ required: true, message: 'Nama prestasi tidak boleh kosong' }]}>
            <Input placeholder="Contoh: Lomba Cerdas Cermat" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tingkat" label="Tingkat" rules={[{ required: true, message: 'Tingkat harus dipilih' }]}>
                <Select placeholder="Pilih Tingkat">
                  <Option value="Sekolah">Sekolah</Option>
                  <Option value="Desa/Kelurahan">Desa/Kelurahan</Option>
                  <Option value="Kecamatan">Kecamatan</Option>
                  <Option value="Kabupaten/Kota">Kabupaten/Kota</Option>
                  <Option value="Provinsi">Provinsi</Option>
                  <Option value="Nasional">Nasional</Option>
                  <Option value="Internasional">Internasional</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="peringkat" label="Peringkat" rules={[{ required: true, message: 'Peringkat harus dipilih' }]}>
                <Select placeholder="Pilih Peringkat">
                  <Option value="Juara 1">Juara 1</Option>
                  <Option value="Juara 2">Juara 2</Option>
                  <Option value="Juara 3">Juara 3</Option>
                  <Option value="Harapan 1">Harapan 1</Option>
                  <Option value="Harapan 2">Harapan 2</Option>
                  <Option value="Harapan 3">Harapan 3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tanggal" label="Tanggal Pelaksanaan" rules={[{ required: true, message: 'Tanggal tidak boleh kosong' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi (Opsional)">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PrestasiPage;