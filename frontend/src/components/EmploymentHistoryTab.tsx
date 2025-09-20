// file: frontend/src/components/EmploymentHistoryTab.tsx
import { useEffect, useState } from 'react';
import { Table, Button, Spin, Alert, Tag, message, Modal, Form, Select, DatePicker, Input, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTeacherHistory, createTeacherHistory, updateTeacherHistory, deleteTeacherHistory } from '../api/teachers';
import type { RiwayatKepegawaian, CreateHistoryInput, UpdateHistoryInput } from '../types';
import { format } from 'date-fns';
import dayjs from 'dayjs';

interface EmploymentHistoryTabProps {
  teacherId: string;
}

const { Option } = Select;
const { TextArea } = Input;

const EmploymentHistoryTab = ({ teacherId }: EmploymentHistoryTabProps) => {
  const [history, setHistory] = useState<RiwayatKepegawaian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingHistory, setEditingHistory] = useState<RiwayatKepegawaian | null>(null);
  const [form] = Form.useForm();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherHistory(teacherId);
      setHistory(data);
    } catch (err) {
      setError('Gagal memuat data riwayat kepegawaian.');
      message.error('Gagal memuat data riwayat kepegawaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchHistory();
    }
  }, [teacherId]);

  const showModal = (record: RiwayatKepegawaian | null) => {
    setEditingHistory(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        tanggal_mulai: dayjs(record.tanggal_mulai),
        tanggal_selesai: record.tanggal_selesai ? dayjs(record.tanggal_selesai) : null,
      });
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
    const payload: CreateHistoryInput | UpdateHistoryInput = {
      ...values,
      tanggal_mulai: values.tanggal_mulai.format('YYYY-MM-DD'),
      tanggal_selesai: values.tanggal_selesai ? values.tanggal_selesai.format('YYYY-MM-DD') : undefined,
    };

    try {
      if (editingHistory) {
        await updateTeacherHistory(editingHistory.id, payload);
        message.success('Riwayat berhasil diperbarui!');
      } else {
        await createTeacherHistory(teacherId, payload);
        message.success('Riwayat baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchHistory();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan riwayat.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (historyId: string) => {
    try {
      await deleteTeacherHistory(historyId);
      message.success('Riwayat berhasil dihapus!');
      fetchHistory();
    } catch (err) {
      message.error('Gagal menghapus riwayat.');
    }
  };


  const columns: TableColumnsType<RiwayatKepegawaian> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Aktif') color = 'green';
        if (status === 'Pindah') color = 'gold';
        if (status === 'Cuti') color = 'blue';
        if (status === 'Berhenti' || status === 'Pensiun') color = 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'tanggal_mulai',
      key: 'tanggal_mulai',
      render: (date) => format(new Date(date), 'dd MMMM yyyy'),
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'tanggal_selesai',
      key: 'tanggal_selesai',
      render: (date) => (date ? format(new Date(date), 'dd MMMM yyyy') : '-'),
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      render: (text) => text || '-',
    },
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

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

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
      <Table
        columns={columns}
        dataSource={history}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingHistory ? 'Edit Riwayat Kepegawaian' : 'Tambah Riwayat Kepegawaian Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status tidak boleh kosong' }]}>
            <Select placeholder="Pilih status kepegawaian">
              <Option value="Aktif">Aktif</Option>
              <Option value="Cuti">Cuti</Option>
              <Option value="Pindah">Pindah</Option>
              <Option value="Berhenti">Berhenti</Option>
              <Option value="Pensiun">Pensiun</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tanggal_mulai" label="Tanggal Mulai" rules={[{ required: true, message: 'Tanggal mulai tidak boleh kosong' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="tanggal_selesai" label="Tanggal Selesai (Opsional)">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="keterangan" label="Keterangan (Opsional)">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
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

export default EmploymentHistoryTab;