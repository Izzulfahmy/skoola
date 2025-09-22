// file: frontend/src/components/JenjangPendidikanTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllJenjang, createJenjang, updateJenjang, deleteJenjang } from '../api/jenjang';
import type { JenjangPendidikan, UpsertJenjangInput } from '../types';
import { format } from 'date-fns';

const JenjangPendidikanTab = () => {
  const [form] = Form.useForm();
  const [jenjangList, setJenjangList] = useState<JenjangPendidikan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJenjang, setEditingJenjang] = useState<JenjangPendidikan | null>(null);

  const fetchJenjang = async () => {
    setLoading(true);
    try {
      const data = await getAllJenjang();
      setJenjangList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data jenjang pendidikan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJenjang();
  }, []);

  const showModal = (jenjang: JenjangPendidikan | null) => {
    setEditingJenjang(jenjang);
    form.setFieldsValue(jenjang || { nama_jenjang: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingJenjang(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertJenjangInput) => {
    setIsSubmitting(true);
    try {
      if (editingJenjang) {
        await updateJenjang(editingJenjang.id, values);
        message.success('Jenjang Pendidikan berhasil diperbarui!');
      } else {
        await createJenjang(values);
        message.success('Jenjang Pendidikan baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchJenjang();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan data.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJenjang(id);
      message.success('Jenjang Pendidikan berhasil dihapus!');
      fetchJenjang();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<JenjangPendidikan> = [
    { 
      title: 'Nama Jenjang', 
      dataIndex: 'nama_jenjang', 
      key: 'nama_jenjang' 
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
            title="Hapus Jenjang"
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
          Tambah Jenjang
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={jenjangList}
        loading={loading}
        rowKey="id"
      />
      <Modal
        title={editingJenjang ? 'Edit Jenjang Pendidikan' : 'Tambah Jenjang Pendidikan'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_jenjang"
            label="Nama Jenjang"
            rules={[{ required: true, message: 'Nama jenjang tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: SMA/MA" />
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

export default JenjangPendidikanTab;