// file: frontend/src/pages/superadmin/ManajemenYayasanPage.tsx
import { useState, useEffect } from 'react';
import { Button, Typography, message, Modal, Table, Alert, Form, Input, Space, Row, Col } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { getFoundations, createFoundation, updateFoundation, deleteFoundation } from '../../api/foundations';
import type { UpsertFoundationInput } from '../../api/foundations';
import type { Foundation } from '../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ManajemenYayasanPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFoundation, setEditingFoundation] = useState<Foundation | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFoundation, setDeletingFoundation] = useState<Foundation | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');


  const fetchFoundations = async () => {
    setLoading(true);
    try {
      const data = await getFoundations();
      setFoundations(data || []); // Pastikan data adalah array
      setError(null);
    } catch (err) {
      setError('Gagal memuat data yayasan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundations();
  }, []);

  const showModal = (foundation: Foundation | null) => {
    setEditingFoundation(foundation);
    form.setFieldsValue(foundation || { nama_yayasan: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingFoundation(null);
    form.resetFields();
  };
  
  const showDeleteModal = (foundation: Foundation) => {
    setDeletingFoundation(foundation);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingFoundation(null);
    setDeleteConfirmInput('');
  };

  const handleFinish = async (values: UpsertFoundationInput) => {
    setIsSubmitting(true);
    try {
      if (editingFoundation) {
        await updateFoundation(editingFoundation.id, values);
        message.success('Yayasan berhasil diperbarui!');
      } else {
        await createFoundation(values);
        message.success('Yayasan baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchFoundations();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data yayasan.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFoundation) return;
    setIsSubmitting(true);
    try {
      await deleteFoundation(deletingFoundation.id);
      message.success(`Yayasan "${deletingFoundation.nama_yayasan}" dan semua sekolah di bawahnya berhasil dihapus.`);
      handleDeleteCancel();
      fetchFoundations();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus yayasan.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumnsType<Foundation> = [
    { title: 'Nama Yayasan', dataIndex: 'nama_yayasan', key: 'nama_yayasan', sorter: (a, b) => a.nama_yayasan.localeCompare(b.nama_yayasan) },
    { title: 'Tanggal Dibuat', dataIndex: 'created_at', key: 'created_at', render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'), sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
           <Button onClick={() => navigate(`/superadmin/yayasan/${record.id}`)}>
            Lihat Sekolah
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Manajemen Yayasan</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Tambah Yayasan Baru
          </Button>
        </Col>
      </Row>

      {error ? <Alert message="Error" description={error} type="error" showIcon /> : <Table columns={columns} dataSource={foundations} loading={loading} rowKey="id" />}

      <Modal
        title={editingFoundation ? 'Edit Yayasan' : 'Tambah Yayasan Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose // <-- PERBAIKAN DI SINI
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="nama_yayasan" label="Nama Yayasan" rules={[{ required: true, message: 'Nama yayasan tidak boleh kosong' }]}>
            <Input placeholder="Masukkan nama yayasan" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />
            Konfirmasi Hapus Yayasan
          </Space>
        }
        open={isDeleteModalOpen}
        onCancel={handleDeleteCancel}
        destroyOnClose // <-- PERBAIKAN DI SINI
        okText="Ya, Saya Mengerti dan Hapus Yayasan Ini"
        okType="danger"
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: deleteConfirmInput !== deletingFoundation?.nama_yayasan }}
      >
        <Paragraph>
          Tindakan ini akan menghapus <Text strong>{deletingFoundation?.nama_yayasan}</Text> dan <Text strong>semua sekolah</Text> di bawah naungannya secara permanen.
        </Paragraph>
        <Paragraph>
          Semua data yang terkait (guru, siswa, dll) akan hilang dan tidak dapat dipulihkan.
        </Paragraph>
        <Paragraph>
          Untuk melanjutkan, silakan ketik nama yayasan yang benar di bawah ini:
        </Paragraph>
        <Input placeholder={deletingFoundation?.nama_yayasan} value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value)} />
      </Modal>
    </>
  );
};

export default ManajemenYayasanPage;