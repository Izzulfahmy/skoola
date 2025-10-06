import { useState, useMemo } from 'react';
import {
  Spin,
  Empty,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  message,
  Alert,
  Table,
  Tag,
  Row,
  Col,
  Card,
  Flex,
  Popconfirm,
  Input,
} from 'antd';
import { PlusOutlined, UsergroupAddOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
import { addPesertaFromKelas, deletePesertaFromKelas, generateNomorUjian } from '../../api/ujianMaster'; 
import type { CSSProperties } from 'react';
import DebugPesertaUjian from './DebugPesertaUjian';

// --- Tipe untuk error dari Axios ---
interface AxiosErrorResponse {
  data?: {
    message: string;
    deletedCount?: number;
    generatedCount?: number;
  };
  status?: number;
}
interface AxiosErrorType extends Error {
  response?: AxiosErrorResponse;
}
// ------------------------------------

const { Text } = Typography;

const denseCellStyle: CSSProperties = {
  padding: '6px 8px',
};
const denseHeaderStyle: CSSProperties = {
  padding: '8px 8px',
  backgroundColor: '#fafafa',
};

const nameCellStyle: CSSProperties = {
  ...denseCellStyle,
  whiteSpace: 'normal',
  overflowWrap: 'break-word', 
};

interface PesertaUjianTabProps {
  ujianMasterId: string;
  data: GroupedPesertaUjian | undefined;
  isLoading: boolean;
  penugasan: PenugasanUjian[];
}

const PesertaUjianTab: React.FC<PesertaUjianTabProps> = ({
  ujianMasterId,
  data,
  isLoading,
  penugasan,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [kodeUjianPrefix, setKodeUjianPrefix] = useState<string>('');
  const queryClient = useQueryClient();

  const columns: TableProps<PesertaUjian>['columns'] = [
    {
      title: '#',
      dataIndex: 'urutan',
      key: 'urutan',
      width: 50,
      align: 'center',
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      onCell: () => ({ style: denseCellStyle }),
    },
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
      render: (text) => text,
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      onCell: () => ({ style: nameCellStyle }),
    },
    {
      title: 'NISN',
      dataIndex: 'nisn',
      key: 'nisn',
      width: 150,
      responsive: ['md'],
      render: (nisn) => nisn || <Text type="secondary">-</Text>,
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      onCell: () => ({ style: denseCellStyle }),
    },
    {
      title: 'Nomor Ujian',
      dataIndex: 'nomor_ujian',
      key: 'nomor_ujian',
      align: 'center',
      width: 120,
      render: (nomor) => (
        nomor ? <Tag color="blue">{nomor}</Tag> : <Tag>Belum Ada</Tag>
      ),
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      onCell: () => ({ style: denseCellStyle }),
    },
  ];

  const addPesertaMutation = useMutation({
    mutationFn: (kelasId: string) => addPesertaFromKelas(ujianMasterId, { kelas_id: kelasId }),
    onSuccess: (response) => {
      message.success(`${response.successCount} peserta berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: AxiosErrorType) => { 
      message.error(err.response?.data?.message || 'Gagal menambahkan peserta.');
    },
  });

  const deletePesertaMutation = useMutation({
    mutationFn: (kelasId: string) => {
      console.log('🚀 MUTATION START: Calling deletePesertaFromKelas');
      console.log('   ujianMasterId:', ujianMasterId);
      console.log('   kelasId:', kelasId);
      return deletePesertaFromKelas(ujianMasterId, kelasId);
    },
    onSuccess: (response) => {
      console.log('✅ DELETE SUCCESS: Response received:', response);
      message.success(response.message || `Berhasil menghapus ${response.deletedCount || 0} peserta.`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      console.log('🔄 Query invalidated, UI should refresh');
    },
    onError: (err: AxiosErrorType) => {
      console.error('❌ DELETE ERROR: Full error object:', err);
      message.error(err.response?.data?.message || 'Gagal menghapus peserta ujian.');
    },
  });

  // NEW: Generate nomor ujian mutation
  const generateNomorUjianMutation = useMutation({
    mutationFn: (prefix: string) => {
      console.log('🎯 GENERATE NOMOR UJIAN: Starting generation');
      console.log('   ujianMasterId:', ujianMasterId);
      console.log('   prefix:', prefix);
      return generateNomorUjian(ujianMasterId, { prefix });
    },
    onSuccess: (response) => {
      console.log('✅ GENERATE SUCCESS: Response received:', response);
      message.success(response.message || `Berhasil generate ${response.generatedCount || response.generated_count || 0} nomor ujian!`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      console.log('🔄 Query invalidated, UI should refresh');
      // Reset input after success
      setKodeUjianPrefix('');
    },
    onError: (err: AxiosErrorType) => {
      console.error('❌ GENERATE ERROR: Full error object:', err);
      message.error(err.response?.data?.message || 'Gagal generate nomor ujian.');
    },
  });

  const handleFinish = (values: { kelas_id: string }) => {
    addPesertaMutation.mutate(values.kelas_id);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmed = async (kelasID: string) => {
    console.log('🚀 DELETE CONFIRMED: Starting API call...');
    
    try {
      const hide = message.loading('Menghapus peserta...', 0);
      await deletePesertaMutation.mutateAsync(kelasID);
      hide();
    } catch (error: any) {
      message.error(`Gagal menghapus peserta: ${error.response?.data?.message || error.message}`);
    }
  };

  // NEW: Handle generate nomor ujian - IMPROVED
  const handleGenerateNomorUjian = () => {
    const prefix = kodeUjianPrefix.trim();
    
    // Jika tidak ada prefix, gunakan default "EXAM"
    const finalPrefix = prefix || 'EXAM';

    console.log('🎯 Generate button clicked with prefix:', finalPrefix);
    generateNomorUjianMutation.mutate(finalPrefix.toUpperCase());
  };

  const availableKelasForDropdown = useMemo(() => {
    const kelasSudahJadiPeserta = data ? Object.keys(data) : [];
    const seen = new Set<string>();
    const uniqueKelasPenugasan = penugasan.filter((p) => {
      const duplicate = seen.has(p.kelas_id);
      seen.add(p.kelas_id);
      return !duplicate;
    });
    
    return uniqueKelasPenugasan.filter(
      (kelas) => !kelasSudahJadiPeserta.includes(kelas.nama_kelas)
    );
  }, [penugasan, data]);

  const classNameToIdMap = useMemo(() => {
    console.log('[DEBUG] Membuat classNameToIdMap dari penugasan:', penugasan);
    
    const map = new Map<string, string>();
    const seenKelas = new Set<string>();
    
    penugasan.forEach((p, index) => {
      console.log(`[DEBUG] Processing penugasan[${index}]:`, p);
      
      if (!seenKelas.has(p.nama_kelas)) {
        if (p.kelas_id && p.kelas_id.trim() !== '') {
          map.set(p.nama_kelas, p.kelas_id);
          seenKelas.add(p.nama_kelas);
          console.log(`[DEBUG] Added mapping: "${p.nama_kelas}" -> "${p.kelas_id}"`);
        } else {
          console.warn(`[DEBUG] Kelas ID kosong untuk ${p.nama_kelas}:`, p);
        }
      }
    });
    
    console.log('[DEBUG] Final classNameToIdMap:', Array.from(map.entries()));
    return map;
  }, [penugasan]);

  // Calculate total peserta for generate button state
  const totalPeserta = useMemo(() => {
    if (!data) return 0;
    return Object.values(data).reduce((total, pesertaList) => total + pesertaList.length, 0);
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>;
    }

    if (!data || Object.keys(data).length === 0) {
      return (
        <Empty
          style={{ padding: '48px 0' }}
          description={<Text type="secondary">Belum ada peserta ujian.</Text>}
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {Object.entries(data).map(([namaKelas, pesertaList]) => {
          const kelasID = classNameToIdMap.get(namaKelas) || ''; 
          
          console.log(`[DEBUG] Rendering kelas "${namaKelas}" dengan ID: "${kelasID}"`);
          
          return (
            <Col xs={24} sm={24} md={12} key={namaKelas}>
              <Card
                size="small"
                title={
                  <Flex justify="space-between" align="center">
                    <Text strong>
                      <UsergroupAddOutlined style={{ marginRight: 8, color: '#1677ff' }}/>
                      {namaKelas}
                    </Text>
                    <Flex align='center' gap={8}>
                      <Tag color="blue">{`${pesertaList.length} Peserta`}</Tag>
                      <Popconfirm
                        title="Hapus peserta?"
                        onConfirm={() => {
                          console.log('✅ POPCONFIRM CONFIRMED: User confirmed deletion');
                          handleDeleteConfirmed(kelasID);
                        }}
                        onCancel={() => {
                          console.log('❌ POPCONFIRM CANCELED: User canceled deletion');
                        }}
                        okText="Hapus"
                        cancelText="Batal"
                        okType="danger"
                        placement="topRight"
                        disabled={!kelasID || kelasID.trim() === '' || deletePesertaMutation.isPending}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          size="small"
                          loading={deletePesertaMutation.isPending}
                          disabled={!kelasID || kelasID.trim() === '' || deletePesertaMutation.isPending}
                          style={{
                            opacity: (!kelasID || kelasID.trim() === '') ? 0.5 : 1
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[DELETE BUTTON] Kelas:', namaKelas, 'ID:', kelasID);
                            console.log('[DELETE BUTTON] Button clicked, Popconfirm should show...');
                            
                            if (!kelasID || kelasID.trim() === '') {
                              const errorMsg = `Gagal menghapus: ID Kelas untuk "${namaKelas}" tidak ditemukan.`;
                              console.error('[DELETE BUTTON ERROR]', errorMsg);
                              message.error(errorMsg);
                            }
                          }}
                        />
                      </Popconfirm>
                    </Flex>
                  </Flex>
                }
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  columns={columns}
                  dataSource={pesertaList}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      <DebugPesertaUjian 
        penugasan={penugasan}
        data={data}
        ujianMasterId={ujianMasterId}
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: 16, 
        gap: 16, 
        flexWrap: 'wrap' 
      }}>
        {/* IMPROVED: Generate Nomor Ujian Section - Minimalis & Blue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            placeholder="Kode ujian (opsional)"
            value={kodeUjianPrefix}
            onChange={(e) => setKodeUjianPrefix(e.target.value.toUpperCase())}
            style={{ 
              width: 160,
              borderRadius: '6px'
            }}
            maxLength={8}
            disabled={generateNomorUjianMutation.isPending || totalPeserta === 0}
          />
          <Button
            icon={<ThunderboltOutlined />}
            type="primary"
            size="middle"
            onClick={handleGenerateNomorUjian}
            loading={generateNomorUjianMutation.isPending}
            disabled={totalPeserta === 0}
            style={{
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            {generateNomorUjianMutation.isPending ? 'Generating...' : 'Generate'}
          </Button>
          {totalPeserta > 0 && (
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 4 }}>
              {kodeUjianPrefix ? (
                <>Preview: {kodeUjianPrefix}001, {kodeUjianPrefix}002...</>
              ) : (
                <>Default: EXAM001, EXAM002... ({totalPeserta} peserta)</>
              )}
            </Text>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            disabled={availableKelasForDropdown.length === 0}
            style={{ borderRadius: '6px' }}
          >
            Tambah Peserta
          </Button>
        </div>
      </div>
      
      {renderContent()}

      <Modal
        title="Tambah Peserta dari Kelas"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={addPesertaMutation.isPending}
        destroyOnClose
      >
        <Form form={form} onFinish={handleFinish} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="kelas_id"
            label="Pilih Kelas"
            rules={[{ required: true, message: 'Silakan pilih kelas' }]}
          >
            <Select
              placeholder="Pilih kelas yang siswanya akan ditambahkan"
              options={availableKelasForDropdown.map((k) => ({
                value: k.kelas_id,
                label: k.nama_kelas,
              }))}
            />
          </Form.Item>
          <Alert
            message="Semua siswa dari kelas yang dipilih akan ditambahkan."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </>
  );
};

export default PesertaUjianTab;