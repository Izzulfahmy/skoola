// file: frontend/src/pages/UjianPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Typography, Card, Space, Modal, Form, Input, Cascader, Alert, notification, Tag, Select } from 'antd';
import { PlusOutlined, FormOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllKelasByTahunAjaran } from '../api/rombel';
import { useTahunAjaran } from '../hooks/useTahunAjaran';
import type { Kelas, CreateBulkUjianPayload, TahunAjaranOption } from '../types';
import { createBulkUjian } from '../api/pembelajaran';

const { Title, Text } = Typography;

interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

const UjianPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- MODIFIKASI: Gunakan semua state dari hook useTahunAjaran ---
  const { activeTahunAjaran, tahunAjaranOptions, setActiveTahunAjaran } = useTahunAjaran();
  
  // State lokal untuk menyimpan tahun ajaran yang dipilih KHUSUS di halaman ini
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<TahunAjaranOption | null>(null);

  // Sinkronkan state lokal dengan state global saat pertama kali render
  useEffect(() => {
    if (activeTahunAjaran) {
      setSelectedTahunAjaran(activeTahunAjaran);
    }
  }, [activeTahunAjaran]);


  // Handler untuk mengubah tahun ajaran dari dropdown
  const handleTahunAjaranChange = (tahunAjaranId: string) => {
    const selected = tahunAjaranOptions.find(ta => ta.id === tahunAjaranId);
    if (selected) {
      setSelectedTahunAjaran(selected);
      // Optional: Jika Anda ingin pilihan ini juga menjadi aktif secara global
      setActiveTahunAjaran(selected);
    }
  };

  const { data: rombelData, isLoading: isLoadingRombel } = useQuery<Kelas[]>({
    queryKey: ['rombelListByTahunAjaran', selectedTahunAjaran?.id],
    queryFn: () => getAllKelasByTahunAjaran(selectedTahunAjaran!.id),
    enabled: !!selectedTahunAjaran?.id, // Query hanya berjalan jika ada tahun ajaran terpilih
  });

  const cascaderOptions: CascaderOption[] = useMemo(() => {
    if (!rombelData) return [];
    const groups = new Map<string, CascaderOption>();

    rombelData.forEach(kelas => {
      if (!kelas.nama_tingkatan) return;
      
      const jenjangId = kelas.jenjang_id || 'unknown';
      const namaJenjang = kelas.nama_jenjang || 'Tingkat Pendidikan Lain';
      const key = `${jenjangId}-${kelas.tingkatan_id}`;
      const tingkatanLabel = kelas.nama_tingkatan;
      const groupLabel = `${namaJenjang} - ${tingkatanLabel}`;

      if (!groups.has(key)) {
        groups.set(key, { value: key, label: groupLabel, children: [] });
      }
      groups.get(key)!.children!.push({ value: kelas.id, label: kelas.nama_kelas });
    });
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rombelData]);

  const createBulkUjianMutation = useMutation({
    mutationFn: createBulkUjian,
    onSuccess: () => {
      api.success({
        message: 'Pembuatan Ujian Berhasil',
        description: `Entri ujian baru telah berhasil dibuat.`,
      });
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['ujianList'] });
    },
    onError: (error: any) => {
      api.error({
        message: 'Gagal Membuat Ujian',
        description: error.response?.data?.error || 'Terjadi kesalahan.',
      });
    },
  });

  const handleFinish = (values: any) => {
    if (!selectedTahunAjaran?.id) {
      api.error({ message: 'Error', description: 'Tahun ajaran belum terpilih.' });
      return;
    }
    const kelasIDs: string[] = values.kelas.map((path: string[]) => path[1]);
    const uniqueKelasIDs = Array.from(new Set(kelasIDs));

    if (uniqueKelasIDs.length === 0) {
      api.warning({ message: 'Perhatian', description: 'Pilih minimal satu Rombel/Kelas.' });
      return;
    }
    const payload: CreateBulkUjianPayload = {
      nama_ujian: values.namaUjian,
      tahun_ajaran_id: selectedTahunAjaran.id,
      kelas_ids: uniqueKelasIDs,
    };
    createBulkUjianMutation.mutate(payload);
  };

  const pageTitle = 'Buat Ujian Massal';
  const buttonText = 'Buat Ujian Massal';

  // --- MODIFIKASI: Komponen Dropdown Tahun Ajaran ---
  const TahunAjaranSelector = (
    <Select
      value={selectedTahunAjaran?.id}
      style={{ width: 280 }}
      onChange={handleTahunAjaranChange}
      placeholder="Pilih Tahun Ajaran"
      options={tahunAjaranOptions.map(ta => ({
        value: ta.id,
        label: ta.nama,
      }))}
      notFoundContent="Tidak ada data tahun ajaran"
    />
  );

  return (
    <>
      {contextHolder}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}><FormOutlined /> {pageTitle}</Title>

        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={5} style={{ margin: 0 }}>
                    <CalendarOutlined /> Konteks Tahun Ajaran
                </Title>
                <Space>
                    {TahunAjaranSelector}
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        loading={isLoadingRombel}
                        // Tombol disabled jika tidak ada tahun ajaran terpilih atau data kelas belum siap
                        disabled={!selectedTahunAjaran || isLoadingRombel || !cascaderOptions.some(opt => opt.children && opt.children.length > 0)}
                    >
                        {buttonText}
                    </Button>
                </Space>
            </div>

            {!selectedTahunAjaran ? (
                <Alert
                    message="Pilih Tahun Ajaran"
                    description="Silakan pilih tahun ajaran dari dropdown di atas untuk memulai membuat ujian."
                    type="info"
                    showIcon
                />
            ) : (
                <>
                    <Text>
                        Gunakan fitur ini untuk membuat entri ujian baru secara massal di <strong>semua mata pelajaran</strong> dari Rombel/Kelas yang Anda pilih untuk tahun ajaran: <Tag color="blue">{selectedTahunAjaran.nama}</Tag>.
                    </Text>
                    {cascaderOptions.length === 0 && !isLoadingRombel && (
                        <Alert
                            message="Tidak Ada Rombel/Kelas Tersedia"
                            description={`Pastikan Anda sudah membuat Rombel/Kelas untuk tahun ajaran "${selectedTahunAjaran.nama}".`}
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </>
            )}
        </Card>
      </Space>

      <Modal
        title={buttonText}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose={true}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>Batal</Button>,
          <Button key="submit" type="primary" loading={createBulkUjianMutation.isPending} onClick={() => form.submit()}>Buat Ujian</Button>,
        ]}
      >
        <Alert
          message={`Ujian untuk: ${selectedTahunAjaran?.nama || ''}`}
          description="Proses ini akan membuat entri Ujian baru pada SEMUA MATA PELAJARAN dari Rombel/Kelas yang Anda pilih."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="namaUjian" label="Nama Ujian" rules={[{ required: true, message: 'Nama Ujian wajib diisi!' }]}>
            <Input placeholder="Contoh: Ujian Tengah Semester Ganjil" />
          </Form.Item>
          <Form.Item name="kelas" label="Pilih Rombel/Kelas" rules={[{ required: true, message: 'Minimal satu Rombel/Kelas wajib dipilih!' }]}>
            <Cascader
              options={cascaderOptions}
              multiple
              showCheckedStrategy={Cascader.SHOW_CHILD}
              changeOnSelect={false}
              placeholder="Pilih Rombel/Kelas yang akan dibuatkan ujian"
              expandTrigger="hover"
              loading={isLoadingRombel}
            />
          </Form.Item>
          <Text type="secondary">
            Ujian akan dibuat di semua mata pelajaran pada kelas-kelas terpilih.
          </Text>
        </Form>
      </Modal>
    </>
  );
};

export default UjianPage;