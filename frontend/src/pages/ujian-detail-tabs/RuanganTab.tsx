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
  Tooltip, 
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
  CloseCircleOutlined, 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UjianDetail, RuanganUjian, AlokasiRuanganUjian, UpsertRuanganInput, PesertaUjianDetail, UpdatePesertaSeatingPayload } from '../../types';
import {
  getAllRuanganMaster,
  createRuanganMaster,
  updateRuanganMaster,
  deleteRuanganMaster,
  getAlokasiRuanganByMasterId,
  assignRuanganToUjian,
  removeAlokasiRuangan,
  distributeSmart,
  getAlokasiKursi, 
  updatePesertaSeating, 
} from '../../api/ujianMaster';

const { Title, Text, Paragraph } = Typography;

// Variabel yang digunakan untuk penamaan grid (A, B, C, dst.)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface RuanganTabProps {
  ujianMasterId: string;
  ujianDetail: UjianDetail | undefined;
}

// ==============================================================================
// KOMPONEN VISUALISASI SEAT ARRANGEMENT
// ==============================================================================

interface LayoutData {
  rows: number;
  cols: number;
}

interface SeatArrangementProps {
  ujianMasterId: string;
  alokasi: AlokasiRuanganUjian;
  onSaveManual: (payload: UpdatePesertaSeatingPayload) => void;
}

const SeatArrangementVisualizer: React.FC<SeatArrangementProps> = ({
  ujianMasterId,
  alokasi,
}) => {
  const queryClient = useQueryClient();
  
  const { data: seatingData, isLoading } = useQuery({
    queryKey: ['alokasiKursi', ujianMasterId],
    queryFn: () => getAlokasiKursi(ujianMasterId),
    enabled: !!ujianMasterId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePesertaSeatingPayload) =>
      updatePesertaSeating(ujianMasterId, data),
    onSuccess: () => {
      message.success('Penempatan kursi berhasil diperbarui secara manual.');
      queryClient.invalidateQueries({ queryKey: ['alokasiKursi', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId], exact: true }); 
      setManualChanges([]); 
      message.destroy('savingChanges'); 
    },
    onError: (error: any) => {
      message.error(`Gagal update kursi: ${error.response?.data?.message || error.message}`);
      message.destroy('savingChanges'); 
    },
  });

  const [manualChanges, setManualChanges] = useState<UpdatePesertaSeatingPayload[]>([]); 
  const [draggingPesertaId, setDraggingPesertaId] = useState<string | null>(null);

  if (isLoading || !seatingData) return <Spin tip="Memuat data penempatan kursi..." />;

  let layout: LayoutData = { rows: 1, cols: 1 };
  try {
    const parsed = JSON.parse(alokasi.layout_metadata);
    if (parsed.rows && parsed.cols) {
        layout = parsed;
    }
  } catch (e) {
    console.error('Gagal parse layout_metadata:', e);
  }

  const participants = seatingData.peserta.map(p => {
    const manualChange = manualChanges.find(c => c.peserta_id === p.id);
    if (manualChange) {
      return {
        ...p,
        alokasi_ruangan_id: manualChange.alokasi_ruangan_id,
        nomor_kursi: manualChange.nomor_kursi,
        isChanged: true,
      } as PesertaUjianDetail & { isChanged?: boolean };
    }
    return p as PesertaUjianDetail & { isChanged?: boolean };
  });
  
  const unplacedParticipants = participants.filter(p => p.alokasi_ruangan_id !== alokasi.id);
  const placedParticipants = participants.filter(p => p.alokasi_ruangan_id === alokasi.id);
  
  const handleDragStart = (pesertaId: string) => {
    setDraggingPesertaId(pesertaId); 
  };

  const handleDropToSeat = (targetSeat: string) => {
    if (!draggingPesertaId) return;

    const existingPeserta = placedParticipants.find(p => p.nomor_kursi === targetSeat);
    if (existingPeserta) {
        message.warning(`Kursi ${targetSeat} sudah ditempati oleh ${existingPeserta.nama_siswa}.`);
        return;
    }

    const newChange: UpdatePesertaSeatingPayload = {
      peserta_id: draggingPesertaId,
      alokasi_ruangan_id: alokasi.id,
      nomor_kursi: targetSeat,
    };

    setManualChanges(prev => {
        const filtered = prev.filter(c => c.peserta_id !== draggingPesertaId);
        return [...filtered, newChange];
    });

    setDraggingPesertaId(null); 
  };
  
  const handleUnassign = (pesertaId: string) => {
    const UNASSIGNED_ID = '00000000-0000-0000-0000-000000000000'; 
    const newChange: UpdatePesertaSeatingPayload = {
        peserta_id: pesertaId,
        alokasi_ruangan_id: UNASSIGNED_ID, 
        nomor_kursi: '',
    };
    
    setManualChanges(prev => {
        const filtered = prev.filter(c => c.peserta_id !== pesertaId);
        return [...filtered, newChange];
    });
    
    setDraggingPesertaId(null);
  }

  const handleSaveAllChanges = () => {
    if (manualChanges.length === 0) {
        message.warning('Tidak ada perubahan yang perlu disimpan.');
        return;
    }

    const validChanges = manualChanges.filter(change => 
        change.nomor_kursi || change.alokasi_ruangan_id === '00000000-0000-0000-0000-000000000000'
    );
    
    if (validChanges.length === 0) {
       message.warning('Tidak ada perubahan penempatan yang valid untuk disimpan.');
       return;
    }
    
    const MESSAGE_KEY = 'savingChanges';
    message.loading({
        content: `Menyimpan ${validChanges.length} perubahan...`,
        key: MESSAGE_KEY,
        duration: 0
    });
    
    updateMutation.mutate(validChanges[validChanges.length - 1], {
      onSuccess: () => {},
      onError: () => {}
    });

  };

  // --- Render Seat Grid ---
  const seats = [];
  const totalCapacity = alokasi.kapasitas_ruangan;
  const seatsPerRow = layout.cols;
  const totalRows = layout.rows;
  
  const legendData = placedParticipants.map(p => ({
      name: p.nama_siswa,
      seat: p.nomor_kursi,
      nomorUjian: p.nomor_ujian,
      id: p.id
  }));

  for (let i = 0; i < totalCapacity; i++) {
    const seatIndex = i + 1; 
    const seatNumberDB = `K${String(seatIndex).padStart(3, '0')}`; 
    
    const visualRowIndex = Math.floor(i / seatsPerRow);
    const rowChar = ALPHABET[visualRowIndex % ALPHABET.length]; 
    
    const occupant = placedParticipants.find(p => p.nomor_kursi === seatNumberDB); 

    if (visualRowIndex >= totalRows) continue; 
    
    let seatClassName = 'seat-box';
    if (occupant) {
      seatClassName += ' occupied';
    } else if (draggingPesertaId) {
      seatClassName += ' droppable';
    }
    
    const seatDisplayContent = occupant 
        ? (occupant.nomor_kursi || seatNumberDB).replace('K', '')
        : (draggingPesertaId ? 'DROP' : ''); 
    
    const emptySeatColor = draggingPesertaId ? '#e6f7ff' : '#f7f7f7'; 
    const occupiedColor = '#1890ff'; 

    seats.push(
      <Tooltip 
        title={occupant 
            ? `${occupant.nama_siswa} (${occupant.nomor_ujian || 'N/A'}) - Kursi: ${occupant.nomor_kursi || 'N/A'} (Visual: ${rowChar}${i % seatsPerRow + 1})` 
            : `Kursi Kosong: ${seatNumberDB} (Visual: ${rowChar}${i % seatsPerRow + 1})`
        }
        key={seatNumberDB}
      >
        <div
          className={seatClassName}
          style={{ 
            width: '50px', 
            height: '50px',
            border: `1px solid ${occupant ? occupiedColor : '#d9d9d9'}`,
            backgroundColor: occupant ? occupiedColor : emptySeatColor,
            color: occupant ? '#fff' : '#404040',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: draggingPesertaId || occupant ? 'pointer' : 'default',
            position: 'relative',
            borderRadius: 4, 
            fontWeight: 'bold',
            fontSize: occupant ? 11 : 9,
            boxShadow: occupant ? '0 0 5px rgba(24, 144, 255, 0.5)' : 'none',
            transition: 'all 0.2s',
            gridRow: visualRowIndex + 1,
            gridColumn: (i % seatsPerRow) + 1, 
          }}
          onClick={() => handleDropToSeat(seatNumberDB)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDropToSeat(seatNumberDB)}
        >
          <Text style={{ color: occupant ? '#fff' : '#404040', fontSize: occupant ? 11 : 9, textAlign: 'center', whiteSpace: 'nowrap' }} strong>
              {seatDisplayContent}
          </Text>
          {occupant && (
              <CloseCircleOutlined
                  style={{ position: 'absolute', top: -7, right: -7, color: '#f5222d', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '50%', fontSize: 14 }}
                  onClick={(e) => {
                      e.stopPropagation();
                      handleUnassign(occupant.id);
                  }}
              />
          )}
        </div>
      </Tooltip>
    );
  }

  const renderUnplaced = (peserta: typeof participants[0]) => (
    <List.Item
      key={peserta.id}
      style={{ 
        cursor: 'grab', 
        backgroundColor: draggingPesertaId === peserta.id ? '#bae637' : (peserta.isChanged ? '#fffbe6' : 'transparent'),
        padding: '6px 12px',
        borderRadius: 4,
        margin: '2px 0', 
        border: draggingPesertaId === peserta.id ? '1px dashed #389e0d' : '1px solid #e8e8e8' 
      }}
      draggable
      onDragStart={() => handleDragStart(peserta.id)}
      onClick={() => handleDragStart(peserta.id)}
    >
      <List.Item.Meta
        title={<Text strong style={{ fontSize: 12 }}>{peserta.nama_siswa}</Text>}
        description={<Text type="secondary" style={{ fontSize: 10 }}>{`No. Ujian: ${peserta.nomor_ujian || 'N/A'}`}</Text>}
      />
      {peserta.isChanged && peserta.alokasi_ruangan_id !== '00000000-0000-0000-0000-000000000000' && <Tag color="orange" style={{ margin: 0 }}>PNDG</Tag>} 
    </List.Item>
  );
  
  const renderLegendItem = (item: typeof legendData[0]) => (
    <List.Item style={{ padding: '4px 0' }}>
      <Row gutter={8} align="middle" style={{ width: '100%' }}>
        <Col span={6}>
            <Tag color="blue" style={{ width: '100%', textAlign: 'center', fontSize: 10}}>{item.seat}</Tag>
        </Col>
        <Col span={8}>
            <Text ellipsis strong style={{ fontSize: 11 }}>{item.nomorUjian || 'N/A'}</Text>
        </Col>
        <Col span={10}>
             <Text ellipsis style={{ fontSize: 11 }}>{item.name}</Text>
        </Col>
      </Row>
    </List.Item>
  );

  return (
    <Row gutter={24} style={{ minHeight: '70vh' }}>
      <Col span={6}>
        <Title level={5}>Peserta Unassigned ({unplacedParticipants.length})</Title>
        <Card 
            size="small" 
            style={{ 
                maxHeight: 500,
                height: 'calc(70vh - 120px)',
                overflowY: 'auto', 
                border: draggingPesertaId ? '2px dashed #fa8c16' : '1px solid #d9d9d9'
            }}
            bodyStyle={{ padding: 4 }}
            onDrop={() => { 
                const droppingPeserta = participants.find(p => p.id === draggingPesertaId);
                if (droppingPeserta && droppingPeserta.alokasi_ruangan_id === alokasi.id) {
                    handleUnassign(droppingPeserta.id);
                }
            }}
            onDragOver={(e) => e.preventDefault()}
        >
          {unplacedParticipants.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={unplacedParticipants}
              renderItem={renderUnplaced}
            />
          ) : (
             <Empty description="Tidak ada peserta yang perlu dialokasikan." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </Col>

      <Col span={11}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
             <Title level={5} style={{ margin: 0 }}>Denah Ruangan ({layout.rows}x{layout.cols})</Title>
             <Space>
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSaveAllChanges}
                    loading={updateMutation.isPending}
                    style={manualChanges.length > 0 && !updateMutation.isPending ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}}
                    disabled={manualChanges.length === 0 || updateMutation.isPending}
                >
                    {updateMutation.isPending ? 'Menyimpan...' : (manualChanges.length > 0 ? `Simpan ${manualChanges.length} Perubahan` : 'Simpan Kursi Manual')}
                </Button>
            </Space>
        </Row>
        
        <Divider style={{ marginTop: 0, borderBlockStartColor: '#333' }}>PAPAN TULIS / MEJA GURU</Divider>

        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(${totalRows}, 1fr)`, 
          gridTemplateColumns: `repeat(${seatsPerRow}, 1fr)`,
          gap: '10px',
          width: '100%',
          maxWidth: (seatsPerRow * 50) + ((seatsPerRow - 1) * 10) + 20, 
          margin: '0 auto', 
          padding: '10px', 
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e8e8e8',
          minWidth: seatsPerRow * 50,
        }}>
          {seats}
        </div>
        <Divider style={{ marginTop: 40 }}/>
      </Col>

      <Col span={7}>
        <Title level={5} style={{ marginBottom: 16 }}>Legenda ({legendData.length} Kursi Terisi)</Title>
        <Card 
            size="small"
            style={{ height: 'calc(70vh - 50px)', overflowY: 'auto' }}
            bodyStyle={{ padding: 8 }}
        >
            <List
                header={
                    <Row gutter={8} style={{ fontWeight: 'bold', fontSize: 12, paddingBottom: 4, borderBottom: '1px solid #e8e8e8' }}>
                        <Col span={6}>Kursi</Col>
                        <Col span={8}>No. Ujian</Col>
                        <Col span={10}>Siswa</Col>
                    </Row>
                }
                dataSource={legendData}
                renderItem={renderLegendItem}
            />
            {legendData.length === 0 && (
                 <Empty description="Belum ada kursi yang terisi." image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
            )}
        </Card>
      </Col>
    </Row>
  );
};

// --- Akhir Komponen Visualisasi ---

// ==============================================================================
// KOMPONEN UTAMA RuanganTab
// ==============================================================================

const RuanganTab: React.FC<RuanganTabProps> = ({ ujianMasterId, ujianDetail }) => {
  const queryClient = useQueryClient();
  const [ruanganForm] = Form.useForm();
  
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<RuanganUjian | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); 
  const [localTargetKeys, setLocalTargetKeys] = useState<string[]>([]); 
  
  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false); 
  const [selectedAlokasi, setSelectedAlokasi] = useState<AlokasiRuanganUjian | null>(null); 
  
  // --- Query Data dan Mutations (TIDAK BERUBAH) ---
  const { data: ruanganMaster, isLoading: isRuanganMasterLoading } = useQuery<RuanganUjian[]>({
    queryKey: ['ruanganMaster'],
    queryFn: getAllRuanganMaster,
  });
  
  const { 
    data: alokasiRuangan, 
    isLoading: isAlokasiLoading
  } = useQuery<AlokasiRuanganUjian[]>({
    queryKey: ['alokasiRuangan', ujianMasterId],
    queryFn: () => getAlokasiRuanganByMasterId(ujianMasterId),
    enabled: !!ujianMasterId,
  });
  
  const createMutation = useMutation({
    mutationFn: createRuanganMaster,
    onSuccess: () => {
      message.success('Ruangan baru berhasil dibuat.');
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
      // Modal TIDAK DITUTUP
    },
    onError: (error: any) => {
      message.error(`Gagal membuat ruangan: ${error.response?.data?.message || error.message}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; input: UpsertRuanganInput }) =>
      updateRuanganMaster(data.id, data.input),
    onSuccess: () => {
      message.success('Ruangan berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] });
      // Modal TIDAK DITUTUP
    },
    onError: (error: any) => {
      message.error(`Gagal memperbarui ruangan: ${error.response?.data?.message || error.message}`);
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
      message.error(`Gagal menghapus ruangan: ${error.response?.data?.message || error.message}`);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data: { ujianMasterId: string; ruangan_ids: string[] }) =>
      assignRuanganToUjian(data.ujianMasterId, { ruangan_ids: data.ruangan_ids }),
    onSuccess: () => {
      message.success('Ruangan berhasil dialokasikan.');
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] }); 
      setIsAssignModalOpen(false);
    },
    onError: (error: any) => {
      message.error(`Gagal mengalokasikan ruangan: ${error.response?.data?.message || error.message}`);
    },
  });

  const removeAlokasiMutation = useMutation({
    mutationFn: removeAlokasiRuangan,
    onSuccess: () => {
      message.success('Alokasi ruangan berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['ruanganMaster'] }); 
    },
    onError: (error: any) => {
      message.error(`Gagal menghapus alokasi: ${error.response?.data?.message || error.message}`);
    },
  });
  
  const smartDistributeMutation = useMutation({
    mutationFn: distributeSmart,
    onMutate: () => {
        message.loading({ content: 'Menjalankan Algoritma Distribusi Cerdas...', key: 'smartDistro', duration: 0 });
    },
    onSuccess: () => {
      message.success({ content: 'Distribusi berhasil! Kursi telah dialokasikan.', key: 'smartDistro' });
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] });
      queryClient.invalidateQueries({ queryKey: ['alokasiKursi', ujianMasterId] });
    },
    onError: (error: any) => {
      message.error({ content: `Gagal distribusi: ${error.response?.data?.message || error.message}`, key: 'smartDistro' });
    },
  });

  // --- Handlers (TIDAK BERUBAH) ---
  
  const showMasterModal = (ruangan: RuanganUjian | null = null) => {
    setEditingRuangan(ruangan);
    
    let initialValues: any = { 
        nama_ruangan: '', 
        layout_rows: 6,
        layout_cols: 5
    };

    if (ruangan) {
      initialValues = { ...ruangan };
      try {
        const parsedLayout = JSON.parse(ruangan.layout_metadata || '{}');
        initialValues.layout_rows = parsedLayout.rows || 6;
        initialValues.layout_cols = parsedLayout.cols || 5;
      } catch (e) {
        console.error('Gagal parse layout metadata saat edit:', e);
      }
    }
    
    ruanganForm.setFieldsValue(initialValues);
    setIsMasterModalOpen(true);
  };
  
  const handleShowAssignModal = () => {
      const alokasiList = alokasiRuangan || []; 
      const initialTargetIDs = alokasiList.map(ar => ar.ruangan_id);
      setLocalTargetKeys(initialTargetIDs);
      setIsAssignModalOpen(true);
  };

  const handleOpenSeatingModal = (alokasi: AlokasiRuanganUjian) => {
    setSelectedAlokasi(alokasi);
    setIsSeatingModalOpen(true);
  };

  const handleSaveRuangan = (values: any) => {
    // Hitung Kapasitas berdasarkan nilai terbaru (yang dijamin real-time)
    const calculatedKapasitas = (values.layout_rows || 0) * (values.layout_cols || 0);
    
    if (calculatedKapasitas === 0) {
        message.error('Baris dan Kolom harus diisi dengan nilai minimal 1.');
        return;
    }
    
    const layout_metadata = JSON.stringify({
        rows: values.layout_rows,
        cols: values.layout_cols,
    });
    
    const input: UpsertRuanganInput = {
      nama_ruangan: values.nama_ruangan,
      kapasitas: calculatedKapasitas, 
      layout_metadata: layout_metadata, 
    };

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
  
  if (!ujianDetail) return <Spin />;

  const alokasiList = alokasiRuangan || []; 
  const ruanganMasterList = ruanganMaster || []; 
  const totalPeserta = ujianDetail.detail.jumlah_peserta;
  const totalKapasitasAlokasi = alokasiList.reduce((sum, ar) => sum + ar.kapasitas_ruangan, 0);

  const initialTargetIDs = alokasiList.map(ar => ar.ruangan_id);
  
  const sourceData = ruanganMasterList.map(r => ({
      key: r.id,
      title: r.nama_ruangan,
      description: `Kapasitas: ${r.kapasitas} kursi`,
      isAllocated: initialTargetIDs.includes(r.id),
      ruangan: r,
  }));
  
  // Custom Component untuk menampilkan Kapasitas (Non-editable)
  const CalculatedCapacityDisplay = () => {
    return (
        // Menggunakan Form.Item noStyle dan dependencies untuk memicu render real-time
        <Form.Item noStyle dependencies={['layout_rows', 'layout_cols']}>
            {({ getFieldValue }) => {
                const rows = getFieldValue('layout_rows') || 0;
                const cols = getFieldValue('layout_cols') || 0;
                const capacity = (rows || 0) * (cols || 0);

                return (
                    <Form.Item label="Kapasitas Kursi">
                        <Text strong style={{ fontSize: 16 }}>
                            {capacity}
                        </Text>
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: 10 }}>
                            ({rows} baris x {cols} kolom)
                        </Paragraph>
                    </Form.Item>
                );
            }}
        </Form.Item>
    );
  };

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
                    onClick={handleShowAssignModal} 
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
                            
                            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
                                <Text strong type="secondary">VISUAL SEAT LAYOUT</Text>
                                <Paragraph style={{ margin: '8px 0', fontSize: 12 }}>Metadata: <code>{alokasi.layout_metadata}</code></Paragraph>
                                <Button 
                                    type="link" 
                                    icon={<EditOutlined />} 
                                    onClick={() => handleOpenSeatingModal(alokasi)} 
                                >
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
      MODAL KELOLA MASTER RUANGAN (FORM SANGAT RINGKAS & KAPASITAS OTOMATIS)
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
            <Form 
                form={ruanganForm} 
                layout="vertical" 
                onFinish={handleSaveRuangan}
                // Hapus onValuesChange di sini karena sudah ditangani oleh dependencies CalculatedCapacityDisplay
            >
                <Row gutter={8} align="top">
                    {/* 1. Nama Ruangan */}
                    <Col span={10}>
                        <Form.Item name="nama_ruangan" label="Nama Ruangan" rules={[{ required: true }]}>
                            <Input placeholder="Contoh: Ruang 7A" />
                        </Form.Item>
                    </Col>
                    
                    {/* 2. Layout Rows (Baris) */}
                    <Col span={4}> 
                        <Form.Item 
                            name="layout_rows" 
                            label="Baris" 
                            rules={[{ required: true, type: 'number', min: 1, message: 'Min 1' }]}
                        >
                            <InputNumber min={1} max={50} style={{ width: '100%' }} placeholder="6" />
                        </Form.Item>
                    </Col>
                    
                    {/* 3. Layout Cols (Kolom) */}
                    <Col span={4}>
                        <Form.Item 
                            name="layout_cols" 
                            label="Kolom" 
                            rules={[{ required: true, type: 'number', min: 1, message: 'Min 1' }]}
                        >
                            <InputNumber min={1} max={50} style={{ width: '100%' }} placeholder="5" />
                        </Form.Item>
                    </Col>
                    
                    {/* 4. Kapasitas (HANYA TAMPILAN) */}
                    <Col span={6}>
                       <CalculatedCapacityDisplay />
                    </Col>
                </Row>
                
                {/* PERBAIKAN: Mengurangi margin atas (marginTop) agar lebih sempit */}
                <Form.Item style={{ textAlign: 'right', marginTop: 0, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}> 
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
            handleAssignRuangan(localTargetKeys);
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
            targetKeys={localTargetKeys} 
            onChange={(nextTargetKeys) => { 
                setLocalTargetKeys(nextTargetKeys as string[]);
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

      {/* ==============================================================================
      MODAL PENGATURAN KURSI MANUAL (FASE 1)
      ============================================================================== */}
      <Modal
        title={`Atur Penempatan Kursi: ${selectedAlokasi?.kode_ruangan} - ${selectedAlokasi?.nama_ruangan}`}
        open={isSeatingModalOpen}
        onCancel={() => {
            setIsSeatingModalOpen(false);
            setSelectedAlokasi(null); 
            queryClient.invalidateQueries({ queryKey: ['alokasiKursi', ujianMasterId] }); 
            queryClient.invalidateQueries({ queryKey: ['alokasiRuangan', ujianMasterId] }); 
        }}
        footer={null}
        width={'80%'} 
        bodyStyle={{ minHeight: '70vh' }}
        destroyOnClose
      >
        {selectedAlokasi ? (
            <SeatArrangementVisualizer
                ujianMasterId={ujianMasterId}
                alokasi={selectedAlokasi}
                onSaveManual={() => {}} 
            />
        ) : <Spin />}
      </Modal>

    </div>
  );
};

export default RuanganTab;