// file: frontend/src/components/AcademicHistoryTab.tsx
import { useEffect, useState } from 'react';
import { Table, Button, Spin, Alert, Tag, message, Modal, Form, Select, DatePicker, Input, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStudentHistory, createStudentHistory, updateStudentHistory, deleteStudentHistory } from '../api/students';
import type { RiwayatAkademik, UpsertAcademicHistoryInput } from '../types';
import { format } from 'date-fns';
import dayjs from 'dayjs';

interface AcademicHistoryTabProps {
  studentId: string;
  onHistoryUpdate: () => void; // <-- TAMBAHKAN PROPS BARU
}

const { Option } = Select;
const { TextArea } = Input;

const AcademicHistoryTab = ({ studentId, onHistoryUpdate }: AcademicHistoryTabProps) => { // <-- GUNAKAN PROPS BARU
  const [history, setHistory] = useState<RiwayatAkademik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingHistory, setEditingHistory] = useState<RiwayatAkademik | null>(null);
  const [form] = Form.useForm();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentHistory(studentId);
      setHistory(data);
    } catch (err) {
      setError('Gagal memuat data riwayat akademik.');
      message.error('Gagal memuat data riwayat akademik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchHistory();
    }
  }, [studentId]);

  const showModal = (record: RiwayatAkademik | null) => {
    setEditingHistory(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        tanggal_kejadian: dayjs(record.tanggal_kejadian),
      });
    } else {
      form.setFieldsValue({
        status: 'Aktif',
        tanggal_kejadian: dayjs(),
      })
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingHistory(null);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    const payload: UpsertAcademicHistoryInput = {
      ...values,
      tanggal_kejadian: values.tanggal_kejadian.format('YYYY-MM-DD'),
    };

    try {
      if (editingHistory) {
        await updateStudentHistory(editingHistory.id, payload);
        message.success('Riwayat berhasil diperbarui!');
      } else {
        await createStudentHistory(studentId, payload);
        message.success('Riwayat baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchHistory();
      onHistoryUpdate(); // <-- PANGGIL CALLBACK DI SINI
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan riwayat.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (historyId: string) => {
    try {
      await deleteStudentHistory(historyId);
      message.success('Riwayat berhasil dihapus!');
      fetchHistory();
      onHistoryUpdate(); // <-- PANGGIL CALLBACK DI SINI
    } catch (err) {
      message.error('Gagal menghapus riwayat.');
    }
  };

  const columns: TableColumnsType<RiwayatAkademik> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Aktif') color = 'green';
        if (status === 'Lulus') color = 'blue';
        if (status === 'Pindah' || status === 'Keluar') color = 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Tanggal Kejadian',
      dataIndex: 'tanggal_kejadian',
      key: 'tanggal_kejadian',
      render: (date) => format(new Date(date), 'dd MMMM yyyy'),
    },
    { title: 'Kelas/Tingkat', dataIndex: 'kelas_tingkat', key: 'kelas_tingkat', render: (text) => text || '-' },
    { title: 'Keterangan', dataIndex: 'keterangan', key: 'keterangan', render: (text) => text || '-' },
    {
        title: 'Aksi',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                <Popconfirm
                    title="Hapus Riwayat"
                    description="Apakah Anda yakin ingin menghapus data ini?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Ya, Hapus"
                    cancelText="Batal"
                >
                    <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
            </Space>
        ),
    },
  ];

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal(null)}
        >
          Tambah Riwayat Baru
        </Button>
      </div>
      <Table columns={columns} dataSource={history} rowKey="id" pagination={false} />

      <Modal
        title={editingHistory ? 'Edit Riwayat Akademik' : 'Tambah Riwayat Akademik Baru'}
        open={isModalOpen} onCancel={handleCancel} footer={null} destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Pilih status siswa">
              <Option value="Aktif">Aktif</Option>
              <Option value="Lulus">Lulus</Option>
              <Option value="Pindah">Pindah</Option>
              <Option value="Keluar">Keluar</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tanggal_kejadian" label="Tanggal Kejadian" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="kelas_tingkat" label="Kelas/Tingkat (Saat kejadian)">
            <Input placeholder="Contoh: Kelas 6, X-IPA-1"/>
          </Form.Item>
          <Form.Item name="keterangan" label="Keterangan (Opsional)">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AcademicHistoryTab;