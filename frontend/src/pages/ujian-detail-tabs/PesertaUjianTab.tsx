import { useState, useMemo, useEffect } from 'react';
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
  Upload,
  Dropdown,
} from 'antd';
import { 
  PlusOutlined, 
  UsergroupAddOutlined, 
  DeleteOutlined, 
  ThunderboltOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
import { 
  addPesertaFromKelas, 
  deletePesertaFromKelas, 
  generateNomorUjian,
  exportPesertaToExcel,
  importPesertaFromExcel
} from '../../api/ujianMaster'; 
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
  const [isMobile, setIsMobile] = useState(false);
  const queryClient = useQueryClient();

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SMART PADDING: Calculate total peserta and preview format
  const { totalPeserta, previewFormat } = useMemo(() => {
    if (!data) return { totalPeserta: 0, previewFormat: '001' };
    
    const total = Object.values(data).reduce((sum, pesertaList) => sum + pesertaList.length, 0);
    let digits: number;
    
    if (total < 1000) {
      digits = 3;  // 001
    } else if (total < 10000) {
      digits = 4;  // 0001
    } else if (total < 100000) {
      digits = 5;  // 00001
    } else if (total < 1000000) {
      digits = 6;  // 000001
    } else {
      digits = 7;  // 0000001
    }

    const format = '0'.repeat(digits) + '1';
    return { totalPeserta: total, previewFormat: format };
  }, [data]);

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
      return deletePesertaFromKelas(ujianMasterId, kelasId);
    },
    onSuccess: (response) => {
      message.success(response.message || `Berhasil menghapus ${response.deletedCount || 0} peserta.`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
    },
    onError: (err: AxiosErrorType) => {
      message.error(err.response?.data?.message || 'Gagal menghapus peserta ujian.');
    },
  });

  const generateNomorUjianMutation = useMutation({
    mutationFn: (prefix: string) => {
      return generateNomorUjian(ujianMasterId, { prefix });
    },
    onSuccess: (response) => {
      message.success(response.message || `Berhasil generate ${response.generatedCount || response.generated_count || 0} nomor ujian!`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      setKodeUjianPrefix('');
    },
    onError: (err: AxiosErrorType) => {
      message.error(err.response?.data?.message || 'Gagal generate nomor ujian.');
    },
  });

  // Excel Export/Import functions
  const exportToExcel = async (format: 'xlsx' | 'csv') => {
    try {
      const blob = await exportPesertaToExcel(ujianMasterId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `peserta_ujian_${new Date().toISOString().split('T')[0]}.${format}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success(`File ${format.toUpperCase()} berhasil didownload!`);
    } catch (error: any) {
      message.error(`Gagal export ke ${format.toUpperCase()}: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleImportFile = async (file: File) => {
    const hide = message.loading('Mengimport data...', 0);
    
    try {
      const response = await importPesertaFromExcel(ujianMasterId, file);
      hide();
      
      const result = response.data;
      
      if (result.errorRows && result.errorRows.length > 0) {
        // Show detailed error modal
        Modal.info({
          title: 'Import Summary',
          width: isMobile ? '90%' : 600,
          content: (
            <div>
              <p><strong>✅ Berhasil: {result.updatedCount} data</strong></p>
              <p><strong>❌ Error: {result.errorRows.length} data</strong></p>
              
              {result.errorRows.length > 0 && (
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 16 }}>
                  <strong>Detail Error:</strong>
                  <ul style={{ marginTop: 8 }}>
                    {result.errorRows.map((error: any, index: number) => (
                      <li key={index}>
                        <Text type="danger">
                          Baris {error.row}: {error.error}
                          {error.namaLengkap && ` (${error.namaLengkap})`}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
        });
      } else {
        message.success(result.message);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
      
    } catch (error: any) {
      hide();
      message.error(`Gagal import: ${error.response?.data?.message || error.message}`);
    }
    
    return false; // Prevent auto upload
  };

  const handleFinish = (values: { kelas_id: string }) => {
    addPesertaMutation.mutate(values.kelas_id);
  };

  const handleDeleteConfirmed = async (kelasID: string) => {
    try {
      const hide = message.loading('Menghapus peserta...', 0);
      await deletePesertaMutation.mutateAsync(kelasID);
      hide();
    } catch (error: any) {
      message.error(`Gagal menghapus peserta: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateNomorUjian = () => {
    const prefix = kodeUjianPrefix.trim();
    generateNomorUjianMutation.mutate(prefix);
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
    const map = new Map<string, string>();
    const seenKelas = new Set<string>();
    
    penugasan.forEach((p) => {
      if (!seenKelas.has(p.nama_kelas)) {
        if (p.kelas_id && p.kelas_id.trim() !== '') {
          map.set(p.nama_kelas, p.kelas_id);
          seenKelas.add(p.nama_kelas);
        }
      }
    });
    
    return map;
  }, [penugasan]);

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
                          handleDeleteConfirmed(kelasID);
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
                            if (!kelasID || kelasID.trim() === '') {
                              const errorMsg = `Gagal menghapus: ID Kelas untuk "${namaKelas}" tidak ditemukan.`;
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
        alignItems: isMobile ? 'stretch' : 'center',
        paddingBottom: 16, 
        gap: 12, 
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        {/* Generate Section - ULTRA MINIMALIST */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          <Input
            placeholder="Kode"
            value={kodeUjianPrefix}
            onChange={(e) => setKodeUjianPrefix(e.target.value.toUpperCase())}
            style={{ 
              width: 70,
              borderRadius: '4px',
              fontSize: '13px'
            }}
            maxLength={6}
            disabled={generateNomorUjianMutation.isPending || totalPeserta === 0}
          />
          
          {/* ICON-ONLY GENERATE BUTTON - NO TEXT */}
          <Button
            icon={<ThunderboltOutlined />}
            type="primary"
            onClick={handleGenerateNomorUjian}
            loading={generateNomorUjianMutation.isPending}
            disabled={totalPeserta === 0}
            style={{
              borderRadius: '4px',
              minWidth: 32,
              width: 32,
              height: 32,
              padding: 0,
            }}
            title="Generate Nomor Ujian"
          />
          
          {/* SMART PREVIEW */}
          {totalPeserta > 0 && (
            <Text type="secondary" style={{ fontSize: '10px', marginLeft: 4 }}>
              {isMobile ? (
                // Mobile: Short format
                `(${totalPeserta})`
              ) : (
                // Desktop: Full format
                <>
                  {kodeUjianPrefix ? `${kodeUjianPrefix}${previewFormat}...` : `${previewFormat}...`} ({totalPeserta.toLocaleString()})
                </>
              )}
            </Text>
          )}
        </div>

        {/* Action Buttons - CONDITIONAL TEXT */}
        <div style={{ display: 'flex', gap: 6, justifyContent: isMobile ? 'center' : 'flex-end' }}>
          {/* Export Dropdown */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'excel',
                  label: 'Export Excel (.xlsx)',
                  icon: <FileExcelOutlined />,
                  onClick: () => exportToExcel('xlsx'),
                },
                {
                  key: 'csv',
                  label: 'Export CSV (.csv)',
                  icon: <DownloadOutlined />,
                  onClick: () => exportToExcel('csv'),
                },
              ],
            }}
            disabled={totalPeserta === 0}
            placement="bottomRight"
          >
            <Button
              icon={<DownloadOutlined />}
              disabled={totalPeserta === 0}
              style={{ borderRadius: '4px' }}
              title="Export Data"
            >
              {!isMobile && (
                <>Export <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} /></>
              )}
            </Button>
          </Dropdown>

          {/* Import Button */}
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleImportFile}
            disabled={totalPeserta === 0}
          >
            <Button
              icon={<UploadOutlined />}
              disabled={totalPeserta === 0}
              style={{ borderRadius: '4px' }}
              title="Import Excel"
            >
              {!isMobile && 'Import'}
            </Button>
          </Upload>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            disabled={availableKelasForDropdown.length === 0}
            style={{ borderRadius: '4px' }}
            title="Tambah Peserta"
          >
            {!isMobile && 'Tambah'}
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
        width={isMobile ? '90%' : 520}
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