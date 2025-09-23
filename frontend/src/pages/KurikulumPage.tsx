// file: frontend/src/pages/KurikulumPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Flex, Splitter, Typography, Select, Space, Spin, Alert, List, Empty, Button, Modal, Form, Input, message, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
// --- PERBAIKAN: Impor fungsi baru ---
import { getKurikulumByTahunAjaran, createKurikulum, updateKurikulum, deleteKurikulum, addKurikulumToTahunAjaran } from '../api/kurikulum';
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
  const [loadingKurikulum, setLoadingKurikulum] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKurikulum, setSelectedKurikulum] = useState<Kurikulum | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingKurikulum, setEditingKurikulum] = useState<Kurikulum | null>(null);
  
  const fetchMappedKurikulum = async (tahunAjaranId: string) => {
    setLoadingKurikulum(true);
    try {
      const data = await getKurikulumByTahunAjaran(tahunAjaranId);
      setKurikulumList(data || []);

      if (selectedKurikulum && !data.some(k => k.id === selectedKurikulum.id)) {
        setSelectedKurikulum(null);
      }
    } catch (err) {
      setError('Gagal memuat daftar kurikulum untuk tahun ajaran ini.');
      setKurikulumList([]);
    } finally {
      setLoadingKurikulum(false);
    }
  };

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
        } else {
          setLoadingKurikulum(false);
        }
      } catch (err: any) {
        setError(`Gagal memuat data tahun ajaran.`);
        setLoadingKurikulum(false);
      } finally {
        setLoadingTahunAjaran(false);
      }
    };

    fetchTahunAjaran();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchMappedKurikulum(selectedTahunAjaran);
    }
  }, [selectedTahunAjaran]);
    
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(editingKurikulum || { nama_kurikulum: '', deskripsi: '' });
    }
  }, [isModalOpen, editingKurikulum, form]);

  const handleTahunAjaranChange = (value: string) => {
    setSelectedTahunAjaran(value);
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
        if (selectedTahunAjaran) {
          fetchMappedKurikulum(selectedTahunAjaran);
        }
      } else {
        // --- PERBAIKAN: Alur baru setelah membuat kurikulum ---
        if (!selectedTahunAjaran) {
          message.error("Pilih tahun ajaran terlebih dahulu sebelum membuat kurikulum baru.");
          setIsSubmitting(false);
          return;
        }
        const newKurikulum = await createKurikulum(values);
        // Langsung asosiasikan dengan tahun ajaran yang aktif
        await addKurikulumToTahunAjaran({
          tahun_ajaran_id: selectedTahunAjaran,
          kurikulum_id: newKurikulum.id,
        });
        message.success(`Kurikulum "${newKurikulum.nama_kurikulum}" berhasil dibuat dan ditambahkan ke tahun ajaran ini.`);
        
        // Muat ulang data dan langsung pilih kurikulum yang baru dibuat
        await fetchMappedKurikulum(selectedTahunAjaran);
        setSelectedKurikulum(newKurikulum);
      }
      handleCancel();
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
      if (selectedTahunAjaran) {
        fetchMappedKurikulum(selectedTahunAjaran);
      }
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus kurikulum.');
    }
  };
  
  const handleMappingUpdate = () => {
    if (selectedTahunAjaran) {
      fetchMappedKurikulum(selectedTahunAjaran);
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
              disabled={tahunAjaranList.length === 0}
            />
          </Space>
        </Flex>

        <Splitter style={{ height: 'calc(100vh - 220px)', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
          <Splitter.Panel defaultSize="40%" min="20%" max="70%">
            <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Kurikulum Aktif</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
                  Buat & Tambah
                </Button>
              </Flex>
              {loadingKurikulum ? <Spin /> : 
               !selectedTahunAjaran ? <Empty description="Pilih tahun ajaran terlebih dahulu." /> :
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
                                    title="Hapus Master Kurikulum"
                                    description="Menghapus ini akan menghapus semua pemetaan terkait di semua tahun ajaran. Yakin?"
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
                  <Empty description="Belum ada kurikulum untuk tahun ajaran ini."/>
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
                    onMappingUpdate={handleMappingUpdate}
                 />
            ) : (
                <Desc text="Pilih kurikulum untuk mengelola pemetaan fase." />
            )}
          </Splitter.Panel>
        </Splitter>
      </Space>

      <Modal
        title={editingKurikulum ? 'Edit Master Kurikulum' : 'Buat & Tambah Kurikulum'}
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