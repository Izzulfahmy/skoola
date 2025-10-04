// frontend/src/pages/UjianDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Modal, Table, Form, Cascader, Typography, Spin, Empty, Card, Breadcrumb } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUjianMasterById, assignUjianToKelas } from '../api/ujianMaster';
import type { UjianDetail } from '../types';

const { Title } = Typography;

const UjianDetailPage = () => {
  const { id: ujianMasterId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ujianDetail, isLoading, isError, error } = useQuery<UjianDetail>({
    queryKey: ['ujianDetail', ujianMasterId],
    queryFn: () => getUjianMasterById(ujianMasterId!),
    enabled: !!ujianMasterId,
  });

  const mutation = useMutation({
    mutationFn: (pengajarKelasIds: string[]) => {
        if (!ujianMasterId) throw new Error("ID Master Ujian tidak ditemukan");
        return assignUjianToKelas(ujianMasterId, { pengajar_kelas_ids: pengajarKelasIds });
    },
    onSuccess: () => {
        message.success('Kelas berhasil ditugaskan untuk ujian ini!');
        queryClient.invalidateQueries({ queryKey: ['ujianDetail', ujianMasterId] });
        setIsModalOpen(false);
        form.resetFields();
    },
    onError: (err: any) => {
        message.error(err.response?.data?.message || 'Gagal menugaskan kelas.');
    }
  });

  const handleFinish = (values: { kelas: string[][] }) => {
    const pengajarKelasIds = values.kelas.map(k => k[k.length - 1]);
    if (pengajarKelasIds.length === 0) {
        message.warning("Pilih setidaknya satu kelas.");
        return;
    }
    mutation.mutate(pengajarKelasIds);
  };

  const columns = [
      { title: 'Kelas', dataIndex: 'nama_kelas', key: 'kelas' },
      { title: 'Mata Pelajaran', dataIndex: 'nama_mapel', key: 'mapel' },
      { title: 'Guru', dataIndex: 'nama_guru', key: 'guru' },
  ];

  if (isLoading) return <Spin size="large" style={{ display: 'block', marginTop: '50px' }}/>;
  if (isError) {
      message.error(`Gagal memuat detail: ${error.message}`);
      return <Empty description="Gagal memuat detail paket ujian." />;
  }

  return (
    <Card>
       <Breadcrumb 
            items={[
                { title: <a onClick={() => navigate('/admin/ujian')}>Manajemen Ujian</a> },
                { title: 'Detail Paket Ujian' }
            ]}
            style={{ marginBottom: 16 }}
        />
      <Title level={4}>Detail Paket Ujian: {ujianDetail?.detail.nama_paket_ujian}</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
        disabled={!ujianDetail?.availableKelas || ujianDetail.availableKelas.length === 0}
      >
        Daftarkan Kelas
      </Button>

      <Table
        columns={columns}
        dataSource={ujianDetail?.penugasan || []}
        rowKey="pengajar_kelas_id"
        pagination={false}
        locale={{ emptyText: <Empty description="Belum ada kelas yang ditugaskan untuk paket ujian ini." /> }}
      />
      
      <Modal
        title="Daftarkan Kelas untuk Ujian"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={mutation.isPending}
        destroyOnClose
      >
        <Form form={form} onFinish={handleFinish} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="kelas" label="Pilih Kelas & Mata Pelajaran" rules={[{ required: true, message: "Pilih setidaknya satu" }]}>
            <Cascader
              options={ujianDetail?.availableKelas || []}
              multiple
              showCheckedStrategy={Cascader.SHOW_CHILD}
              placeholder="Pilih kelas dan mapel yang akan mengikuti ujian ini"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UjianDetailPage;