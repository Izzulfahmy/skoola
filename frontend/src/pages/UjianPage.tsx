// file: frontend/src/pages/UjianPage.tsx
import React, { useState, useMemo } from 'react';
import { Button, Typography, Card, Space, Modal, Form, Input, Cascader, Alert, notification, Tag } from 'antd';
import { PlusOutlined, FormOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllKelasByTahunAjaran } from '../api/rombel';
import { useTahunAjaran } from '../hooks/useTahunAjaran';
import type { Kelas, CreateBulkUjianPayload } from '../types';
import { createBulkUjian } from '../api/pembelajaran';

const { Title, Text } = Typography;

// Tipe data untuk Cascader options
interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

// --- Komponen Utama UjianPage (Sudah Diperbaiki) ---

const UjianPage: React.FC = () => {
  // FIX: Menggunakan notification.useNotification() untuk memanggil hook
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeTahunAjaran } = useTahunAjaran();

  // 1. Fetch data Rombel berdasarkan Tahun Ajaran aktif
  const { data: rombelData, isLoading: isLoadingRombel } = useQuery<Kelas[]>({
    queryKey: ['rombelListByTahunAjaran', activeTahunAjaran?.id],
    queryFn: () => getAllKelasByTahunAjaran(activeTahunAjaran!.id),
    enabled: !!activeTahunAjaran?.id,
  });

  // 2. Transformasi data Rombel ke format Cascader
  const cascaderOptions: CascaderOption[] = useMemo(() => {
    if (!rombelData) return [];

    const groups = new Map<string, CascaderOption>();

    rombelData.forEach(kelas => {
      if (!kelas.nama_tingkatan) {
        console.warn(`Kelas ID ${kelas.id} dilewati karena data tingkatan hilang.`);
        return;
      }

      const jenjangId = kelas.jenjang_id || 'unknown';
      const namaJenjang = kelas.nama_jenjang || 'Tingkat Pendidikan Lain';

      const key = `${jenjangId}-${kelas.tingkatan_id}`;
      const tingkatanLabel = kelas.nama_tingkatan;
      const groupLabel = `${namaJenjang} - ${tingkatanLabel}`;

      if (!groups.has(key)) {
        groups.set(key, {
          value: key,
          label: groupLabel,
          children: [],
        });
      }

      groups.get(key)!.children!.push({
        value: kelas.id,
        label: kelas.nama_kelas,
      });
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rombelData]);

  // 3. Mutasi untuk membuat Bulk Ujian
  const createBulkUjianMutation = useMutation({
    mutationFn: createBulkUjian,
    onSuccess: () => {
      api.success({
        message: 'Pembuatan Ujian Berhasil',
        description: `Entri ujian baru telah berhasil dibuat untuk kelas-kelas yang dipilih.`,
      });
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['ujianList'] });
    },
    onError: (error: any) => {
      api.error({
        message: 'Gagal Membuat Ujian',
        description: error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data.',
      });
    },
  });

  const handleFinish = (values: any) => {
    if (!activeTahunAjaran?.id) {
      api.error({ message: 'Error', description: 'Tahun ajaran aktif belum terpilih.' });
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
      tahun_ajaran_id: activeTahunAjaran.id,
      kelas_ids: uniqueKelasIDs,
    };

    createBulkUjianMutation.mutate(payload);
  };

  const pageTitle = 'Buat Ujian Massal';
  const buttonText = 'Buat Ujian Massal';

  return (
    <>
      {contextHolder}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}>
          <FormOutlined /> {pageTitle}
        </Title>

        {!activeTahunAjaran?.id ? (
          <Alert
            message="Tahun Ajaran Aktif Belum Dipilih"
            description="Silakan pilih tahun ajaran aktif di header untuk dapat membuat ujian baru."
            type="warning"
            showIcon
          />
        ) : (
          <Card
            title={<Title level={5}>Tahun Ajaran Aktif: <Tag color="blue">{activeTahunAjaran.nama}</Tag></Title>}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setIsModalOpen(true);
                }}
                loading={isLoadingRombel}
                disabled={isLoadingRombel || !cascaderOptions.some(opt => opt.children && opt.children.length > 0)}
              >
                {buttonText}
              </Button>
            }
          >
            <Text>
              Gunakan fitur ini untuk membuat entri ujian baru secara massal di <strong>semua mata pelajaran</strong> dari Rombel/Kelas yang Anda pilih dalam satu kali proses.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                Setelah ujian dibuat, detail penilaian dapat dikelola oleh guru mata pelajaran melalui menu Rencana Pembelajaran.
              </Text>
            </div>

            {cascaderOptions.length === 0 && !isLoadingRombel && (
              <Alert
                message="Tidak Ada Rombel/Kelas Tersedia"
                description="Pastikan Anda sudah membuat Rombel/Kelas untuk tahun ajaran aktif."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        )}
      </Space>

      {/* Modal Form Pembuatan Bulk Ujian */}
      <Modal
        title={buttonText}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose={true}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createBulkUjianMutation.isPending}
            onClick={() => form.submit()}
          >
            Buat Ujian
          </Button>,
        ]}
      >
        <Alert
          message="Perhatian!"
          description="Proses ini akan membuat entri Ujian baru pada SEMUA MATA PELAJARAN dari Rombel/Kelas yang Anda pilih."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="namaUjian"
            label="Nama Ujian"
            rules={[{ required: true, message: 'Nama Ujian wajib diisi!' }]}
          >
            <Input placeholder="Contoh: Ujian Tengah Semester Ganjil" />
          </Form.Item>

          <Form.Item
            name="kelas"
            label="Pilih Rombel/Kelas"
            rules={[{ required: true, message: 'Minimal satu Rombel/Kelas wajib dipilih!' }]}
          >
            <Cascader
              options={cascaderOptions}
              multiple
              showCheckedStrategy={Cascader.SHOW_CHILD}
              changeOnSelect={false}
              placeholder="Pilih Rombel/Kelas yang akan dibuatkan ujian"
              expandTrigger="hover"
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