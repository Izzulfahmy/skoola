// file: frontend/src/components/TingkatanTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, InputNumber } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTingkatan, createTingkatan, updateTingkatan, deleteTingkatan } from '../api/tingkatan';
import type { Tingkatan, UpsertTingkatanInput } from '../types';
import { format } from 'date-fns';

const TingkatanTab = () => {
  const [form] = Form.useForm();
  const [tingkatanList, setTingkatanList] = useState<Tingkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTingkatan, setEditingTingkatan] = useState<Tingkatan | null>(null);

  const fetchTingkatan = async () => {
    setLoading(true);
    try {
      const data = await getAllTingkatan();
      setTingkatanList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data tingkatan kelas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTingkatan();
  }, []);

  const showModal = (tingkatan: Tingkatan | null) => {
    setEditingTingkatan(tingkatan);
    form.setFieldsValue(tingkatan || { nama_tingkatan: '', urutan: undefined });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTingkatan(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertTingkatanInput) => {
    setIsSubmitting(true);
    try {
      if (editingTingkatan) {
        await updateTingkatan(editingTingkatan.id, values);
        message.success('Tingkatan kelas berhasil diperbarui!');
      } else {
        await createTingkatan(values);
        message.success('Tingkatan kelas baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchTingkatan();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data. Pastikan nama tingkatan tidak duplikat.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTingkatan(id);
      message.success('Tingkatan kelas berhasil dihapus!');
      fetchTingkatan();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<Tingkatan> = [
    { 
      title: 'Urutan', 
      dataIndex: 'urutan', 
      key: 'urutan',
      sorter: (a, b) => (a.urutan || 0) - (b.urutan || 0),
    },
    { 
      title: 'Nama Tingkatan', 
      dataIndex: 'nama_tingkatan', 
      key: 'nama_tingkatan',
      sorter: (a, b) => a.nama_tingkatan.localeCompare(b.nama_tingkatan),
    },
    { 
      title: 'Tanggal Dibuat', 
      dataIndex: 'created_at', 
      key: 'created_at', 
      render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'),
      responsive: ['md']
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Tingkatan"
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
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
          Tambah Tingkatan
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tingkatanList}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
      <Modal
        title={editingTingkatan ? 'Edit Tingkatan Kelas' : 'Tambah Tingkatan Kelas'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_tingkatan"
            label="Nama Tingkatan"
            rules={[{ required: true, message: 'Nama tingkatan tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: Kelas 1 atau Kelas X-A" />
          </Form.Item>
          <Form.Item
            name="urutan"
            label="Nomor Urut (Opsional)"
            help="Digunakan untuk mengurutkan tampilan."
          >
            <InputNumber placeholder="Contoh: 1" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TingkatanTab;