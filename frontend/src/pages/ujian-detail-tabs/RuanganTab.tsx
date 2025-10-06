// file: frontend/src/pages/ujian-detail-tabs/RuanganTab.tsx

import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Divider,
  Row,
  Col,
  Empty,
  message,
  Spin,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  List,
  Descriptions,
  Transfer,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  ApartmentOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UjianDetail, RuanganUjian, AlokasiRuanganUjian, UpsertRuanganInput } from '../../types';
import {
  getAllRuanganMaster,
  createRuanganMaster,
  updateRuanganMaster,
  deleteRuanganMaster,
  getAlokasiRuanganByMasterId,
  assignRuanganToUjian,
  removeAlokasiRuangan,
  distributeSmart,
} from '../../api/ujianMaster';

const { Title, Text, Paragraph } = Typography;

interface RuanganTabProps {
  ujianMasterId: string;
  ujianDetail: UjianDetail | undefined;
}

// ==============================================================================
// KOMPONEN UTAMA RuanganTab
// ==============================================================================

const RuanganTab: React.FC<RuanganTabProps> = ({ ujianMasterId, ujianDetail }) => {
  const queryClient = useQueryClient();
  const [ruanganForm] = Form.useForm();
  
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<RuanganUjian | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // --- Query Data ---
  
  // 1. Ambil Master Ruangan (Data Ruangan Fisik Sekolah)
  const { data: ruanganMaster, isLoading: isRuanganMasterLoading } = useQuery<RuanganUjian[]>({
    queryKey: ['ruanganMaster'],
    queryFn: getAllRuanganMaster,
  });
  
  // 2. Ambil Alokasi Ruangan (Ruangan yang ditugaskan ke Paket Ujian ini)
  const { 
    data: alokasiRuangan, // Jangan gunakan = [] di sini, biarkan query handle null, lalu gunakan fallback saat map/reduce
    isLoading: isAlokasiLoading 
  } = useQuery<AlokasiRuanganUjian[]>({
    queryKey: ['alokasiRuangan', ujianMasterId],
    queryFn: () => getAlokasiRuanganByMasterId(ujianMasterId),
    enabled: !!ujianMasterId,
  });

  // --- Mutasi CRUD Master Ruangan (tetap sama) ---
  
  const createMutation = useMutation({
    mutationFn: createRuanganMaster,
    onSuccess: () => {
      message.success('Ruangan baru berhasil dibuat.');
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
      setIsMasterModalOpen(false);
    },
    onError: (error: any) => {
      message.error(`Gagal membuat ruangan: ${error.response?.data || error.message}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; input: UpsertRuanganInput }) =>
      updateRuanganMaster(data.id, data.input),
    onSuccess: () => {
      message.success('Ruangan berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
      setIsMasterModalOpen(false);
    },
    onError: (error: any) => {
      message.error(`Gagal memperbarui ruangan: ${error.response?.data || error.message}`);
    },
  });

  const deleteMasterMutation = useMutation({
    mutationFn: deleteRuanganMaster,
    onSuccess: () => {
      message.success('Ruangan master berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
    },
    onError: (error: any) => {
      message.error(`Gagal menghapus ruangan: ${error.response?.data || error.message}`);
    },
  });

  // --- Mutasi Alokasi Ruangan (tetap sama) ---

  const assignMutation = useMutation({
    mutationFn: (data: { ujianMasterId: string; ruangan_ids: string[] }) =>
      assignRuanganToUjian(data.ujianMasterId, { ruangan_ids: data.ruangan_ids }),
    onSuccess: () => {
      message.success('Ruangan berhasil dialokasikan.');
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] }); // Update status is_used
      setIsAssignModalOpen(false);
    },
    onError: (error: any) => {
      message.error(`Gagal mengalokasikan ruangan: ${error.response?.data || error.message}`);
    },
  });

  const removeAlokasiMutation = useMutation({
    mutationFn: removeAlokasiRuangan,
    onSuccess: () => {
      message.success('Alokasi ruangan berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] }); // Update status is_used
    },
    onError: (error: any) => {
      message.error(`Gagal menghapus alokasi: ${error.response?.data || error.message}`);
    },
  });
  
  const smartDistributeMutation = useMutation({
    mutationFn: distributeSmart,
    onMutate: () => {
        message.loading({ content: 'Menjalankan Algoritma Distribusi Cerdas...', key: 'smartDistro', duration: 0 });
    },
    onSuccess: () => {
      message.success({ content: 'Distribusi berhasil! Kursi telah dialokasikan.', key: 'smartDistro' });
      // Refetch data kursi dan alokasi
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['alokasiKursi', ujianMasterId] });
    },
    onError: (error: any) => {
      message.error({ content: `Gagal distribusi: ${error.response?.data || error.message}`, key: 'smartDistro' });
    },
  });

  // --- Handlers (tetap sama) ---
  
  const showMasterModal = (ruangan: RuanganUjian | null = null) => {
    setEditingRuangan(ruangan);
    if (ruangan) {
      ruanganForm.setFieldsValue({ ...ruangan, layout_metadata: ruangan.layout_metadata });
    } else {
      ruanganForm.setFieldsValue({ nama_ruangan: '', kapasitas: 30, layout_metadata: JSON.stringify({ rows: 6, cols: 5 }, null, 2) });
    }
    setIsMasterModalOpen(true);
  };
  
  const handleSaveRuangan = (values: any) => {
    const input: UpsertRuanganInput = {
      nama_ruangan: values.nama_ruangan,
      kapasitas: values.kapasitas,
      layout_metadata: values.layout_metadata,
    };

    // Simple JSON check (optional, tapi baik)
    try {
        JSON.parse(input.layout_metadata);
    } catch (e) {
        message.error('Format Layout Metadata harus JSON yang valid.');
        return;
    }

    if (editingRuangan) {
      updateMutation.mutate({ id: editingRuangan.id, input });
    } else {
      createMutation.mutate(input);
    }
  };
  
  const handleDeleteMaster = (ruanganID: string) => {
    deleteMasterMutation.mutate(ruanganID);
  };

  const handleAssignRuangan = (targetKeys: string[]) => {
    if (targetKeys.length === 0) {
        message.warning('Pilih minimal satu ruangan untuk dialokasikan.');
        return;
    }
    assignMutation.mutate({ ujianMasterId, ruangan_ids: targetKeys });
  };
  
  const handleRemoveAlokasi = (alokasiID: string) => {
    removeAlokasiMutation.mutate(alokasiID);
  };
  
  const handleSmartDistribution = () => {
      if (!alokasiRuangan || alokasiRuangan.length === 0) {
          message.error('Silakan alokasikan ruangan terlebih dahulu.');
          return;
      }
      smartDistributeMutation.mutate(ujianMasterId);
  };
  
  // --- Data untuk Transfer (Alokasi) - Menggunakan fallback array untuk keamanan ---
  const alokasiList = alokasiRuangan || []; // Fallback untuk alokasiRuangan
  const ruanganMasterList = ruanganMaster || []; // Fallback untuk ruanganMaster

  const targetIDs = alokasiList.map(ar => ar.ruangan_id);
  
  const sourceData = ruanganMasterList.map(r => ({
      key: r.id,
      title: r.nama_ruangan,
      description: `Kapasitas: ${r.kapasitas} kursi`,
      isAllocated: targetIDs.includes(r.id), // Penanda yang sudah dialokasikan
      ruangan: r,
  }));
  
  if (!ujianDetail) return <Spin />;

  const totalPeserta = ujianDetail.detail.jumlah_peserta;
  // FIX UTAMA: Menerapkan fallback || [] pada variabel sebelum memanggil .reduce()
  const totalKapasitasAlokasi = alokasiList.reduce((sum, ar) => sum + ar.kapasitas_ruangan, 0);

  return (
    <div style={{ paddingTop: '24px' }}>
      <Title level={5}>Ruangan Ujian</Title>
      <Paragraph type="secondary">
        Kelola master ruangan fisik dan alokasikan ruangan untuk ujian **{ujianDetail.detail.nama_paket_ujian}**.
        Terdapat total **{totalPeserta}** peserta yang terdaftar.
      </Paragraph>
      
      {/* --- Aksi Utama --- */}
      <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 12 }}>
        <Row justify="space-between" align="middle" gutter={[8, 8]}>
          <Col>
            <Button 
                icon={<SettingOutlined />} 
                onClick={() => showMasterModal(null)}
                loading={isRuanganMasterLoading}
            >
                Kelola Master Ruangan
            </Button>
          </Col>
          <Col>
            <Space>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsAssignModalOpen(true)}
                    disabled={isRuanganMasterLoading || (ruanganMasterList.length === 0)}
                >
                    Alokasikan Ruangan
                </Button>
                <Button 
                    icon={<ThunderboltOutlined />} 
                    onClick={handleSmartDistribution} 
                    type="default"
                    loading={smartDistributeMutation.isPending}
                    disabled={alokasiList.length === 0 || smartDistributeMutation.isPending}
                >
                    Distribusi Cerdas
                </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Divider orientation="left">Daftar Alokasi Ruangan Ujian ({alokasiList.length} Ruangan)</Divider>
      
      {/* --- Visualisasi Alokasi & Kapasitas --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
            <Card title="Total Kapasitas" size="small" bordered={false}>
                <Text strong style={{ fontSize: 24, color: totalKapasitasAlokasi < totalPeserta ? 'red' : 'green' }}>
                    {totalKapasitasAlokasi} Kursi
                </Text>
                <Paragraph type="secondary">
                    Status: {totalKapasitasAlokasi < totalPeserta ? <Tag color="red">Kapasitas Kurang</Tag> : <Tag color="green">Kapasitas Cukup</Tag>}
                </Paragraph>
            </Card>
        </Col>
        <Col xs={24} sm={12}>
            <Card title="Sisa Kursi" size="small" bordered={false}>
                 <Text strong style={{ fontSize: 24, color: (totalKapasitasAlokasi - totalPeserta) < 0 ? 'red' : 'blue' }}>
                    {totalKapasitasAlokasi - totalPeserta}
                </Text>
                <Paragraph type="secondary">
                    {Math.max(0, totalPeserta)} Peserta Membutuhkan Kursi.
                </Paragraph>
            </Card>
        </Col>
      </Row>

      {/* --- Daftar Alokasi Ruangan --- */}
      <Spin spinning={isAlokasiLoading}>
        {alokasiList.length > 0 ? (
            <Row gutter={[16, 16]}>
                {alokasiList.map(alokasi => (
                    <Col xs={24} md={12} key={alokasi.id}>
                        <Card 
                            title={<Space><ApartmentOutlined /> {alokasi.kode_ruangan} - {alokasi.nama_ruangan}</Space>}
                            extra={
                                <Popconfirm 
                                    title="Yakin hapus alokasi ini? Penempatan kursi peserta akan dihapus!" 
                                    onConfirm={() => handleRemoveAlokasi(alokasi.id)}
                                    okText="Ya, Hapus"
                                    cancelText="Batal"
                                >
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        size="small" 
                                        loading={removeAlokasiMutation.isPending && removeAlokasiMutation.variables === alokasi.id}
                                    />
                                </Popconfirm>
                            }
                        >
                            <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
                                <Descriptions.Item label="Kapasitas">
                                    <Tag color="blue">{alokasi.kapasitas_ruangan} Kursi</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Terisi">
                                    <Tag color={alokasi.jumlah_kursi_terpakai > 0 ? 'green' : 'red'}>{alokasi.jumlah_kursi_terpakai} Peserta</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Kode Ruangan">
                                    <Text copyable>{alokasi.kode_ruangan}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                            
                            {/* --- Placeholder untuk Visual Layout (Fase 1) --- */}
                            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
                                <Text strong type="secondary">VISUAL SEAT LAYOUT</Text>
                                <Paragraph style={{ margin: '8px 0', fontSize: 12 }}>Metadata: <code>{alokasi.layout_metadata}</code></Paragraph>
                                <Button type="link" icon={<EditOutlined />} disabled>
                                    Atur Penempatan Kursi (Fase 1)
                                </Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Empty description="Belum ada ruangan yang dialokasikan untuk paket ujian ini." />
        )}
      </Spin>
      
      {/* ==============================================================================
      MODAL KELOLA MASTER RUANGAN
      ============================================================================== */}
      <Modal
        title={editingRuangan ? `Edit Ruangan Fisik: ${editingRuangan.nama_ruangan}` : 'Buat Ruangan Fisik Baru'}
        open={isMasterModalOpen}
        onCancel={() => setIsMasterModalOpen(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Spin spinning={createMutation.isPending || updateMutation.isPending}>
            <Form form={ruanganForm} layout="vertical" onFinish={handleSaveRuangan}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="nama_ruangan" label="Nama Ruangan" rules={[{ required: true }]}>
                            <Input placeholder="Contoh: Ruang 7A, Lab Komputer 1" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="kapasitas" label="Kapasitas (Kursi)" rules={[{ required: true, type: 'number', min: 1 }]}>
                            <InputNumber min={1} max={500} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item 
                    name="layout_metadata" 
                    label="Layout Metadata (JSON)" 
                    rules={[{ required: true, message: 'Wajib diisi, minimal {"rows": 1, "cols": 1}' }]}
                    tooltip="Digunakan untuk Visual Seat Layout (Fase 1). Contoh: {'rows': 6, 'cols': 5}"
                >
                    <Input.TextArea rows={4} placeholder="Contoh: {'rows': 6, 'cols': 5}" />
                </Form.Item>
                
                <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                    <Button onClick={() => setIsMasterModalOpen(false)} style={{ marginRight: 8 }}>Batal</Button>
                    <Button type="primary" htmlType="submit">
                        <SaveOutlined /> {editingRuangan ? 'Perbarui Ruangan' : 'Buat Ruangan'}
                    </Button>
                </Form.Item>
            </Form>
        </Spin>
        
        <Divider>Daftar Master Ruangan Sekolah</Divider>
        <Spin spinning={isRuanganMasterLoading}>
             {ruanganMasterList.length > 0 ? (
                 <List
                    dataSource={ruanganMasterList}
                    renderItem={item => {
                        const isAllocated = alokasiList.some(ar => ar.ruangan_id === item.id);
                        return (
                            <List.Item
                                actions={[
                                    <Button type='text' icon={<EditOutlined />} onClick={() => showMasterModal(item)} key="edit" />,
                                    <Popconfirm 
                                        title={isAllocated ? 'Ruangan sedang digunakan! Hapus akan membatalkan semua alokasi yang terkait.' : 'Hapus Master Ruangan?'}
                                        onConfirm={() => handleDeleteMaster(item.id)}
                                        okText="Ya, Hapus"
                                        cancelText="Batal"
                                        disabled={deleteMasterMutation.isPending && deleteMasterMutation.variables === item.id}
                                        key="delete"
                                    >
                                        <Button type='text' danger icon={<DeleteOutlined />} 
                                            loading={deleteMasterMutation.isPending && deleteMasterMutation.variables === item.id}
                                        />
                                    </Popconfirm>
                                ]}
                            >
                                <List.Item.Meta
                                    title={<Text strong>{item.nama_ruangan}</Text>}
                                    description={<Space size="middle">
                                        <Tag icon={<UserOutlined />}>{item.kapasitas} Kursi</Tag>
                                        <Tag color={isAllocated ? 'warning' : 'green'}>
                                            {isAllocated ? 'Dialokasikan' : 'Tersedia'}
                                        </Tag>
                                    </Space>}
                                />
                            </List.Item>
                        );
                    }}
                 />
             ) : <Empty description="Belum ada master ruangan ujian." />}
        </Spin>
      </Modal>
      
      {/* ==============================================================================
      MODAL ALOKASI RUANGAN
      ============================================================================== */}
      <Modal
        title="Alokasikan Ruangan ke Paket Ujian Ini"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        okText="Alokasikan"
        onOk={() => {
            const newlyAllocatedKeys = ruanganMasterList.map(r => r.id).filter(id => targetIDs.includes(id));
            handleAssignRuangan(newlyAllocatedKeys);
        }}
        confirmLoading={assignMutation.isPending}
        width={700}
        destroyOnClose
      >
        <Paragraph>
            Pilih ruangan fisik dari daftar kiri untuk dialokasikan ke ujian **{ujianDetail.detail.nama_paket_ujian}**.
            Ruangan yang sudah dialokasikan akan ditandai.
        </Paragraph>
        <Divider />
        <Spin spinning={isRuanganMasterLoading || assignMutation.isPending}>
        <Transfer
            dataSource={sourceData}
            targetKeys={targetIDs} // Kunci Ruangan yang sudah dialokasikan (Target)
            onChange={(_nextTargetKeys) => { 
                // Menggunakan _nextTargetKeys untuk menghindari warning unused variable.
            }}
            render={item => item.title}
            titles={['Ruangan Master', 'Ruangan Dialokasikan']}
            listStyle={{
                width: 300,
                height: 300,
            }}
        />
        </Spin>
      </Modal>

    </div>
  );
};

export default RuanganTab;