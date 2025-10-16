// file: frontend/src/components/JenisUjianTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, Row, Col } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllJenisUjian, createJenisUjian, updateJenisUjian, deleteJenisUjian } from '../api/jenisUjian';
import type { JenisUjian, UpsertJenisUjianInput } from '../types';
import { format } from 'date-fns';

const JenisUjianTab = () => {
  const [form] = Form.useForm();
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<JenisUjian | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllJenisUjian();
      setJenisUjianList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data jenis ujian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (record: JenisUjian | null) => {
    setEditingData(record);
    form.setFieldsValue(record || { kode_ujian: '', nama_ujian: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingData(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertJenisUjianInput) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await updateJenisUjian(editingData.id, values);
        message.success('Jenis Ujian berhasil diperbarui!');
      } else {
        await createJenisUjian(values);
        message.success('Jenis Ujian baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data || 'Gagal menyimpan data. Pastikan Kode Ujian unik.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Perhatian: Jika ID jenis ujian di backend Anda adalah UUID (string), 
      // pastikan tipe di sini juga string, bukan number.
      await deleteJenisUjian(id); 
      message.success('Jenis Ujian berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<JenisUjian> = [
    { 
      title: 'Kode Ujian', 
      dataIndex: 'kode_ujian', 
      key: 'kode_ujian',
      // Mengurangi padding cell
      onCell: () => ({ style: { padding: '8px 16px' } })
    },
    { 
      title: 'Nama Ujian', 
      dataIndex: 'nama_ujian', 
      key: 'nama_ujian',
      onCell: () => ({ style: { padding: '8px 16px' } })
    },
    { 
      title: 'Tanggal Dibuat', 
      dataIndex: 'created_at', 
      key: 'created_at', 
      render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'),
      responsive: ['md'],
      onCell: () => ({ style: { padding: '8px 16px' } })
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120, // Tambahkan width agar tombol tidak terlalu rapat
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Jenis Ujian"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
      onCell: () => ({ style: { padding: '8px 8px' } })
    },
  ];

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
          Tambah Jenis Ujian
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={jenisUjianList}
        loading={loading}
        rowKey="id"
        pagination={false}
        size="small" // <-- PROPERTI UNTUK MEMPERPENDEK BARIS
        scroll={{ x: 'max-content' }} // Untuk memastikan responsif jika kolom banyak
      />
      <Modal
        title={editingData ? 'Edit Jenis Ujian' : 'Tambah Jenis Ujian'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="kode_ujian"
                label="Kode Ujian"
                rules={[{ required: true, message: 'Kode tidak boleh kosong' }]}
              >
                <Input placeholder="Contoh: UH" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="nama_ujian"
                label="Nama Ujian"
                rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
              >
                <Input placeholder="Contoh: Ulangan Harian" />
              </Form.Item>
            </Col>
          </Row>
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

export default JenisUjianTab;