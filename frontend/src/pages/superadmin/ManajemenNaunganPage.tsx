// file: frontend/src/pages/superadmin/ManajemenNaunganPage.tsx
import { useState, useEffect } from 'react';
import { Button, Typography, message, Modal, Table, Alert, Form, Input, Space, Row, Col } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled, EyeOutlined } from '@ant-design/icons';
import { getAllNaungan, createNaungan, updateNaungan, deleteNaungan } from '../../api/naungan';
import type { UpsertNaunganInput } from '../../api/naungan';
import type { Naungan } from '../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const ManajemenNaunganPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [naunganList, setNaunganList] = useState<Naungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNaungan, setEditingNaungan] = useState<Naungan | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingNaungan, setDeletingNaungan] = useState<Naungan | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');


  const fetchNaunganList = async () => {
    setLoading(true);
    try {
      const data = await getAllNaungan();
      setNaunganList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data naungan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNaunganList();
  }, []);

  const showModal = (naungan: Naungan | null) => {
    setEditingNaungan(naungan);
    form.setFieldsValue(naungan || { nama_naungan: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingNaungan(null);
    form.resetFields();
  };
  
  const showDeleteModal = (naungan: Naungan) => {
    setDeletingNaungan(naungan);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingNaungan(null);
    setDeleteConfirmInput('');
  };

  const handleFinish = async (values: UpsertNaunganInput) => {
    setIsSubmitting(true);
    try {
      if (editingNaungan) {
        await updateNaungan(editingNaungan.id, values);
        message.success('Naungan berhasil diperbarui!');
      } else {
        await createNaungan(values);
        message.success('Naungan baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchNaunganList();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data naungan.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingNaungan) return;
    setIsSubmitting(true);
    try {
      await deleteNaungan(deletingNaungan.id);
      message.success(`Naungan "${deletingNaungan.nama_naungan}" dan semua sekolah di bawahnya berhasil dihapus.`);
      handleDeleteCancel();
      fetchNaunganList();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus naungan.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumnsType<Naungan> = [
    { title: 'Nama Naungan', dataIndex: 'nama_naungan', key: 'nama_naungan', sorter: (a, b) => a.nama_naungan.localeCompare(b.nama_naungan) },
    { title: 'Jumlah Sekolah', dataIndex: 'school_count', key: 'school_count', align: 'center', sorter: (a, b) => a.school_count - b.school_count },
    { title: 'Tanggal Dibuat', dataIndex: 'created_at', key: 'created_at', render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'), sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(), responsive: ['md'] },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
           <Button icon={<EyeOutlined />} onClick={() => navigate(`/superadmin/naungan/${record.id}`)}>
            {!isMobile && 'Lihat Sekolah'}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row 
        justify="space-between" 
        align="middle" 
        style={{ marginBottom: 24 }}
        gutter={[16, 16]}
      >
        <Col>
          <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>Manajemen Naungan</Title>
        </Col>
        <Col style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            {!isMobile && 'Tambah Naungan Baru'}
          </Button>
        </Col>
      </Row>

      {error ? (
        <Alert message="Error" description={error} type="error" showIcon /> 
      ) : (
        <Table 
          columns={columns} 
          dataSource={naunganList} 
          loading={loading} 
          rowKey="id" 
          scroll={{ x: 'max-content' }}
        />
      )}

      <Modal
        title={editingNaungan ? 'Edit Naungan' : 'Tambah Naungan Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="nama_naungan" label="Nama Naungan" rules={[{ required: true, message: 'Nama naungan tidak boleh kosong' }]}>
            <Input placeholder="Masukkan nama naungan" />
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
            Konfirmasi Hapus Naungan
          </Space>
        }
        open={isDeleteModalOpen}
        onCancel={handleDeleteCancel}
        destroyOnClose
        okText="Ya, Hapus Naungan Ini"
        okType="danger"
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: deleteConfirmInput !== deletingNaungan?.nama_naungan }}
      >
        <Paragraph>
          Tindakan ini akan menghapus <Text strong>{deletingNaungan?.nama_naungan}</Text> dan <Text strong>semua sekolah</Text> di bawahnya secara permanen.
        </Paragraph>
        <Paragraph>
          Semua data yang terkait (guru, siswa, dll) akan hilang dan tidak dapat dipulihkan.
        </Paragraph>
        <Paragraph>
          Untuk melanjutkan, silakan ketik nama naungan di bawah ini:
        </Paragraph>
        <Input placeholder={deletingNaungan?.nama_naungan} value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value)} />
      </Modal>
    </>
  );
};

export default ManajemenNaunganPage;