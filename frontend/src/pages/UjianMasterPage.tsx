// frontend/src/pages/UjianMasterPage.tsx

import { useState, useEffect } from 'react';
import {
  Button,
  message,
  Modal,
  Table,
  Form,
  Input,
  Space,
  Popconfirm,
  Typography,
  Spin,
  Empty,
  Card,
  Alert,
} from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getAllUjianMaster, createUjianMaster, updateUjianMaster, deleteUjianMaster } from '../api/ujianMaster'; 
import type { UjianMaster, UpsertUjianMasterInput } from '../types'; 
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const UjianMasterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // =======================================================
  // PERBAIKAN DI SINI: Hapus 'authState'
  // =======================================================
  const { activeTahunAjaran } = useAuth();

  const [paketUjianList, setPaketUjianList] = useState<UjianMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<UjianMaster | null>(null);

  const fetchData = async () => {
    if (!activeTahunAjaran) {
      setLoading(false);
      setPaketUjianList([]); 
      return;
    }
    setLoading(true);
    try {
      const data = await getAllUjianMaster();
      setPaketUjianList(data || []);
    } catch (err) {
      message.error('Gagal memuat data paket ujian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTahunAjaran]);

  const showModal = (record: UjianMaster | null) => {
    setEditingData(record);
    form.setFieldsValue(record || { nama_paket_ujian: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingData(null);
    form.resetFields();
  };

  const handleFinish = async (values: { nama_paket_ujian: string }) => {
    if (!activeTahunAjaran) {
        message.error("Tahun ajaran aktif tidak ditemukan.");
        return;
    }
    setIsSubmitting(true);
    const payload: UpsertUjianMasterInput = {
        ...values,
        tahun_ajaran_id: activeTahunAjaran.id,
    };
    try {
      if (editingData) {
        await updateUjianMaster(editingData.id, payload);
        message.success('Paket Ujian berhasil diperbarui!');
      } else {
        await createUjianMaster(payload);
        message.success('Paket Ujian baru berhasil dibuat!');
      }
      handleCancel();
      await fetchData(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan data.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteUjianMaster(id);
      message.success('Paket Ujian berhasil dihapus!');
      await fetchData();
    } catch (err: any)
      {
      const errorMessage = err.response?.data?.message || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableProps<UjianMaster>['columns'] = [
    {
      title: 'Nama Paket Ujian',
      dataIndex: 'nama_paket_ujian',
      key: 'nama',
      render: (text: string, record: UjianMaster) => (
        <a onClick={() => navigate(`/admin/ujian/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record: UjianMaster) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Hapus paket ini?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Manajemen Ujian</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal(null)}
        style={{ marginBottom: 16 }}
        disabled={!activeTahunAjaran}
      >
        Buat Paket Ujian
      </Button>

      {loading ? <Spin /> : !activeTahunAjaran ? (
        <Alert message="Pilih tahun ajaran aktif terlebih dahulu untuk mengelola ujian." type="warning" showIcon />
      ) : (
        <Table
          columns={columns}
          dataSource={paketUjianList}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="Belum ada paket ujian dibuat." /> }}
        />
      )}

      <Modal
        title={editingData ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item name="nama_paket_ujian" label="Nama Paket Ujian" rules={[{ required: true, message: 'Nama paket tidak boleh kosong' }]}>
            <Input placeholder="Contoh: UAS Ganjil 2025" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UjianMasterPage;