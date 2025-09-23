// file: frontend/src/components/FasePanel.tsx
import React, { useState, useEffect } from 'react';
// --- 1. Impor 'Flex' dari antd ---
import { Typography, List, Select, Button, Form, message, Empty, Popconfirm, Spin, Alert, Input, Flex } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllTingkatan, getAllFase, getFaseTingkatan, createPemetaan, deletePemetaan, createFase } from '../api/kurikulum';
import type { Tingkatan, Fase, FaseTingkatan, PemetaanInput } from '../types';

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


interface FasePanelProps {
  tahunAjaranId: string;
  kurikulumId: number;
  kurikulumNama: string;
  onMappingUpdate: () => void;
}

const FasePanel: React.FC<FasePanelProps> = ({ tahunAjaranId, kurikulumId, kurikulumNama, onMappingUpdate }) => {
  const [form] = Form.useForm();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [tingkatans, setTingkatans] = useState<Tingkatan[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [pemetaan, setPemetaan] = useState<FaseTingkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [tingkatanData, faseData, pemetaanData] = await Promise.all([
        getAllTingkatan(),
        getAllFase(),
        getFaseTingkatan(tahunAjaranId, kurikulumId),
      ]);
      setTingkatans(tingkatanData || []);
      setFases(faseData || []);
      setPemetaan(pemetaanData || []);
    } catch (err) {
      setError('Gagal memuat data pemetaan fase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [tahunAjaranId, kurikulumId]);

  const handleDeletePemetaan = async (tingkatanId: number) => {
    try {
      await deletePemetaan(tahunAjaranId, kurikulumId, tingkatanId);
      message.success('Pemetaan berhasil dihapus!');
      await fetchData();
      onMappingUpdate();
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus pemetaan.');
    }
  };

  const handleMapFase = async (values: { tingkatan_id: number; nama_fase: string }) => {
    setSubmitting(true);
    const { tingkatan_id, nama_fase } = values;

    if (!nama_fase?.trim()) {
        message.error('Nama Fase tidak boleh kosong.');
        setSubmitting(false);
        return;
    }
    
    try {
        let faseId: number;
        const existingFase = fases.find(f => f.nama_fase.toLowerCase() === nama_fase.trim().toLowerCase());

        if (existingFase) {
            faseId = existingFase.id;
        } else {
            const newFase = await createFase({ nama_fase: nama_fase.trim() });
            faseId = newFase.id;
        }

        const payload: PemetaanInput = {
            tahun_ajaran_id: tahunAjaranId,
            kurikulum_id: kurikulumId,
            tingkatan_id: tingkatan_id,
            fase_id: faseId,
        };
        await createPemetaan(payload);

        message.success(`Tingkatan berhasil dipetakan ke fase "${nama_fase.trim()}"!`);
        form.resetFields();
        await fetchData();
        onMappingUpdate();

    } catch (err: any) {
        message.error(err.response?.data || 'Gagal menyimpan pemetaan.');
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const mappedTingkatanIds = pemetaan.map(p => p.tingkatan_id);
  const availableTingkatans = tingkatans.filter(t => !mappedTingkatanIds.includes(t.id));

  // --- 2. PERBAIKAN: Pisahkan Form Content agar bisa dibungkus ---
  const formContent = (
    <>
      <Form.Item name="tingkatan_id" rules={[{ required: true, message: 'Pilih tingkatan' }]} style={{ flex: isMobile ? undefined : 1, width: '100%' }}>
        <Select
          showSearch
          placeholder="Pilih Tingkatan Kelas"
          options={availableTingkatans.map(t => ({ value: t.id, label: t.nama_tingkatan }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
      <Form.Item name="nama_fase" rules={[{ required: true, message: 'Nama fase tidak boleh kosong'}]} style={{ flex: isMobile ? undefined : 1, width: '100%' }}>
        <Input placeholder="Ketik nama fase (Contoh: Fase A)" />
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<PlusOutlined />} 
          loading={submitting}
          style={{ width: '100%' }}
        >
          {!isMobile && 'Petakan'} 
        </Button>
      </Form.Item>
    </>
  );

  return (
    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
      <Title level={4}>Pemetaan Fase: {kurikulumNama}</Title>
      <Text type="secondary">Hubungkan setiap tingkatan kelas dengan fase kurikulum yang sesuai untuk tahun ajaran ini.</Text>
      
      {/* --- 3. PERBAIKAN: Gunakan Form sebagai pembungkus utama --- */}
      <Form form={form} onFinish={handleMapFase} style={{ marginTop: 24, marginBottom: 24 }}>
        {isMobile ? (
          // Untuk Mobile, biarkan default (vertikal)
          formContent
        ) : (
          // Untuk Desktop, bungkus dengan Flex
          <Flex gap="small" align="start">
            {formContent}
          </Flex>
        )}
      </Form>
      
      {pemetaan.length > 0 ? (
         <List
            header={<Text strong>Hasil Pemetaan</Text>}
            bordered
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