// file: frontend/src/pages/KurikulumPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Flex, Splitter, Typography, Select, Space, Spin, Alert, List, Empty, Button, Modal, Form, Input, message, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
// --- PERUBAHAN DI SINI ---
import { getAllKurikulum, createKurikulum, updateKurikulum, deleteKurikulum } from '../api/kurikulum';
import type { TahunAjaran, Kurikulum, UpsertKurikulumInput } from '../types';
import FasePanel from '../components/FasePanel';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Desc: React.FC<Readonly<{ text?: React.ReactNode }>> = ({ text }) => (
  <Flex justify="center" align="center" style={{ height: '100%', padding: '16px' }}>
    <Text type="secondary" style={{ textAlign: 'center' }}>{text}</Text>
  </Flex>
);

const KurikulumPage: React.FC = () => {
  const [form] = Form.useForm();
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | null>(null);
  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [loadingTahunAjaran, setLoadingTahunAjaran] = useState(true);
  const [loadingKurikulum, setLoadingKurikulum] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKurikulum, setSelectedKurikulum] = useState<Kurikulum | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingKurikulum, setEditingKurikulum] = useState<Kurikulum | null>(null);

  useEffect(() => {
    const fetchTahunAjaran = async () => {
      setLoadingTahunAjaran(true);
      try {
        const data = await getAllTahunAjaran();
        const listTahunAjaran = data || [];
        setTahunAjaranList(listTahunAjaran);
        
        const aktif = listTahunAjaran.find(ta => ta.status === 'Aktif');
        if (aktif) {
          setSelectedTahunAjaran(aktif.id);
        } else if (listTahunAjaran.length > 0) {
          setSelectedTahunAjaran(listTahunAjaran[0].id);
        }
      } catch (err: any) {
        console.error("Detail Error:", err);
        setError(`Gagal memuat data tahun ajaran. ${err.response?.data || ''}`);
      } finally {
        setLoadingTahunAjaran(false);
      }
    };
    fetchTahunAjaran();
  }, []);

  // --- PERUBAHAN DI FUNGSI INI ---
  const fetchKurikulum = async () => {
    setLoadingKurikulum(true);
    setError(null);
    try {
      const data = await getAllKurikulum(); // Mengambil semua kurikulum
      setKurikulumList(data || []);
    } catch (err) {
      setError('Gagal memuat data kurikulum.');
      setKurikulumList([]);
    } finally {
      setLoadingKurikulum(false);
    }
  };

  // --- PERUBAHAN DI SINI: fetchKurikulum tidak lagi bergantung pada selectedTahunAjaran ---
  useEffect(() => {
    fetchKurikulum();
  }, []);
    
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(editingKurikulum || { nama_kurikulum: '', deskripsi: '' });
    }
  }, [isModalOpen, editingKurikulum, form]);


  const handleTahunAjaranChange = (value: string) => {
    setSelectedTahunAjaran(value);
    setSelectedKurikulum(null);
  };
  
  const showModal = (kurikulum: Kurikulum | null) => {
    setEditingKurikulum(kurikulum);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingKurikulum(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertKurikulumInput) => {
    setIsSubmitting(true);
    try {
      if (editingKurikulum) {
        await updateKurikulum(editingKurikulum.id, values);
        message.success('Kurikulum berhasil diperbarui!');
      } else {
        await createKurikulum(values);
        message.success('Kurikulum baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchKurikulum();
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteKurikulum(id);
      message.success('Kurikulum berhasil dihapus!');
      fetchKurikulum();
      setSelectedKurikulum(null);
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus kurikulum.');
    }
  };

  if (loadingTahunAjaran) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin tip="Memuat data..." size="large" />
      </Flex>
    );
  }
  
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>Manajemen Kurikulum</Title>
          <Space>
            <Text>Tahun Ajaran:</Text>
            <Select
              value={selectedTahunAjaran}
              style={{ width: 250 }}
              options={tahunAjaranList.map(ta => ({
                value: ta.id,
                label: `${ta.nama_tahun_ajaran} - ${ta.semester}${ta.status === 'Aktif' ? ' (Aktif)' : ''}`,
              }))}
              onChange={handleTahunAjaranChange}
              placeholder="Pilih Tahun Ajaran"
            />
          </Space>
        </Flex>

        <Splitter style={{ height: 'calc(100vh - 220px)', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
          <Splitter.Panel defaultSize="40%" min="20%" max="70%">
            <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Daftar Kurikulum</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
                  Tambah
                </Button>
              </Flex>
              {loadingKurikulum ? <Spin /> : 
               kurikulumList.length > 0 ? (
                  <List
                      dataSource={kurikulumList}
                      renderItem={(item) => (
                          <List.Item
                            key={item.id}
                            onClick={() => setSelectedKurikulum(item)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedKurikulum?.id === item.id ? '#e6f7ff' : 'transparent'
                            }}
                            actions={[
                                <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showModal(item); }} />,
                                <Popconfirm
                                    title="Hapus Kurikulum"
                                    description="Menghapus ini juga akan menghapus semua pemetaan fase terkait. Yakin?"
                                    onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id); }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Ya"
                                    cancelText="Tidak"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                                </Popconfirm>
                            ]}
                          >
                              <List.Item.Meta
                                  title={item.nama_kurikulum}
                                  description={item.deskripsi || 'Tidak ada deskripsi'}
                              />
                          </List.Item>
                      )}
                  />
               ) : (
                  <Empty description="Tidak ada kurikulum di tahun ajaran ini."/>
               )
              }
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            {selectedKurikulum && selectedTahunAjaran ? (
                 <FasePanel 
                    key={`${selectedTahunAjaran}-${selectedKurikulum.id}`}
                    tahunAjaranId={selectedTahunAjaran}
                    kurikulumId={selectedKurikulum.id}
                    kurikulumNama={selectedKurikulum.nama_kurikulum}
                 />
            ) : (
                <Desc text="Pilih kurikulum untuk melihat dan mengelola pemetaan fase." />
            )}
          </Splitter.Panel>
        </Splitter>
      </Space>

      <Modal
        title={editingKurikulum ? 'Edit Kurikulum' : 'Tambah Kurikulum Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item name="nama_kurikulum" label="Nama Kurikulum" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Kurikulum Merdeka" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi (Opsional)">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KurikulumPage;