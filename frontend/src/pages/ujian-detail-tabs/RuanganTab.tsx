// file: frontend/src/pages/ujian-detail-tabs/RuanganTab.tsx

import React, { useState, useMemo } from 'react';
import { 
  Typography, Card, Button, Divider, Row, Col, Empty, message, Spin, Space, Tag, Modal, 
  Form, Input, InputNumber, Popconfirm, Descriptions, List, Transfer 
} from 'antd'; 
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined, ApartmentOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UjianDetail } from '../../types';
import type { TransferDirection } from 'antd/es/transfer'; 
import type { Key } from 'react'; 

const { Title, Text, Paragraph } = Typography;

interface RuanganTabProps {
  ujianMasterId: string;
  ujianDetail: UjianDetail | undefined;
}

// --- TIPE DATA ---
interface RuanganUjian {
  id: string;
  nama_ruangan: string;
  kapasitas: number;
  layout_metadata: string;
  is_used: boolean;
}

interface AlokasiRuangan {
  id: string;
  kode_ruangan: string;
  nama_ruangan: string;
  kapasitas_ruangan: number;
  jumlah_kursi_terpakai: number;
  layout_metadata: string;
}

interface RuanganTransferItem extends RuanganUjian {
    key: string;
    description: string;
    disabled: boolean;
}

// --- API STUBS (Ganti dengan API service nyata Anda) ---
const mockFetchRuanganMaster = async (): Promise<RuanganUjian[]> => {
  return [
    { id: 'ruang1', nama_ruangan: 'Ruang Kelas 7A', kapasitas: 30, layout_metadata: '{"rows": 6, "cols": 5}', is_used: false },
    { id: 'ruang2', nama_ruangan: 'Lab Komputer', kapasitas: 20, layout_metadata: '{"rows": 5, "cols": 4}', is_used: false },
    { id: 'ruang3', nama_ruangan: 'Auditorium Kecil', kapasitas: 50, layout_metadata: '{"rows": 10, "cols": 5}', is_used: true },
  ];
};

const mockFetchAlokasi = async (id: string): Promise<AlokasiRuangan[]> => {
    // Simulasi data alokasi yang sudah ada untuk ujian ini
    if (id === 'some-valid-id') {
        return [
            { id: 'alok1', kode_ruangan: 'R1', nama_ruangan: 'Ruang Kelas 7A', kapasitas_ruangan: 30, jumlah_kursi_terpakai: 25, layout_metadata: '{"rows": 6, "cols": 5}' },
            { id: 'alok2', kode_ruangan: 'R2', nama_ruangan: 'Lab Komputer', kapasitas_ruangan: 20, jumlah_kursi_terpakai: 0, layout_metadata: '{"rows": 5, "cols": 4}' },
        ];
    }
    return []; 
}

// --- KOMPONEN UTAMA ---
const RuanganTab: React.FC<RuanganTabProps> = ({ ujianMasterId, ujianDetail }) => {
  const queryClient = useQueryClient();
  const [ruanganForm] = Form.useForm();
  
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<RuanganUjian | null>(null);
  
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false); 
  const [targetKeys, setTargetKeys] = useState<string[]>([]); 

  // --- QUERY ---
  // 1. Deklarasi ruanganMaster
  const { data: ruanganMaster, isLoading: isRuanganMasterLoading } = useQuery<RuanganUjian[]>({
    queryKey: ['ruanganMaster'],
    queryFn: mockFetchRuanganMaster,
  });
  
  const { data: alokasiRuangan, isLoading: isAlokasiLoading } = useQuery<AlokasiRuangan[]>({
    queryKey: ['alokasiRuangan', ujianMasterId],
    queryFn: () => mockFetchAlokasi(ujianMasterId),
    enabled: !!ujianMasterId,
  });

  // --- DERIVED STATE (useMemo) ---
  // 2. Gunakan ruanganMaster setelah deklarasinya (FIXED ORDER)
  const masterRuanganTransferData = useMemo<RuanganTransferItem[]>(() => {
    return ruanganMaster?.map(r => ({
        key: r.id,
        ...r,
        description: `${r.nama_ruangan} (${r.kapasitas} kursi)`,
        // Menonaktifkan ruangan yang sudah digunakan di ujian lain (Simulasi)
        disabled: r.is_used, 
    })) || [];
  }, [ruanganMaster]);

  // --- HANDLERS RUANGAN MASTER CRUD ---
  const showMasterModal = (ruangan: RuanganUjian | null = null) => {
    setEditingRuangan(ruangan);
    if (ruangan) {
        let layoutString = ruangan.layout_metadata;
        try {
            layoutString = JSON.stringify(JSON.parse(ruangan.layout_metadata), null, 2);
        } catch (e) {}
        ruanganForm.setFieldsValue({ ...ruangan, layout_metadata: layoutString });
    } else {
        ruanganForm.setFieldsValue({ nama_ruangan: '', kapasitas: 30, layout_metadata: '{"rows": 6, "cols": 5}' });
    }
    setIsMasterModalOpen(true);
  };
  
  const handleSaveRuangan = () => {
      message.success('Simulasi: Ruangan master berhasil disimpan/diperbarui.');
      setIsMasterModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
  };

  // --- HANDLERS ALOKASI RUANGAN ---

  // Dipanggil saat tombol "Alokasikan Ruangan" diklik
  const handleOpenAllocationModal = () => {
    // Menemukan ID master ruangan yang sudah dialokasikan untuk ujian ini (berdasarkan nama ruangan)
    const allocatedMasterIDs = alokasiRuangan?.map(a => masterRuanganTransferData.find(r => r.nama_ruangan === a.nama_ruangan)?.key).filter((id): id is string => !!id) || [];
    setTargetKeys(allocatedMasterIDs);
    setIsAllocationModalOpen(true);
  }

  // Dipanggil saat Transfer diubah
  const handleTransferChange = (nextTargetKeys: Key[], _direction: TransferDirection, _moveKeys: Key[]) => {
    // Suppressed warnings for direction and moveKeys with underscore prefix
    setTargetKeys(nextTargetKeys.filter((key): key is string => typeof key === 'string')); 
  };
  
  // Dipanggil saat modal alokasi OK
  const handleAssignRuangan = () => {
    if (targetKeys.length === 0) {
        message.warning('Pilih setidaknya satu ruangan untuk dialokasikan.');
        return;
    }
    
    // Logic nyata: Panggil mutation API AssignRuangan (menggunakan targetKeys sebagai RuanganIDs)
    message.loading({ content: 'Mengalokasikan ruangan...', key: 'assignRoom' });
    
    // Simulasi mutasi
    setTimeout(() => {
        message.success({ content: `Berhasil mengalokasikan ${targetKeys.length} ruangan.`, key: 'assignRoom', duration: 2 });
        queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
        setIsAllocationModalOpen(false);
    }, 1500);
  };
  
  const handleRemoveAlokasi = (alokasiID: string) => {
    // Logic nyata: Panggil mutation API RemoveAlokasiRuangan(alokasiID)
    message.loading({ content: 'Menghapus alokasi...', key: 'removeRoom' });
    // Simulasi mutasi
    setTimeout(() => {
        message.success({ content: 'Alokasi ruangan berhasil dihapus.', key: 'removeRoom', duration: 1.5 });
        queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
    }, 1000);
    // alokasiID is now intentionally unused in the handler scope (Suppressing warning)
  };
  
  // --- HANDLERS DISTRIBUSI & SEATING ---
  const handleSmartDistribution = () => {
      // Logic nyata: Panggil API DistributePesertaSmart(ujianMasterId)
      message.loading({ content: 'Menjalankan Algoritma Distribusi Cerdas...', key: 'smartDistro', duration: 0 });
      setTimeout(() => {
          message.success({ content: 'Distribusi berhasil! Kursi telah dialokasikan.', key: 'smartDistro', duration: 2 });
          queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
          queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      }, 2000);
  };
  
  if (!ujianDetail) return <Spin />;

  // Estimate total participants
  const totalPesertaEstimate = (ujianDetail.penugasan?.length || 0) * 10;
  const totalKapasitasAllocated = alokasiRuangan?.reduce((sum, a) => sum + a.kapasitas_ruangan, 0) || 0;
  const isKapasitasSufficient = totalKapasitasAllocated >= totalPesertaEstimate;


  return (
    <div style={{ paddingTop: '24px' }}>
      <Title level={5}>Ruangan Ujian</Title>
      <Paragraph type="secondary">
        Atur alokasi ruangan dan penempatan kursi untuk peserta ujian ini.
        Total peserta: <Text strong>{totalPesertaEstimate}</Text>. Total Kapasitas dialokasikan: <Text strong type={isKapasitasSufficient ? 'success' : 'danger'}>{totalKapasitasAllocated}</Text>.
      </Paragraph>
      
      {/* --- Aksi Utama --- */}
      <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 12 }}>
        <Row justify="space-between" align="middle" gutter={[8, 8]}>
          <Col>
            <Button icon={<SettingOutlined />} onClick={() => showMasterModal(null)}>
                Kelola Master Ruangan
            </Button>
          </Col>
          <Col>
            <Space>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleOpenAllocationModal}
                    disabled={isRuanganMasterLoading || (masterRuanganTransferData.length === 0)}
                >
                    Alokasikan Ruangan
                </Button>
                <Button 
                    icon={<ThunderboltOutlined />} 
                    onClick={handleSmartDistribution} 
                    type="default"
                    disabled={alokasiRuangan?.length === 0}
                >
                    Distribusi Cerdas
                </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Spin spinning={isAlokasiLoading}>
        {alokasiRuangan && alokasiRuangan.length > 0 ? (
            <Row gutter={[16, 16]}>
                {alokasiRuangan.map(alokasi => (
                    <Col xs={24} md={12} key={alokasi.id}>
                        <Card 
                            title={<Space><ApartmentOutlined /> {alokasi.kode_ruangan} - {alokasi.nama_ruangan}</Space>}
                            extra={
                                <Popconfirm title="Hapus alokasi ini? Penempatan kursi akan direset." onConfirm={() => handleRemoveAlokasi(alokasi.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            }
                        >
                            <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
                                <Descriptions.Item label="Kode">
                                    <Text code>{alokasi.kode_ruangan}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Kapasitas">
                                    <Tag color="blue">{alokasi.kapasitas_ruangan} Kursi</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Terisi">
                                    <Tag color={alokasi.jumlah_kursi_terpakai > 0 ? 'green' : 'red'}>{alokasi.jumlah_kursi_terpakai} Peserta</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                            
                            {/* --- Placeholder untuk Visual Layout (Fase 1) --- */}
                            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
                                <Text type="secondary">Visual Seat Layout akan muncul di sini</Text>
                                <Paragraph style={{ margin: '8px 0', fontSize: 12 }}>Metadata: <code>{alokasi.layout_metadata}</code></Paragraph>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Empty description="Belum ada ruangan yang dialokasikan untuk paket ujian ini." />
        )}
      </Spin>
      
      {/* Modal Kelola Master Ruangan */}
      <Modal
        title={editingRuangan ? 'Edit Ruangan Fisik' : 'Kelola Master Ruangan'}
        open={isMasterModalOpen}
        onCancel={() => setIsMasterModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={ruanganForm} layout="vertical" onFinish={handleSaveRuangan}>
            <Form.Item name="nama_ruangan" label="Nama Ruangan" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="kapasitas" label="Kapasitas (Kursi)" rules={[{ required: true, type: 'number', min: 1 }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="layout_metadata" label="Layout Metadata (JSON)" rules={[{ 
                required: true, 
                message: 'Wajib diisi, minimal {"rows": 1, "cols": 1}',
            }]}>
                <Input.TextArea rows={4} placeholder="Contoh: {'rows': 6, 'cols': 5}" />
            </Form.Item>
            <div style={{ border: '1px dashed #ccc', padding: 8, marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Data ini adalah master ruangan. Anda harus mengalokasikannya ke paket ujian di halaman sebelumnya.</Text>
            </div>
            <Form.Item style={{ textAlign: 'right' }}>
                <Button onClick={() => setIsMasterModalOpen(false)} style={{ marginRight: 8 }}>Batal</Button>
                <Button type="primary" htmlType="submit">Simpan</Button>
            </Form.Item>
        </Form>
        <Divider>Daftar Master Ruangan</Divider>
        <Spin spinning={isRuanganMasterLoading}>
             {ruanganMaster && ruanganMaster.length > 0 ? (
                 <List
                    dataSource={masterRuanganTransferData}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button key="edit" type='text' icon={<EditOutlined />} onClick={() => showMasterModal(item)} />,
                                <Popconfirm key="delete" title="Hapus Master Ruangan? Ini akan merusak alokasi." onConfirm={() => message.warning('Simulasi: Menghapus Ruangan Master')}>
                                    <Button type='text' danger icon={<DeleteOutlined />} disabled={item.is_used}/>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                title={<Text strong>{item.nama_ruangan}</Text>}
                                description={<Space size="middle"><Tag icon={<UserOutlined />}>{item.kapasitas} Kursi</Tag><Tag color={item.is_used ? 'volcano' : 'blue'}>{item.is_used ? 'Digunakan Ujian Lain' : 'Tersedia'}</Tag></Space>}
                            />
                        </List.Item>
                    )}
                 />
             ) : <Empty description="Belum ada master ruangan ujian." />}
        </Spin>
      </Modal>

      {/* Modal Alokasi Ruangan */}
      <Modal
        title="Alokasikan Ruangan ke Paket Ujian"
        open={isAllocationModalOpen}
        onCancel={() => setIsAllocationModalOpen(false)}
        onOk={handleAssignRuangan}
        okText={`Alokasikan (${targetKeys.length})`}
        width={800}
      >
        <Paragraph type="secondary">Pilih ruangan yang akan dialokasikan untuk paket ujian **{ujianDetail.detail.nama_paket_ujian}**.</Paragraph>
        <Transfer
            dataSource={masterRuanganTransferData}
            titles={['Ruangan Master', 'Ruangan Dialokasikan']}
            targetKeys={targetKeys}
            onChange={handleTransferChange}
            render={item => item.nama_ruangan}
            listStyle={{
                width: 350,
                height: 300,
            }}
            disabled={isRuanganMasterLoading}
        />
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>Catatan: Ruangan akan diberi kode unik (R1, R2, dst) secara otomatis pada saat alokasi.</Text>
      </Modal>
    </div>
  );
};

export default RuanganTab;