// file: frontend/src/components/EkstrakurikulerTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllEkstrakurikuler, createEkstrakurikuler, updateEkstrakurikuler, deleteEkstrakurikuler } from '../api/ekstrakurikuler';
import type { Ekstrakurikuler, UpsertEkstrakurikulerInput } from '../types';
// 'format' from date-fns is removed from here

const { TextArea } = Input;

const EkstrakurikulerTab = () => {
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState<Ekstrakurikuler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<Ekstrakurikuler | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllEkstrakurikuler();
      setDataList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data ekstrakurikuler.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (record: Ekstrakurikuler | null) => {
    setEditingData(record);
    form.setFieldsValue(record || { nama_kegiatan: '', deskripsi: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingData(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertEkstrakurikulerInput) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await updateEkstrakurikuler(editingData.id, values);
        message.success('Data berhasil diperbarui!');
      } else {
        await createEkstrakurikuler(values);
        message.success('Ekstrakurikuler baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEkstrakurikuler(id);
      message.success('Data berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<Ekstrakurikuler> = [
    { 
      title: 'Nama Kegiatan', 
      dataIndex: 'nama_kegiatan', 
      key: 'nama_kegiatan' 
    },
    { 
      title: 'Deskripsi', 
      dataIndex: 'deskripsi', 
      key: 'deskripsi',
      render: (text) => text || '-',
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
            title="Hapus Data"
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
          Tambah Ekstrakurikuler
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataList}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
      <Modal
        title={editingData ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_kegiatan"
            label="Nama Kegiatan"
            rules={[{ required: true, message: 'Nama kegiatan tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: Pramuka" />
          </Form.Item>
          <Form.Item
            name="deskripsi"
            label="Deskripsi (Opsional)"
          >
            <TextArea rows={3} placeholder="Jelaskan singkat mengenai kegiatan ini" />
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

export default EkstrakurikulerTab;