import { useState, useMemo } from 'react';
import {
  Spin,
  Empty,
  Collapse,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  message,
  Alert,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian, PenugasanUjian } from '../../types';
import { addPesertaFromKelas } from '../../api/ujianMaster';

const { Panel } = Collapse;
const { Text } = Typography;

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

  // Kode ini sekarang akan valid karena 'kelas_id' ada di tipe PenugasanUjian
  const uniqueKelas = useMemo(() => {
    const seen = new Set<string>();
    return penugasan.filter((p) => {
      const duplicate = seen.has(p.kelas_id);
      seen.add(p.kelas_id);
      return !duplicate;
    });
  }, [penugasan]);

  const columns: TableProps<PesertaUjian>['columns'] = [
    {
      title: 'No. Urut',
      dataIndex: 'urutan',
      key: 'urutan',
      width: 100,
      align: 'center',
    },
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
    },
    {
      title: 'NISN',
      dataIndex: 'nisn',
      key: 'nisn',
      render: (nisn) => nisn || '-',
    },
    {
      title: 'Nomor Ujian',
      dataIndex: 'nomor_ujian',
      key: 'nomor_ujian',
      render: (nomor) => nomor || <Text type="secondary">-</Text>,
    },
  ];

  return (
    <>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          disabled={uniqueKelas.length === 0}
        >
          Tambah Peserta
        </Button>
      </div>

      {isLoading ? (
        <Spin style={{ display: 'block', margin: '24px auto' }} />
      ) : !data || Object.keys(data).length === 0 ? (
        <Empty description="Klik 'Tambah Peserta' untuk memulai." />
      ) : (
        <Collapse accordion defaultActiveKey={Object.keys(data)[0]}>
          {Object.entries(data).map(([namaKelas, pesertaList]) => (
            <Panel header={`${namaKelas} (${pesertaList.length} Peserta)`} key={namaKelas}>
              <Table
                columns={columns}
                dataSource={pesertaList}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Panel>
          ))}
        </Collapse>
      )}

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
                value: k.kelas_id, // Baris ini juga sekarang valid
                label: k.nama_kelas,
              }))}
            />
          </Form.Item>
          <Alert
            message="Semua siswa dari kelas yang dipilih akan ditambahkan sebagai peserta. Jika siswa sudah ada, data tidak akan digandakan."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </>
  );
};

export default PesertaUjianTab;