// file: frontend/src/components/JabatanTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllJabatan, createJabatan, updateJabatan, deleteJabatan } from '../api/jabatan';
import type { Jabatan, UpsertJabatanInput } from '../types';
import { format } from 'date-fns';

const JabatanTab = () => {
  const [form] = Form.useForm();
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null);

  const fetchJabatan = async () => {
    setLoading(true);
    try {
      const data = await getAllJabatan();
      setJabatanList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data jabatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  const showModal = (jabatan: Jabatan | null) => {
    setEditingJabatan(jabatan);
    form.setFieldsValue(jabatan || { nama_jabatan: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingJabatan(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertJabatanInput) => {
    setIsSubmitting(true);
    try {
      if (editingJabatan) {
        await updateJabatan(editingJabatan.id, values);
        message.success('Jabatan berhasil diperbarui!');
      } else {
        await createJabatan(values);
        message.success('Jabatan baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchJabatan();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan data.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJabatan(id);
      message.success('Jabatan berhasil dihapus!');
      fetchJabatan();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<Jabatan> = [
    { 
      title: 'Nama Jabatan', 
      dataIndex: 'nama_jabatan', 
      key: 'nama_jabatan' 
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
            title="Hapus Jabatan"
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
          Tambah Jabatan
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={jabatanList}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
      <Modal
        title={editingJabatan ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_jabatan"
            label="Nama Jabatan"
            rules={[{ required: true, message: 'Nama jabatan tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: Guru Matematika" />
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

export default JabatanTab;