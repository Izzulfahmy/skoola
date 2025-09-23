// file: frontend/src/components/FasePanel.tsx
import React, { useState, useEffect } from 'react';
import { Typography, List, Select, Button, Form, message, Empty, Popconfirm, Spin, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
// --- PERBAIKAN: Hapus import yang tidak digunakan ---
import { getAllTingkatan, getAllFase, getFaseTingkatan, createPemetaan, deletePemetaan } from '../api/kurikulum';
import type { Tingkatan, Fase, FaseTingkatan, PemetaanInput } from '../types';

const { Title, Text } = Typography;

interface FasePanelProps {
  tahunAjaranId: string;
  kurikulumId: number;
  kurikulumNama: string;
}

const FasePanel: React.FC<FasePanelProps> = ({ tahunAjaranId, kurikulumId, kurikulumNama }) => {
  const [form] = Form.useForm();
  const [tingkatans, setTingkatans] = useState<Tingkatan[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [pemetaan, setPemetaan] = useState<FaseTingkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tingkatanData, faseData, pemetaanData] = await Promise.all([
        getAllTingkatan(),
        getAllFase(),
        getFaseTingkatan(tahunAjaranId, kurikulumId),
      ]);
      setTingkatans(tingkatanData);
      setFases(faseData);
      setPemetaan(pemetaanData);
    } catch (err) {
      setError('Gagal memuat data pemetaan fase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tahunAjaranId, kurikulumId]);

  const handleAddPemetaan = async (values: { tingkatan_id: number, fase_id: number }) => {
    setSubmitting(true);
    const payload: PemetaanInput = {
      tahun_ajaran_id: tahunAjaranId,
      kurikulum_id: kurikulumId,
      ...values,
    };
    try {
      await createPemetaan(payload);
      message.success('Pemetaan berhasil disimpan!');
      form.resetFields();
      fetchData(); // Refresh list
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menyimpan pemetaan.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeletePemetaan = async (tingkatanId: number) => {
    try {
      await deletePemetaan(tahunAjaranId, kurikulumId, tingkatanId);
      message.success('Pemetaan berhasil dihapus!');
      fetchData(); // Refresh list
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus pemetaan.');
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  // Filter tingkatan yang sudah dipetakan
  const mappedTingkatanIds = pemetaan.map(p => p.tingkatan_id);
  const availableTingkatans = tingkatans.filter(t => !mappedTingkatanIds.includes(t.id));

  return (
    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
      <Title level={4}>Pemetaan Fase: {kurikulumNama}</Title>
      <Text type="secondary">Hubungkan setiap tingkatan kelas dengan fase kurikulum yang sesuai untuk tahun ajaran ini.</Text>
      
      <Form form={form} layout="inline" onFinish={handleAddPemetaan} style={{ marginTop: 24, marginBottom: 24 }}>
        <Form.Item name="tingkatan_id" rules={[{ required: true, message: 'Pilih tingkatan' }]} style={{ flex: 1 }}>
          <Select placeholder="Pilih Tingkatan Kelas" options={availableTingkatans.map(t => ({ value: t.id, label: t.nama_tingkatan }))} />
        </Form.Item>
        <Form.Item name="fase_id" rules={[{ required: true, message: 'Pilih fase' }]} style={{ flex: 1 }}>
          <Select placeholder="Pilih Fase" options={fases.map(f => ({ value: f.id, label: f.nama_fase }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>
            Tambahkan
          </Button>
        </Form.Item>
      </Form>
      
      {pemetaan.length > 0 ? (
         <List
            dataSource={pemetaan}
            renderItem={(item) => (
                <List.Item
                    key={item.tingkatan_id}
                    actions={[
                        <Popconfirm
                            title="Hapus pemetaan ini?"
                            onConfirm={() => handleDeletePemetaan(item.tingkatan_id)}
                            okText="Ya"
                            cancelText="Tidak"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    ]}
                >
                    <List.Item.Meta
                        title={<Text strong>{item.nama_tingkatan}</Text>}
                        description={`Menggunakan ${item.nama_fase}`}
                    />
                </List.Item>
            )}
        />
      ) : (
        <Empty description="Belum ada pemetaan untuk kurikulum ini." />
      )}
    </div>
  );
};

export default FasePanel;