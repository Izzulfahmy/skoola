// file: frontend/src/pages/TahunAjaranPage.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, Select, Row, Col, Typography, Switch } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTahunAjaran, createTahunAjaran, updateTahunAjaran, deleteTahunAjaran } from '../api/tahunAjaran';
import { getTeachers } from '../api/teachers';
import type { TahunAjaran, UpsertTahunAjaranInput, Teacher } from '../types';
import { format } from 'date-fns';

const { Title } = Typography;
const { Option } = Select;

const TahunAjaranPage = () => {
  const [form] = Form.useForm();
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTahunAjaran, setEditingTahunAjaran] = useState<TahunAjaran | null>(null);
  const [switchLoadingId, setSwitchLoadingId] = useState<string | null>(null); // State untuk loading pada switch

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tahunAjaranData, teachersData] = await Promise.all([
        getAllTahunAjaran(),
        getTeachers(),
      ]);
      setTahunAjaranList(tahunAjaranData || []);
      setTeachers(teachersData || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (item: TahunAjaran | null) => {
    setEditingTahunAjaran(item);
    form.setFieldsValue(item || {
      nama_tahun_ajaran: '',
      semester: 'Ganjil',
      status: 'Tidak Aktif',
      metode_absensi: 'HARIAN',
      kepala_sekolah_id: undefined,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTahunAjaran(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertTahunAjaranInput) => {
    setIsSubmitting(true);
    try {
      if (editingTahunAjaran) {
        await updateTahunAjaran(editingTahunAjaran.id, values);
        message.success('Tahun ajaran berhasil diperbarui!');
      } else {
        await createTahunAjaran(values);
        message.success('Tahun ajaran baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data. Pastikan tidak ada duplikasi tahun ajaran dan semester.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTahunAjaran(id);
      message.success('Tahun ajaran berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  // --- FUNGSI BARU UNTUK MENGUBAH STATUS VIA SWITCH ---
  const handleStatusChange = async (record: TahunAjaran, checked: boolean) => {
    setSwitchLoadingId(record.id);
    const newStatus = checked ? 'Aktif' : 'Tidak Aktif';
    
    const payload: UpsertTahunAjaranInput = {
      nama_tahun_ajaran: record.nama_tahun_ajaran,
      semester: record.semester,
      status: newStatus,
      metode_absensi: record.metode_absensi,
      kepala_sekolah_id: record.kepala_sekolah_id,
    };

    try {
      await updateTahunAjaran(record.id, payload);
      message.success(`Status berhasil diubah menjadi ${newStatus}`);
      fetchData(); // Muat ulang data untuk sinkronisasi
    } catch (error) {
      message.error('Gagal mengubah status.');
    } finally {
      setSwitchLoadingId(null);
    }
  };


  const columns: TableColumnsType<TahunAjaran> = [
    { 
      title: 'Tahun Ajaran', 
      dataIndex: 'nama_tahun_ajaran', 
      key: 'nama_tahun_ajaran',
      sorter: (a, b) => a.nama_tahun_ajaran.localeCompare(b.nama_tahun_ajaran),
    },
    { 
      title: 'Semester', 
      dataIndex: 'semester', 
      key: 'semester',
    },
    { 
      title: 'Kepala Sekolah', 
      dataIndex: 'nama_kepala_sekolah', 
      key: 'nama_kepala_sekolah',
      render: (text) => text || '-',
      responsive: ['md'],
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Switch
          checkedChildren="Aktif"
          unCheckedChildren="Tidak Aktif"
          checked={record.status === 'Aktif'}
          loading={switchLoadingId === record.id}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(new Date(date), 'dd MMMM yyyy'),
      responsive: ['lg'],
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Tahun Ajaran"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Manajemen Tahun Pelajaran</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Tambah Tahun Ajaran
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={tahunAjaranList}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title={editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item name="nama_tahun_ajaran" label="Nama Tahun Ajaran" rules={[{ required: true }]}>
            <Input placeholder="Contoh: 2024/2025" />
          </Form.Item>
          <Form.Item name="semester" label="Semester" rules={[{ required: true }]}>
            <Select>
              <Option value="Ganjil">Ganjil</Option>
              <Option value="Genap">Genap</Option>
            </Select>
          </Form.Item>
          <Form.Item name="kepala_sekolah_id" label="Kepala Sekolah (Opsional)">
            <Select showSearch placeholder="Pilih kepala sekolah" optionFilterProp="children">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>{teacher.nama_lengkap}</Option>
              ))}
            </Select>
          </Form.Item>
           <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Aktif">Aktif</Option>
              <Option value="Tidak Aktif">Tidak Aktif</Option>
            </Select>
          </Form.Item>
          <Form.Item name="metode_absensi" label="Metode Absensi" rules={[{ required: true }]}>
            <Select>
              <Option value="HARIAN">Harian</Option>
              <Option value="PER_JAM_PELAJARAN">Per Jam Pelajaran</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TahunAjaranPage;