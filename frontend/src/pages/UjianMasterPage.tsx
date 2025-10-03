// file: frontend/src/pages/UjianMasterPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Table,
  notification,
  Select,
  Alert,
  Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, BuildOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTahunAjaran } from '../hooks/useTahunAjaran';
import {
  getAllUjianMaster,
  createUjianMaster,
  deleteUjianMaster,
} from '../api/ujianMaster';
import type { UjianMaster, UpsertUjianMasterInput, TahunAjaranOption } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const UjianMasterPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { tahunAjaranOptions, activeTahunAjaran } = useTahunAjaran();
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<TahunAjaranOption | null>(null);

  useEffect(() => {
    if (activeTahunAjaran) {
      setSelectedTahunAjaran(activeTahunAjaran);
    } else if (tahunAjaranOptions.length > 0) {
      setSelectedTahunAjaran(tahunAjaranOptions[0]);
    }
  }, [activeTahunAjaran, tahunAjaranOptions]);

  const { data: ujianMasterData, isLoading } = useQuery<UjianMaster[]>({
    queryKey: ['ujianMasterList', selectedTahunAjaran?.id],
    queryFn: () => getAllUjianMaster(selectedTahunAjaran!.id),
    enabled: !!selectedTahunAjaran?.id,
  });

  const createMutation = useMutation({
    mutationFn: createUjianMaster,
    onSuccess: () => {
      api.success({
        message: 'Sukses',
        description: 'Paket Ujian baru berhasil dibuat.',
      });
      queryClient.invalidateQueries({ queryKey: ['ujianMasterList', selectedTahunAjaran?.id] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      api.error({
        message: 'Gagal',
        description: error.response?.data?.error || 'Terjadi kesalahan saat membuat paket ujian.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUjianMaster,
    onSuccess: () => {
      api.success({
        message: 'Sukses',
        description: 'Paket Ujian berhasil dihapus.',
      });
      queryClient.invalidateQueries({ queryKey: ['ujianMasterList', selectedTahunAjaran?.id] });
    },
    onError: (error: any) => {
      api.error({
        message: 'Gagal',
        description: error.response?.data?.error || 'Terjadi kesalahan saat menghapus paket ujian.',
      });
    },
  });

  const handleFinish = (values: any) => {
    const payload: UpsertUjianMasterInput = {
      nama_paket_ujian: values.nama_paket_ujian,
      tahun_ajaran_id: values.tahun_ajaran_id,
    };
    createMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Anda yakin ingin menghapus paket ujian ini?',
      content: 'Tindakan ini tidak dapat dibatalkan.',
      okText: 'Ya, Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: () => {
        deleteMutation.mutate(id);
      },
    });
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: '5%',
    },
    {
      title: 'Nama Paket Ujian',
      dataIndex: 'nama_paket_ujian',
      key: 'nama_paket_ujian',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: UjianMaster) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/ujian-detail/${record.id}`)}
          >
            Lihat Penugasan
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Hapus
          </Button>
        </Space>
      ),
      width: '30%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}><BuildOutlined /> Manajemen Paket Ujian</Title>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space>
                <Text>Tahun Ajaran:</Text>
                <Select
                    value={selectedTahunAjaran?.id}
                    style={{ width: 250 }}
                    onChange={(value) => {
                    const selected = tahunAjaranOptions.find(ta => ta.id === value);
                    setSelectedTahunAjaran(selected || null);
                    }}
                    placeholder="Pilih Tahun Ajaran"
                >
                    {tahunAjaranOptions.map(ta => (
                    <Option key={ta.id} value={ta.id}>{ta.nama}</Option>
                    ))}
                </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.setFieldsValue({ tahun_ajaran_id: selectedTahunAjaran?.id });
                setIsModalOpen(true);
              }}
              disabled={tahunAjaranOptions.length === 0}
            >
              Tambah Paket Ujian Baru
            </Button>
          </div>

          {!selectedTahunAjaran ? (
            <Alert
              message="Silakan Pilih Tahun Ajaran"
              description="Pilih tahun ajaran dari dropdown di atas untuk melihat atau menambah paket ujian."
              type="info"
              showIcon
            />
          ) : (
            <Table
              columns={columns}
              dataSource={ujianMasterData}
              loading={isLoading}
              rowKey="id"
              bordered
            />
          )}
        </Card>
      </Space>
      <Modal
        title="Tambah Paket Ujian Baru"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createMutation.isPending}
            onClick={() => form.submit()}
          >
            Simpan
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="tahun_ajaran_id"
            label="Tahun Ajaran"
            rules={[{ required: true, message: 'Tahun Ajaran wajib dipilih!' }]}
          >
            <Select placeholder="Pilih Tahun Ajaran untuk paket ujian ini">
              {tahunAjaranOptions.map(ta => (
                <Option key={ta.id} value={ta.id}>
                  {ta.nama} <Tag color={ta.status === 'Aktif' ? 'green' : 'default'}>{ta.status}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="nama_paket_ujian"
            label="Nama Paket Ujian"
            rules={[{ required: true, message: 'Nama Paket Ujian wajib diisi!' }]}
          >
            <Input placeholder="Contoh: Ujian Akhir Semester Ganjil 2024/2025" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UjianMasterPage;