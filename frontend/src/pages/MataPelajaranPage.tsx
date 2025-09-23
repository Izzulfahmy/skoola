// file: frontend/src/pages/MataPelajaranPage.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, Row, Col, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllMataPelajaran, createMataPelajaran, updateMataPelajaran, deleteMataPelajaran } from '../api/mataPelajaran';
import type { MataPelajaran, UpsertMataPelajaranInput } from '../types';

const { Title } = Typography;

const MataPelajaranPage = () => {
  const [form] = Form.useForm();
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMataPelajaran, setEditingMataPelajaran] = useState<MataPelajaran | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllMataPelajaran();
      setMataPelajaranList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data mata pelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (item: MataPelajaran | null) => {
    setEditingMataPelajaran(item);
    form.setFieldsValue(item || { kode_mapel: '', nama_mapel: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingMataPelajaran(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertMataPelajaranInput) => {
    setIsSubmitting(true);
    try {
      if (editingMataPelajaran) {
        await updateMataPelajaran(editingMataPelajaran.id, values);
        message.success('Mata pelajaran berhasil diperbarui!');
      } else {
        await createMataPelajaran(values);
        message.success('Mata pelajaran baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data. Pastikan kode mata pelajaran tidak duplikat.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMataPelajaran(id);
      message.success('Mata pelajaran berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<MataPelajaran> = [
    { 
      title: 'Kode', 
      dataIndex: 'kode_mapel', 
      key: 'kode_mapel',
      sorter: (a, b) => a.kode_mapel.localeCompare(b.kode_mapel),
    },
    { 
      title: 'Nama Mata Pelajaran', 
      dataIndex: 'nama_mapel', 
      key: 'nama_mapel',
      sorter: (a, b) => a.nama_mapel.localeCompare(b.nama_mapel),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Mata Pelajaran"
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
          <Title level={2} style={{ margin: 0 }}>Manajemen Mata Pelajaran</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Tambah Mata Pelajaran
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={mataPelajaranList}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title={editingMataPelajaran ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item name="kode_mapel" label="Kode Mata Pelajaran" rules={[{ required: true }]}>
            <Input placeholder="Contoh: MTK-01" />
          </Form.Item>
          <Form.Item name="nama_mapel" label="Nama Mata Pelajaran" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Matematika Wajib" />
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

export default MataPelajaranPage;