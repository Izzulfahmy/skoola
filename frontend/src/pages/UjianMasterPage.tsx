import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Select,
  Spin,
  Table,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllUjianMaster, createUjianMaster, deleteUjianMaster, updateUjianMaster } from '../api/ujianMaster';
import type { TahunAjaran, UjianMaster, UpsertUjianMasterInput } from '../types';
import type { TableProps } from 'antd';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const { Title, Text } = Typography;

// ---
// Karena kita tidak dapat menjamin CSS global dimuat, 
// kita akan menggunakan inline style di onRow Ant Design untuk cursor: pointer.
// ---

const UjianMasterPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUjian, setEditingUjian] = useState<UjianMaster | null>(null);

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: '#fafafa',
    fontWeight: 500,
  };

  const { data: tahunAjaranData, isLoading: isTahunAjaranLoading } = useQuery<TahunAjaran[]>({
    queryKey: ['tahunAjaran'],
    queryFn: getAllTahunAjaran,
  });

  useEffect(() => {
    if (tahunAjaranData && !selectedTahunAjaran) {
      const activeTahunAjaran = tahunAjaranData.find(ta => ta.status === 'Aktif');
      if (activeTahunAjaran) {
        setSelectedTahunAjaran(activeTahunAjaran.id);
      } else if (tahunAjaranData.length > 0) {
        // Fallback: pilih tahun ajaran pertama jika tidak ada yang aktif
        setSelectedTahunAjaran(tahunAjaranData[0].id);
      }
    }
  }, [tahunAjaranData, selectedTahunAjaran]);

  const { data: ujianData, isLoading: isUjianLoading, isError } = useQuery<UjianMaster[]>({
    queryKey: ['ujianMaster', selectedTahunAjaran],
    queryFn: () => getAllUjianMaster(selectedTahunAjaran!),
    enabled: !!selectedTahunAjaran,
  });

  const mutation = useMutation({
    mutationFn: (values: {
        isEditing: boolean;
        id?: string;
        payload: UpsertUjianMasterInput;
    }) => {
        return values.isEditing
            ? updateUjianMaster(values.id!, values.payload)
            : createUjianMaster(values.payload);
    },
    onSuccess: () => {
        message.success(`Paket ujian berhasil ${editingUjian ? 'diperbarui' : 'dibuat'}!`);
        queryClient.invalidateQueries({ queryKey: ['ujianMaster', selectedTahunAjaran] });
        handleCancel();
    },
    onError: (error: any) => {
        // Akses response.data.message jika tersedia, atau gunakan pesan default
        message.error(error.response?.data?.message || 'Gagal menyimpan paket ujian.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUjianMaster,
    onSuccess: () => {
        message.success('Paket ujian berhasil dihapus!');
        queryClient.invalidateQueries({ queryKey: ['ujianMaster', selectedTahunAjaran] });
    },
    onError: (error: any) => {
        message.error(error.response?.data?.message || 'Gagal menghapus paket ujian.');
    }
  });
  
  if (isError) {
      message.error("Gagal memuat data paket ujian. Silakan coba lagi.");
  }
  
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUjian(null);
    form.resetFields();
  }

  const showModal = (ujian: UjianMaster | null) => {
    setEditingUjian(ujian);
    if (ujian) {
      form.setFieldsValue(ujian);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleFinish = (values: any) => {
    if (!selectedTahunAjaran) {
        message.error("Tahun ajaran belum dipilih.");
        return;
    };
    const payload: UpsertUjianMasterInput = {
        ...values,
        tahun_ajaran_id: selectedTahunAjaran,
    };
    mutation.mutate({ isEditing: !!editingUjian, id: editingUjian?.id, payload });
  };
  
  const handleRowClick = (record: UjianMaster) => {
      navigate(`/admin/ujian/${record.id}`);
  };


  const columns: TableProps<UjianMaster>['columns'] = [
    {
      title: 'Nama Paket Ujian',
      dataIndex: 'nama_paket_ujian',
      key: 'nama_paket_ujian',
      // Mengubah render agar tidak lagi menjadi link, karena seluruh baris akan menjadi link
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { 
      title: 'Dibuat', 
      dataIndex: 'created_at', 
      key: 'created_at', 
      align: 'center',
      width: 150,
      render: (text:string) => format(new Date(text), 'd MMM yyyy', { locale: id }),
      responsive: ['md'],
    },
    {
        title: 'Aksi',
        key: 'action',
        align: 'center',
        width: 120,
        render: (_: any, record: UjianMaster) => (
            // Menghentikan penyebaran event klik agar klik tombol Aksi tidak memicu handleRowClick
            <Space onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Edit">
                  <Button icon={<EditOutlined/>} onClick={() => showModal(record)} size="small" />
                </Tooltip>
                <Tooltip title="Hapus">
                  <Popconfirm 
                    title="Hapus paket ujian?"
                    description="Aksi ini tidak dapat dibatalkan."
                    onConfirm={() => deleteMutation.mutate(record.id)}
                    okText="Ya, Hapus"
                    cancelText="Batal"
                  >
                      <Button icon={<DeleteOutlined />} danger size="small" />
                  </Popconfirm>
                </Tooltip>
            </Space>
        )
    }
  ];

  const isLoading = isTahunAjaranLoading || (!!selectedTahunAjaran && isUjianLoading) || mutation.isPending || deleteMutation.isPending;

  return (
    <>
        <Card bordered={false}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                    <Title level={4} style={{ margin: 0 }}>Manajemen Paket Ujian</Title>
                </Col>
                <Col>
                    <Space wrap align="center" style={{ display: 'flex', justifyContent: 'end' }}>
                        <Select
                            style={{ width: 250 }}
                            placeholder="Pilih Tahun Ajaran"
                            value={selectedTahunAjaran}
                            onChange={(value) => setSelectedTahunAjaran(value)}
                            loading={isTahunAjaranLoading}
                            options={tahunAjaranData?.map(ta => ({
                                label: `${ta.nama_tahun_ajaran} (${ta.semester})`,
                                value: ta.id,
                            }))}
                        />
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => showModal(null)}
                            disabled={!selectedTahunAjaran} // Nonaktifkan jika tahun ajaran belum dipilih
                        >
                            Buat Paket
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Spin spinning={isLoading}>
                <Table
                    style={{ marginTop: 24 }}
                    dataSource={ujianData}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    components={{
                        header: {
                          cell: (props: any) => <th {...props} style={tableHeaderStyle} />,
                        },
                    }}
                    // --- Bagian perbaikan agar baris terlihat 'clickable' ---
                    // rowClassName="clickable-row" // Tidak diperlukan jika style inline
                    onRow={(record) => {
                        return {
                            onClick: () => handleRowClick(record),
                            style: { cursor: 'pointer' }, // Tambahkan style kursor di sini
                        };
                    }}
                    // --------------------------------------------------------
                />
            </Spin>
            {/* Menambahkan peringatan jika tahun ajaran belum dipilih dan data ujian belum dimuat */}
            {!selectedTahunAjaran && !isTahunAjaranLoading && (
                 <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Silakan pilih Tahun Ajaran untuk melihat dan mengelola Paket Ujian.</Text>
                 </div>
            )}
        </Card>
        <Modal
            title={editingUjian ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
            open={isModalOpen}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} style={{marginTop: 24}}>
                 <Form.Item name="nama_paket_ujian" label="Nama Paket Ujian" rules={[{ required: true, message: 'Nama paket ujian tidak boleh kosong' }]}>
                    <Input placeholder="Contoh: Ujian Tengah Semester Ganjil" />
                </Form.Item>
            </Form>
        </Modal>
    </>
  );
};

export default UjianMasterPage;