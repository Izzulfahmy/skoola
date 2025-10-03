// frontend/src/pages/UjianDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Modal, Table, Form, Cascader, Typography, Spin, Empty, Card, Breadcrumb } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getUjianDetails, assignUjianToKelas } from '../api/ujianMaster';
// PERUBAHAN DI SINI: Tambahkan 'type'
import type { UjianDetail, CreateBulkUjianInput } from '../types';

const { Title } = Typography;

const UjianDetailPage = () => {  const { id: ujianMasterId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [ujianDetail, setUjianDetail] = useState<UjianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableKelas, setAvailableKelas] = useState<any[]>([]);

  const fetchData = async () => {
    if (!ujianMasterId) return;
    setLoading(true);
    try {
      const data = await getUjianDetails(ujianMasterId); 
      setUjianDetail(data.detail);
      setAvailableKelas(data.availableKelas);
    } catch (err) {
      message.error('Gagal memuat detail paket ujian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ujianMasterId) {
        fetchData();
    }
  }, [ujianMasterId]);

  const handleFinish = async (values: { kelas: string[][] }) => {
    if (!ujianMasterId) return;

    // Ambil hanya ID dari pengajar_kelas
    const pengajarKelasIds = values.kelas.map(k => k[k.length - 1]);
    if (pengajarKelasIds.length === 0) {
        message.warning("Pilih setidaknya satu kelas.");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBulkUjianInput = {
          ujian_master_id: ujianMasterId,
          pengajar_kelas_ids: pengajarKelasIds,
      };
      await assignUjianToKelas(payload);
      message.success('Kelas berhasil ditugaskan untuk ujian ini!');
      setIsModalOpen(false);
      form.resetFields();
      await fetchData();
    } catch (err) {
      message.error('Gagal menugaskan kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
      { title: 'Kelas', dataIndex: 'nama_kelas', key: 'kelas' },
      { title: 'Mata Pelajaran', dataIndex: 'nama_mapel', key: 'mapel' },
      { title: 'Guru', dataIndex: 'nama_guru', key: 'guru' },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <Card>
       <Breadcrumb 
            items={[
                { title: <a onClick={() => navigate('/admin/ujian')}>Manajemen Ujian</a> },
                { title: 'Detail Paket Ujian' }
            ]}
            style={{ marginBottom: 16 }}
        />
      <Title level={4}>Detail Paket Ujian: {ujianDetail?.nama_paket_ujian}</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
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
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form form={form} onFinish={handleFinish} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="kelas" label="Pilih Kelas" rules={[{ required: true, message: "Pilih setidaknya satu kelas" }]}>
            <Cascader
              options={availableKelas}
              multiple
              showCheckedStrategy={Cascader.SHOW_CHILD}
              placeholder="Pilih kelas-kelas yang akan mengikuti ujian ini"
              changeOnSelect
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UjianDetailPage;