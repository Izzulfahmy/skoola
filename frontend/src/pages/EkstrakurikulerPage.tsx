// file: frontend/src/pages/EkstrakurikulerPage.tsx
import { useState, useEffect, useCallback } from 'react'; 
import { 
  Card, 
  Typography, 
  Layout, 
  Select, 
  Empty, 
  Alert, 
  Tabs, 
  Badge, 
  message,
  List,
  Skeleton,
  Space,
  Divider,
  Grid,
  Button,
  Modal, 
  Table, 
  Form, 
  Input, 
  Popconfirm 
} from 'antd';
import type { TableColumnsType } from 'antd'; 
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { 
    getAllEkstrakurikuler,
    getOrCreateSesi, 
    createEkstrakurikuler, 
    updateEkstrakurikuler, 
    deleteEkstrakurikuler 
} from '../api/ekstrakurikuler';
import type { TahunAjaran, Ekstrakurikuler, EkstrakurikulerSesi, UpsertEkstrakurikulerInput } from '../types';
import EkstrakurikulerDetailTab from '../components/EkstrakurikulerDetailTab';
import EkstrakurikulerAnggotaTab from '../components/EkstrakurikulerAnggotaTab';
import { 
    AppstoreOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { TextArea } = Input; 

// --- Komponen Anak untuk Menampilkan Daftar Master Ekskul & Sesi ---
interface MasterEkskulListProps {
  ekskulList: Ekstrakurikuler[];
  isListLoading: boolean;
  selectedTahunAjaranId: string | null;
  selectedEkskulId: number | null;
  onEkskulSelect: (id: number) => void;
  onRefresh: () => void;
  currentSesi: EkstrakurikulerSesi | null; 
  isMasterModalOpen: boolean;
  setIsMasterModalOpen: (open: boolean) => void;
  editingMaster: Ekstrakurikuler | null;
  setEditingMaster: (ekskul: Ekstrakurikuler | null) => void;
}

const MasterEkskulList: React.FC<MasterEkskulListProps> = ({
  ekskulList,
  isListLoading,
  selectedTahunAjaranId,
  selectedEkskulId,
  onEkskulSelect,
  onRefresh,
  currentSesi, 
  isMasterModalOpen,
  setIsMasterModalOpen,
  editingMaster,
  setEditingMaster,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dataList = ekskulList;

  const showMasterModal = (record: Ekstrakurikuler | null) => {
    setEditingMaster(record);
    form.setFieldsValue(record || { nama_kegiatan: '', deskripsi: '' });
    setIsMasterModalOpen(true);
  };

  const handleCancel = () => {
    setIsMasterModalOpen(false);
    setEditingMaster(null);
    form.resetFields();
  };

  const handleFinish = async (values: UpsertEkstrakurikulerInput) => {
    setIsSubmitting(true);
    try {
      if (editingMaster) {
        await updateEkstrakurikuler(editingMaster.id, values);
        message.success('Data master ekstrakurikuler berhasil diperbarui!');
      } else {
        await createEkstrakurikuler(values);
        message.success('Ekstrakurikuler baru berhasil ditambahkan ke master!');
      }
      handleCancel();
      onRefresh(); // Refresh data utama
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menyimpan data master. Pastikan Nama Kegiatan unik.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEkstrakurikuler(id);
      message.success('Data master ekstrakurikuler berhasil dihapus!');
      // Hapus data yang sedang dipilih jika itu yang dihapus
      if (selectedEkskulId === id) onEkskulSelect(0); 
      onRefresh(); // Refresh data utama
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data master.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<Ekstrakurikuler> = [
    { 
      title: 'Kegiatan', 
      dataIndex: 'nama_kegiatan', 
      key: 'nama_kegiatan',
      width: '60%', 
      render: (text, record) => {
          const isSelected = selectedEkskulId === record.id;
          const isCurrentSessionLoaded = isSelected && currentSesi && currentSesi.ekstrakurikuler_id === record.id;
          
          let pembinaName: string;
          let color: string;
          let isPembinaSet: boolean;

          if (isCurrentSessionLoaded) {
              // Item AKTIF & Data Sesi ADA: Ambil data Pembina yang paling fresh dari currentSesi
              pembinaName = currentSesi.nama_pembina || 'Belum ada Pembina';
              color = '#1677ff';
          } else {
              // Item TIDAK AKTIF atau Sesi Belum Load: Ambil data dari record (hasil JOIN backend)
              pembinaName = record.nama_pembina || 'Belum ada Pembina';
              color = isSelected ? '#1677ff' : (pembinaName !== 'Belum ada Pembina' ? '#666' : '#999'); // Warna abu gelap jika ada Pembina tapi tidak dipilih
          }

          isPembinaSet = pembinaName !== 'Belum ada Pembina';
          
          // Sesuaikan warna
          const finalColor = isSelected ? '#1677ff' : color;
          
          // Logika tampilan Pembina
          const subTitle: React.ReactNode = (
              <Space size={4}>
                  <UserOutlined style={{ fontSize: '11px', color: finalColor }} />
                  <Text strong={isPembinaSet} style={{ fontSize: '12px', color: finalColor }}>
                      {pembinaName}
                  </Text>
              </Space>
          );
          
          return (
            <List.Item.Meta
              title={
                  <Text strong={isSelected}>{text}</Text>
              }
              description={subTitle} 
            />
          );
      },
      onCell: (record) => ({
        onClick: () => onEkskulSelect(record.id),
        style: { cursor: 'pointer', padding: '12px 8px' },
      }),
    },
    {
        title: 'Anggota',
        key: 'anggota_count',
        align: 'center',
        width: '20%',
        render: (_, record) => {
            const isSelected = selectedEkskulId === record.id;
            const isCurrentSessionLoaded = isSelected && currentSesi && currentSesi.ekstrakurikuler_id === record.id;
            
            let anggotaCount: number;

            if (isCurrentSessionLoaded) {
                 // Item AKTIF & Data Sesi ADA: Ambil data dari currentSesi
                anggotaCount = currentSesi.jumlah_anggota || 0;
            } else {
                // Item TIDAK AKTIF atau Sesi Belum Load: Ambil data dari record (hasil JOIN backend)
                anggotaCount = record.jumlah_anggota || 0;
            }

            // Badge muncul jika count > 0 ATAU item sedang dipilih
            if (anggotaCount > 0 || isSelected) { 
                return (
                    <Badge 
                        count={anggotaCount} 
                        // Tampilkan badge 0 hanya jika sedang dipilih atau jumlahnya > 0
                        showZero={isSelected || anggotaCount > 0} 
                        style={{ backgroundColor: anggotaCount > 0 ? '#52c41a' : '#999' }} 
                        overflowCount={99}
                        title={`Jumlah Anggota: ${anggotaCount}`}
                    />
                );
            }
            return null; 
        }
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: '20%',
      render: (_, record) => (
        <Space onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => showMasterModal(record)} />
          <Popconfirm
            title="Hapus Master Data?"
            description="Ini akan menghapus kegiatan dari master, termasuk semua sesi di tahun ajaran manapun. Lanjutkan?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 8px' }}>
        <Title level={5}>Master Kegiatan</Title>
        <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showMasterModal(null)}
            style={{ marginBottom: 16 }}
            disabled={!selectedTahunAjaranId}
        >
          Tambah Master Baru
        </Button>

        {isListLoading ? <Skeleton active paragraph={{ rows: 5 }} /> :
         dataList.length === 0 ? <Empty description="Belum ada master kegiatan." style={{ padding: '32px 0' }}/> : (
            <Table
                columns={columns}
                dataSource={dataList}
                rowKey="id"
                pagination={false}
                showHeader={false}
                loading={isListLoading}
                rowClassName={(record) => record.id === selectedEkskulId ? 'ant-list-item-active' : ''}
                style={{ flex: 1, overflow: 'auto' }}
            />
        )}
      
      <Modal
        title={editingMaster ? 'Edit Master Ekstrakurikuler' : 'Tambah Master Ekstrakurikuler'}
        open={isMasterModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_kegiatan"
            label="Nama Kegiatan"
            rules={[{ required: true, message: 'Nama kegiatan tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: Pramuka" />
          </Form.Item>
          <Form.Item
            name="deskripsi"
            label="Deskripsi (Opsional)"
          >
            <TextArea rows={3} placeholder="Jelaskan singkat mengenai kegiatan ini" />
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

// --- Komponen Utama Halaman Ekstrakurikuler ---
const EkstrakurikulerPage = () => {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [ekskulList, setEkskulList] = useState<Ekstrakurikuler[]>([]); 
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string | null>(null);
  const [selectedEkskulId, setSelectedEkskulId] = useState<number | null>(null);
  const [selectedEkskul, setSelectedEkskul] = useState<Ekstrakurikuler | null>(null);
  const [currentSesi, setCurrentSesi] = useState<EkstrakurikulerSesi | null>(null);
  
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk CRUD Master (dipindahkan dari EkstrakurikulerTab)
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Ekstrakurikuler | null>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  
  // Fungsi fetchMasterList kini menerima tahunAjaranId
  const fetchMasterList = useCallback(async (tahunAjaranId: string | null = selectedTahunAjaranId) => {
    if (!tahunAjaranId) {
        setIsListLoading(false);
        setEkskulList([]);
        return;
    }

    setIsListLoading(true);
    setError(null);
    try {
        // FIX: Panggil API dengan tahunAjaranId
        const data = await getAllEkstrakurikuler(tahunAjaranId); 
        setEkskulList(data || []);
    } catch (err) {
        setError('Gagal memuat data master ekstrakurikuler.');
    } finally {
        setIsListLoading(false);
    }
  }, [selectedTahunAjaranId]); 

  // Gabungkan logika pemuatan awal dan pemuatan saat TA berubah
  const handleInitialDataLoad = useCallback(async () => {
    setIsListLoading(true);
    setError(null);
    try {
        const tahunAjaranData = await getAllTahunAjaran();
        setTahunAjaranList(tahunAjaranData);
        
        const aktif = tahunAjaranData.find(ta => ta.status.toLowerCase() === 'aktif');
        const initialTaId = aktif?.id || tahunAjaranData[0]?.id || null;
        
        setSelectedTahunAjaranId(initialTaId);
        
        if (initialTaId) {
            fetchMasterList(initialTaId);
        } else {
             setIsListLoading(false);
        }
    } catch (err) {
        setError('Gagal memuat data awal.');
        setIsListLoading(false);
    }
  }, [fetchMasterList]);

  useEffect(() => {
    handleInitialDataLoad();
  }, [handleInitialDataLoad]);
  
  // Efek untuk memuat ulang master list saat Tahun Ajaran dipilih/berubah
  useEffect(() => {
    // Memastikan fetchMasterList dipanggil ketika selectedTahunAjaranId sudah terisi/berubah
    if (selectedTahunAjaranId) {
        fetchMasterList(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId, fetchMasterList]); 

  useEffect(() => {
    if (selectedEkskulId && selectedTahunAjaranId) {
      const fetchSesi = async () => {
        setIsDetailLoading(true);
        setCurrentSesi(null);
        try {
          const ekskul = ekskulList.find(e => e.id === selectedEkskulId) || null;
          setSelectedEkskul(ekskul);
          
          const sesiData = await getOrCreateSesi(selectedEkskulId, selectedTahunAjaranId);
          setCurrentSesi(sesiData);
          
          // Refresh master list setelah sesi dimuat/diubah agar Pembina/Anggota terbaru muncul di list
          fetchMasterList(selectedTahunAjaranId); 

        } catch (err) {
          message.error('Gagal memuat detail sesi ekstrakurikuler.');
        } finally {
          setIsDetailLoading(false);
        }
      };
      fetchSesi();
    } else {
      setCurrentSesi(null);
      setSelectedEkskul(null);
    }
  }, [selectedEkskulId, selectedTahunAjaranId]); 

  const handleEkskulSelect = (id: number) => {
    setSelectedEkskulId(id);
    // ...
  };
  
  const refreshSesi = () => {
    if (selectedEkskulId && selectedTahunAjaranId) {
      getOrCreateSesi(selectedEkskulId, selectedTahunAjaranId).then(setCurrentSesi);
    }
    // Refresh master list setelah CRUD/Update sesi
    fetchMasterList(); 
  };
  
  const renderDetailPanel = () => {
    if (isDetailLoading) {
      return <Card><Skeleton active avatar paragraph={{ rows: 5 }} /></Card>;
    }
    if (!selectedEkskul || !currentSesi) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '15vh' }}>
          <Empty
            image={<AppstoreOutlined style={{ fontSize: 64, color: '#e0e0e0' }} />}
            description={
              <>
                <Title level={5}>Pilih Kegiatan</Title>
                <Text type="secondary">Pilih salah satu kegiatan dari daftar di samping kiri.</Text>
                <br />
                {!selectedTahunAjaranId && (
                    <Alert message="Peringatan" description="Tahun Ajaran belum dipilih." type="warning" showIcon style={{ marginTop: 16, maxWidth: 300, margin: '16px auto' }} />
                )}
              </>
            } 
          />
        </div>
      );
    }

    const tabs = [
      {
        key: 'detail',
        label: 'Detail Pembina',
        children: <EkstrakurikulerDetailTab sesi={currentSesi} onSesiUpdate={refreshSesi} />,
      },
      {
        key: 'anggota',
        label: (
          <Space size="small">
            <span>Anggota</span>
            <Badge count={currentSesi.jumlah_anggota} showZero color={currentSesi.jumlah_anggota > 0 ? 'blue' : 'grey'} />
          </Space>
        ),
        children: <EkstrakurikulerAnggotaTab sesi={currentSesi} onAnggotaUpdate={refreshSesi} tahunAjaranId={selectedTahunAjaranId} />,
      },
    ];

    return (
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>{selectedEkskul.nama_kegiatan}</Title>
        <Paragraph type="secondary">{selectedEkskul.deskripsi || 'Tidak ada deskripsi.'}</Paragraph>
        <Divider />
        <Tabs defaultActiveKey="detail" items={tabs} />
      </Card>
    );
  };
  
  const pageTitle = (
    <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>Manajemen Ekstrakurikuler</Title>
    </Space>
  );

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }
  
  // Menggunakan Layout ant-design untuk membagi 1/3 (Master List) dan 2/3 (Detail Sesi)
  return (
    <Card title={pageTitle}>
      <Space direction="horizontal" style={{ width: '100%', marginBottom: '16px' }} wrap>
          <Text strong>Tahun Ajaran:</Text>
          <Select
            style={{ minWidth: 250 }}
            value={selectedTahunAjaranId}
            onChange={(value) => {
              setSelectedTahunAjaranId(value);
              setSelectedEkskulId(null);
              setSelectedEkskul(null);
            }}
            options={tahunAjaranList.map((ta: TahunAjaran) => ({
              value: ta.id,
              label: `${ta.nama_tahun_ajaran} (${ta.status})`,
            }))}
            loading={isListLoading}
            placeholder="Pilih Tahun Ajaran"
          />
      </Space>
      
      <Layout style={{ background: 'transparent', flexDirection: isMobile ? 'column' : 'row' }}>
        <Sider 
            width={isMobile ? '100%' : 320} 
            style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #f0f0f0', 
                marginRight: isMobile ? 0 : '16px',
                marginBottom: isMobile ? '16px' : 0,
            }}
        >
          <MasterEkskulList
              ekskulList={ekskulList}
              isListLoading={isListLoading}
              selectedTahunAjaranId={selectedTahunAjaranId}
              selectedEkskulId={selectedEkskulId}
              onEkskulSelect={handleEkskulSelect}
              onRefresh={fetchMasterList}
              currentSesi={currentSesi} 
              isMasterModalOpen={isMasterModalOpen}
              setIsMasterModalOpen={setIsMasterModalOpen}
              editingMaster={editingMaster}
              setEditingMaster={setEditingMaster}
          />
        </Sider>
        <Content>
          {renderDetailPanel()}
        </Content>
      </Layout>
    </Card>
  );
};

export default EkstrakurikulerPage;