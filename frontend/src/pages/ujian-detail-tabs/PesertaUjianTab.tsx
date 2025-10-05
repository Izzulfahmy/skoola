import { useState, useMemo } from 'react';
import {
  Spin,
  Empty,
  Collapse,
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
  Flex, // Import Flex untuk layout
} from 'antd';
import { PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
import { addPesertaFromKelas } from '../../api/ujianMaster';

const { Panel } = Collapse;
const { Text } = Typography;

const denseCellStyle = {
  padding: '6px 8px',
};
const denseHeaderStyle = {
  padding: '8px 8px',
  backgroundColor: '#fafafa',
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
      render: (text) => <Text strong>{text}</Text>,
      onHeaderCell: () => ({ style: denseHeaderStyle }),
      onCell: () => ({ style: denseCellStyle }),
    },
    {
      title: 'NISN',
      dataIndex: 'nisn',
      key: 'nisn',
      width: 160,
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
      width: 180,
      responsive: ['sm'],
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

  const uniqueKelas = useMemo(() => {
    const seen = new Set<string>();
    return penugasan.filter((p) => {
      const duplicate = seen.has(p.kelas_id);
      seen.add(p.kelas_id);
      return !duplicate;
    });
  }, [penugasan]);

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>;
    }

    if (!data || Object.keys(data).length === 0) {
      return (
        <Empty
          style={{ padding: '48px 0', background: '#fff' }}
          description={
            <Text type="secondary">Belum ada peserta ujian.</Text>
          }
        />
      );
    }

    return (
      <Collapse ghost defaultActiveKey={Object.keys(data)} style={{ padding: 0 }}>
        {Object.entries(data).map(([namaKelas, pesertaList]) => (
          <Panel
            header={
              // --- PERUBAHAN DI SINI ---
              <Flex justify="space-between" align="center">
                <Text strong>
                  <UsergroupAddOutlined style={{ marginRight: 8, color: '#1677ff' }}/>
                  {namaKelas}
                </Text>
                <Tag color="blue">{`${pesertaList.length} Peserta`}</Tag>
              </Flex>
            }
            key={namaKelas}
            style={{ padding: '0 !important', margin: 0 }}
          >
            <Table
              columns={columns}
              dataSource={pesertaList}
              rowKey="id"
              size="small"
              pagination={false}
              style={{ marginTop: '-16px', marginBottom: '-16px' }}
            />
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 16 }}>
        <Tooltip
          title={
            uniqueKelas.length === 0 ? 'Daftarkan kelas di tab "Kelas" terlebih dahulu' : ''
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            disabled={uniqueKelas.length === 0}
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
              options={uniqueKelas.map((k) => ({
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