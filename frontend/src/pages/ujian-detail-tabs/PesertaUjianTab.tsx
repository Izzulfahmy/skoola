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
import { PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
import { addPesertaFromKelas } from '../../api/ujianMaster';

const { Text } = Typography;

const denseCellStyle = {
  padding: '6px 8px',
};
const denseHeaderStyle = {
  padding: '8px 8px',
  backgroundColor: '#fafafa',
};

// Style tambahan untuk kolom nama agar bisa wrap
const nameCellStyle = {
  ...denseCellStyle,
  whiteSpace: 'normal' as const, // Memaksa teks untuk wrap
  wordBreak: 'break-word' as const,
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
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      // --- PERUBAHAN DI SINI: Menerapkan style untuk text wrap ---
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
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Gagal menambahkan peserta.');
    },
  });

  const handleFinish = (values: { kelas_id: string }) => {
    addPesertaMutation.mutate(values.kelas_id);
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
        {Object.entries(data).map(([namaKelas, pesertaList]) => (
          <Col xs={24} sm={24} md={12} key={namaKelas}>
            <Card
              size="small"
              title={
                <Flex justify="space-between" align="center">
                  <Text strong>
                    <UsergroupAddOutlined style={{ marginRight: 8, color: '#1677ff' }}/>
                    {namaKelas}
                  </Text>
                  <Tag color="blue">{`${pesertaList.length} Peserta`}</Tag>
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
        ))}
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