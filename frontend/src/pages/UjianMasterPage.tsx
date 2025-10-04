// frontend/src/pages/UjianMasterPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Select, Spin, Table, Typography, message, Modal, Form, Input, Popconfirm, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllUjianMaster, createUjianMaster, deleteUjianMaster, updateUjianMaster } from '../api/ujianMaster';
import type { TahunAjaran, UjianMaster, UpsertUjianMasterInput } from '../types';
import { format } from 'date-fns';

const { Title } = Typography;

const UjianMasterPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUjian, setEditingUjian] = useState<UjianMaster | null>(null);

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
        setIsModalOpen(false);
    },
    onError: (error: any) => {
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

  const showModal = (ujian: UjianMaster | null) => {
    setEditingUjian(ujian);
    form.setFieldsValue(ujian || {
        nama_paket_ujian: '',
    });
    setIsModalOpen(true);
  };

  const handleFinish = (values: any) => {
    if (!selectedTahunAjaran) return;
    const payload: UpsertUjianMasterInput = {
        ...values,
        tahun_ajaran_id: selectedTahunAjaran,
    };
    mutation.mutate({ isEditing: !!editingUjian, id: editingUjian?.id, payload });
  };

  const columns = [
    {
      title: 'Nama Paket Ujian',
      dataIndex: 'nama_paket_ujian',
      key: 'nama_paket_ujian',
      render: (text: string, record: UjianMaster) => (
        <a onClick={() => navigate(`/admin/ujian/${record.id}`)}>{text}</a>
      ),
    },
    { title: 'Dibuat', dataIndex: 'created_at', key: 'created_at', render: (text:string) => format(new Date(text), 'dd/MM/yyyy')},
    {
        title: 'Aksi',
        key: 'action',
        render: (_: any, record: UjianMaster) => (
            <Space>
                <Button icon={<EditOutlined/>} onClick={() => showModal(record)} />
                <Popconfirm title="Hapus paket ujian ini?" onConfirm={() => deleteMutation.mutate(record.id)}>
                    <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
            </Space>
        )
    }
  ];

  const isLoading = isTahunAjaranLoading || (!!selectedTahunAjaran && isUjianLoading);

  return (
    <>
        <Card>
            <Title level={4}>Manajemen Paket Ujian</Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Select
                style={{ width: 250 }}
                placeholder="Pilih Tahun Ajaran"
                value={selectedTahunAjaran}
                onChange={(value) => setSelectedTahunAjaran(value)}
                loading={isTahunAjaranLoading}
                options={tahunAjaranData?.map(ta => ({
                    label: `${ta.nama_tahun_ajaran} - ${ta.semester}`,
                    value: ta.id,
                }))}
                />
                <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal(null)}
                >
                Buat Paket Ujian Baru
                </Button>
            </div>

            <Spin spinning={isLoading}>
                <Table
                dataSource={ujianData}
                columns={columns}
                rowKey="id"
                pagination={false}
                />
            </Spin>
        </Card>
        <Modal
            title={editingUjian ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
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