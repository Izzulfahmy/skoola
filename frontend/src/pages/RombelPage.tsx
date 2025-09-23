// file: frontend/src/pages/RombelPage.tsx
import { useState, useEffect } from 'react';
import {
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  List,
  Spin,
  Empty,
  Row,
  Col,
  Space,
  Popconfirm,
  Alert,
  Card,
  Tag,
  Badge,
  Tooltip,
} from 'antd';
// --- PERBAIKAN DI SINI: Hapus 'ApartmentOutlined' ---
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getTeachers } from '../api/teachers';
import { getAllTingkatan } from '../api/tingkatan';
import { getAllKelasByTahunAjaran, createKelas, updateKelas, deleteKelas } from '../api/rombel';
import type { TahunAjaran, Teacher, Tingkatan, Kelas, UpsertKelasInput } from '../types';
import RombelDetailPanel from '../components/RombelDetailPanel';

const { Title, Text } = Typography;

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};


const RombelPage = () => {
  const [form] = Form.useForm();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tingkatans, setTingkatans] = useState<Tingkatan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | null>(null);
  const [rombelList, setRombelList] = useState<Kelas[]>([]);
  const [selectedRombel, setSelectedRombel] = useState<Kelas | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Kelas | null>(null);

  const fetchDataMaster = async () => {
    try {
      const [taData, teachersData, tingkatanData] = await Promise.all([
        getAllTahunAjaran(),
        getTeachers(),
        getAllTingkatan(),
      ]);
      const listTA = taData || [];
      setTahunAjaranList(listTA);
      setTeachers(teachersData || []);
      setTingkatans(tingkatanData || []);
      const aktif = listTA.find(ta => ta.status === 'Aktif');
      if (aktif) {
        setSelectedTahunAjaran(aktif.id);
      } else if (listTA.length > 0) {
        setSelectedTahunAjaran(listTA[0].id);
      }
    } catch (err) {
      setError('Gagal memuat data master (Tahun Ajaran, Guru, Tingkatan).');
    }
  };
  const fetchRombel = async (tahunAjaranId: string) => {
    setLoading(true);
    try {
      const data = await getAllKelasByTahunAjaran(tahunAjaranId);
      setRombelList(data || []);
      if (selectedRombel) {
        const updatedRombel = data.find(k => k.id === selectedRombel.id);
        setSelectedRombel(updatedRombel || null);
      }
    } catch (err) {
      setError('Gagal memuat data rombel.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDataMaster();
  }, []);
  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchRombel(selectedTahunAjaran);
    } else {
      setRombelList([]);
      setLoading(false);
    }
  }, [selectedTahunAjaran]);
  const showModal = (rombel: Kelas | null) => {
    setEditingRombel(rombel);
    form.setFieldsValue(rombel || {
      nama_kelas: '',
      tingkatan_id: undefined,
      wali_kelas_id: undefined,
    });
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRombel(null);
    form.resetFields();
  };
  const handleFinish = async (values: any) => {
    if (!selectedTahunAjaran) {
      message.error("Pilih tahun ajaran terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    const payload: UpsertKelasInput = {
      ...values,
      tahun_ajaran_id: selectedTahunAjaran,
    };
    try {
      let updatedRombel;
      if (editingRombel) {
        updatedRombel = await updateKelas(editingRombel.id, payload);
        message.success('Rombel berhasil diperbarui!');
      } else {
        updatedRombel = await createKelas(payload);
        message.success('Rombel baru berhasil dibuat!');
      }
      handleCancel();
      await fetchRombel(selectedTahunAjaran);
      setSelectedRombel(updatedRombel);
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (kelasId: string) => {
    try {
      await deleteKelas(kelasId);
      message.success('Rombel berhasil dihapus!');
      setSelectedRombel(null);
      if (selectedTahunAjaran) {
        fetchRombel(selectedTahunAjaran);
      }
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus rombel.');
    }
  };
  const handleRombelUpdate = () => {
    if (selectedTahunAjaran) {
        fetchRombel(selectedTahunAjaran);
    }
  };

  const renderRombelList = () => (
    <Card
      title="Daftar Rombel"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal(null)}
          disabled={!selectedTahunAjaran}
        >
          {!isMobile && 'Tambah Rombel'}
        </Button>
      }
      style={{ height: '100%' }}
    >
      {loading ? <Spin /> :
       !selectedTahunAjaran ? <Empty description="Pilih tahun ajaran untuk melihat rombel." /> :
       rombelList.length === 0 ? <Empty description="Belum ada rombel untuk tahun ajaran ini." /> : (
        <List
          itemLayout="horizontal"
          dataSource={rombelList}
          renderItem={item => (
            <List.Item
              onClick={() => setSelectedRombel(item)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedRombel?.id === item.id ? '#e6f7ff' : 'transparent',
                padding: '12px',
                borderRadius: '8px',
              }}
              actions={[
                <Button type="text" icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); showModal(item); }} />,
                <Popconfirm
                  title="Hapus Rombel?"
                  description="Semua data terkait akan dihapus."
                  onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id); }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={(e) => e.stopPropagation()} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.nama_kelas}</Text>}
                description={
                  <Space direction="vertical" size={4} style={{ marginTop: '4px', width: '100%' }}>
                    <Tag color="geekblue">{item.nama_tingkatan || 'Tingkatan belum diatur'}</Tag>
                    <Space size="middle">
                      <Tag icon={<UserOutlined />} color="blue">
                        {item.nama_wali_kelas || 'Belum ada wali'}
                      </Tag>
                      <Space size="small">
                        <Tooltip title="Jumlah Siswa">
                           <Badge count={item.jumlah_siswa} color="green" />
                        </Tooltip>
                         <Tooltip title="Jumlah Guru Pengajar">
                           <Badge count={item.jumlah_pengajar} color="purple" />
                        </Tooltip>
                      </Space>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const renderContent = () => {
    if (isMobile) {
      if (selectedRombel) {
        return (
          <RombelDetailPanel
            rombel={selectedRombel}
            teachers={teachers}
            onUpdate={handleRombelUpdate}
            onBack={() => setSelectedRombel(null)}
          />
        );
      }
      return renderRombelList();
    }

    return (
      <Row gutter={[16, 16]} style={{ minHeight: 'calc(100vh - 250px)' }}>
        <Col xs={24} md={8} lg={7}>
          {renderRombelList()}
        </Col>
        <Col xs={24} md={16} lg={17}>
          <Card style={{ height: '100%' }}>
            {selectedRombel ? (
              <RombelDetailPanel
                rombel={selectedRombel}
                teachers={teachers}
                onUpdate={handleRombelUpdate}
              />
            ) : (
              <Empty description="Pilih rombel dari daftar untuk melihat detail & mengelola." style={{ paddingTop: '100px' }}/>
            )}
          </Card>
        </Col>
      </Row>
    );
  };
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Manajemen Rombongan Belajar (Rombel)</Title>
        </Col>
        <Col>
          <Space>
            <Text>Tahun Ajaran:</Text>
            <Select
              value={selectedTahunAjaran}
              style={{ width: 250 }}
              options={tahunAjaranList.map(ta => ({
                value: ta.id,
                label: `${ta.nama_tahun_ajaran} - ${ta.semester}${ta.status === 'Aktif' ? ' (Aktif)' : ''}`,
              }))}
              onChange={(value) => {
                setSelectedTahunAjaran(value)
                setSelectedRombel(null)
              }}
              placeholder="Pilih Tahun Ajaran"
              loading={loading && tahunAjaranList.length === 0}
            />
          </Space>
        </Col>
      </Row>

      {error && <Alert message="Error" description={error} type="error" showIcon />}
      
      {renderContent()}

      <Modal
        title={editingRombel ? `Edit Rombel: ${editingRombel.nama_kelas}` : 'Tambah Rombel Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item name="nama_kelas" label="Nama Rombel" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Kelas VII A" />
          </Form.Item>
          <Form.Item name="tingkatan_id" label="Tingkatan" rules={[{ required: true }]}>
            <Select
              placeholder="Pilih tingkatan kelas"
              options={tingkatans.map(t => ({ value: t.id, label: t.nama_tingkatan }))}
            />
          </Form.Item>
          <Form.Item name="wali_kelas_id" label="Wali Kelas (Opsional)">
            <Select
              showSearch
              placeholder="Pilih wali kelas"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={teachers.map(t => ({ value: t.id, label: t.nama_lengkap }))}
              allowClear
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default RombelPage;