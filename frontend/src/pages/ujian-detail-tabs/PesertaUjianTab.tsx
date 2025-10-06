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
  Tooltip,
  Table,
  Tag,
  Row,
  Col,
  Card,
  Flex,
} from 'antd';
// Mengimpor ikon yang dibutuhkan
import { PlusOutlined, UsergroupAddOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
// Mengimpor fungsi API yang dibutuhkan
import { addPesertaFromKelas, deletePesertaFromKelas } from '../../api/ujianMaster'; 
import type { CSSProperties } from 'react'; // PENTING: Mengimpor tipe untuk style

// --- Tipe untuk error dari Axios (FIX Code 2339) ---
interface AxiosErrorResponse {
  data?: {
    message: string;
    deletedCount?: number;
  };
}
interface AxiosErrorType extends Error {
  response?: AxiosErrorResponse;
}
// --------------------------------------------------

const { Text } = Typography;
const { confirm } = Modal;

const denseCellStyle: CSSProperties = { // Tipe CSSProperties untuk style
  padding: '6px 8px',
};
const denseHeaderStyle: CSSProperties = {
  padding: '8px 8px',
  backgroundColor: '#fafafa',
};

// Style tambahan untuk kolom nama agar bisa wrap
const nameCellStyle: CSSProperties = { // FIX Code 2322: Tipe eksplisit dan properti yang aman
  ...denseCellStyle,
  whiteSpace: 'normal',
  overflowWrap: 'break-word', // Mengganti 'wordBreak' yang bermasalah di TS
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
    onError: (err: AxiosErrorType) => { // FIX Code 2339
      message.error(err.response?.data?.message || 'Gagal menambahkan peserta.');
    },
  });

  const deletePesertaMutation = useMutation({
    mutationFn: (kelasId: string) => deletePesertaFromKelas(ujianMasterId, kelasId),
    onSuccess: (response) => {
      message.success(response.message || `Berhasil menghapus ${response.deletedCount || 0} peserta.`);
      queryClient.invalidateQueries({ queryKey: ['pesertaUjian', ujianMasterId] });
    },
    onError: (err: AxiosErrorType) => { // FIX Code 2339
      message.error(err.response?.data?.message || 'Gagal menghapus peserta ujian.');
    },
  });

  // FIX Code 7006: Tambahkan tipe untuk 'values'
  const handleFinish = (values: { kelas_id: string }) => {
    addPesertaMutation.mutate(values.kelas_id);
  };

  // --- Konfirmasi dan handler hapus ---
  // FIX Code 7006: Tambahkan tipe untuk 'kelasID' dan 'namaKelas'
  const handleRemovePeserta = (kelasID: string, namaKelas: string) => {
    confirm({
      title: `Hapus semua peserta dari kelas ${namaKelas}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Aksi ini akan menghapus semua siswa dari kelas ini dari daftar peserta ujian. Apakah Anda yakin?',
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        deletePesertaMutation.mutate(kelasID);
      },
      // PENTING: Menambahkan okButtonProps untuk loading state
      okButtonProps: { loading: deletePesertaMutation.isPending }, 
    });
  };
  // ------------------------------------

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

  // --- Membuat map nama kelas ke ID kelas (PENTING) ---
  const classNameToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    const seenKelas = new Set<string>();
    penugasan.forEach(p => {
      if (!seenKelas.has(p.nama_kelas)) {
          map.set(p.nama_kelas, p.kelas_id);
          seenKelas.add(p.nama_kelas);
      }
    });
    return map;
  }, [penugasan]);
  // -----------------------------------------------------

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>;
    }

    if (!data || Object.keys(data).length === 0) {
      return (
        <Empty
          style={{ padding: '48px 0' }}
          description={
            <Text type="secondary">Belum ada peserta ujian.</Text>
          }
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {Object.entries(data).map(([namaKelas, pesertaList]) => {
          // Mendapatkan kelasID dari map
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
                    {/* --- KONTEN DELETE BUTTON --- */}
                    <Flex align='center' gap={8}>
                      <Tag color="blue">{`${pesertaList.length} Peserta`}</Tag>
                      <Tooltip title="Hapus semua peserta di kelas ini">
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Mencegah event lain yang mungkin ada di Card
                            
                            // *** LOGIKA KRITIS: Pengecekan kelasID ***
                            if (kelasID) {
                                handleRemovePeserta(kelasID, namaKelas);
                            } else {
                                // Tampilkan pesan error jika ID tidak ditemukan, 
                                // ini adalah indikator bahwa data 'penugasan' tidak sinkron
                                console.error(`[DELETE ERROR] ID Kelas untuk ${namaKelas} tidak ditemukan. Periksa data penugasan.`, {namaKelas, penugasan});
                                message.error(`Gagal menghapus: ID Kelas untuk ${namaKelas} tidak ditemukan.`);
                            }
                          }}
                          // Nonaktifkan jika ID tidak ada atau sedang loading
                          loading={deletePesertaMutation.isPending}
                          disabled={!kelasID || deletePesertaMutation.isPending}
                        />
                      </Tooltip>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 16 }}>
        <Tooltip
          title={
            availableKelasForDropdown.length === 0 ? 'Semua kelas yang ditugaskan sudah menjadi peserta' : ''
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            disabled={availableKelasForDropdown.length === 0}
          >
            Tambah Peserta
          </Button>
        </Tooltip>
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