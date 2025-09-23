// file: frontend/src/pages/KurikulumPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Flex,
  Typography,
  Select,
  Space,
  Spin,
  Alert,
  List,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Row, 
  Col,
  Card,
  Tooltip, // <-- 1. Impor Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getKurikulumByTahunAjaran, createKurikulum, updateKurikulum, deleteKurikulum, addKurikulumToTahunAjaran } from '../api/kurikulum';
import type { TahunAjaran, Kurikulum, UpsertKurikulumInput } from '../types';
import FasePanel from '../components/FasePanel';

const { Title, Text } = Typography;
const { TextArea } = Input;

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const KurikulumPage: React.FC = () => {
  const [form] = Form.useForm();
  const { width } = useWindowSize();
  const isMobile = width < 768;

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
  
  const fetchMappedKurikulum = async (tahunAjaranId: string) => {
    setLoadingKurikulum(true);
    setError(null);
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
      setError(null); 
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
        setError(`Gagal memuat data tahun ajaran.`);
      } finally {
        setLoadingTahunAjaran(false);
      }
    };

    fetchTahunAjaran();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchMappedKurikulum(selectedTahunAjaran);
    } else {
      setKurikulumList([]);
    }
  }, [selectedTahunAjaran]);
    
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(editingKurikulum || { nama_kurikulum: '', deskripsi: '' });
    }
  }, [isModalOpen, editingKurikulum, form]);

  const handleTahunAjaranChange = (value: string) => {
    setSelectedKurikulum(null);
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
        if (!selectedTahunAjaran) {
          message.error("Pilih tahun ajaran terlebih dahulu sebelum membuat kurikulum baru.");
          setIsSubmitting(false);
          return;
        }
        const newKurikulum = await createKurikulum(values);
        await addKurikulumToTahunAjaran({
          tahun_ajaran_id: selectedTahunAjaran,
          kurikulum_id: newKurikulum.id,
        });
        message.success(`Kurikulum "${newKurikulum.nama_kurikulum}" berhasil dibuat dan ditambahkan ke tahun ajaran ini.`);
        
        await fetchMappedKurikulum(selectedTahunAjaran);
        const refreshedList = await getKurikulumByTahunAjaran(selectedTahunAjaran);
        const refreshedKurikulum = refreshedList.find(k => k.id === newKurikulum.id);
        setSelectedKurikulum(refreshedKurikulum || null);
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

  const renderKurikulumList = () => (
    <Card
        title="Kurikulum Aktif"
        extra={
            // --- 2. PERBAIKAN: Tombol dibuat ringkas ---
            <Tooltip title="Buat & Tambah Kurikulum">
                <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<PlusOutlined />} 
                    onClick={() => showModal(null)} 
                />
            </Tooltip>
        }
        style={{ height: '100%' }}
    >
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
                        backgroundColor: selectedKurikulum?.id === item.id ? '#e6f7ff' : 'transparent',
                        padding: '12px',
                        borderRadius: '8px',
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
    </Card>
  );

  const renderContent = () => {
    const detailPanelContent = selectedKurikulum && selectedTahunAjaran ? (
        <FasePanel 
            key={`${selectedTahunAjaran}-${selectedKurikulum.id}`}
            tahunAjaranId={selectedTahunAjaran}
            kurikulumId={selectedKurikulum.id}
            kurikulumNama={selectedKurikulum.nama_kurikulum}
            onMappingUpdate={handleMappingUpdate}
        />
    ) : (
        <Empty description="Pilih kurikulum untuk mengelola pemetaan fase." style={{ paddingTop: '100px' }} />
    );

    if (isMobile) {
        if (selectedKurikulum) {
            return (
                <Card>
                    <Button 
                      icon={<ArrowLeftOutlined />} 
                      onClick={() => setSelectedKurikulum(null)}
                      style={{ marginBottom: 16 }}
                    >
                      Kembali ke Daftar
                    </Button>
                    {detailPanelContent}
                </Card>
            )
        }
        return renderKurikulumList();
    }

    return (
        // --- 3. PERBAIKAN: Ubah lebar kolom menjadi seimbang (12 dan 12) ---
        <Row gutter={[16, 16]} style={{ minHeight: 'calc(100vh - 250px)' }}>
            <Col xs={24} md={12}>
                {renderKurikulumList()}
            </Col>
            <Col xs={24} md={12}>
                <Card style={{ height: '100%' }}>
                    {detailPanelContent}
                </Card>
            </Col>
        </Row>
    )
  }
  
  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex 
          justify="space-between" 
          align={isMobile ? "flex-start" : "center"} 
          vertical={isMobile}
          gap={isMobile ? "middle" : 0}
        >
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
              loading={loadingTahunAjaran}
              disabled={tahunAjaranList.length === 0}
            />
          </Space>
        </Flex>

        {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        {renderContent()}

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