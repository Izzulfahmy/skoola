// file: frontend/src/pages/UjianPage.tsx
import React, { useState, useMemo } from 'react';
import { Button, Typography, Card, Space, Modal, Form, Input, Cascader, Alert, notification, Tag } from 'antd';
import { PlusOutlined, FormOutlined } from '@ant-design/icons';
// Hapus useQueryClient karena tidak digunakan lagi
import { useQuery, useMutation } from '@tanstack/react-query'; 
// PERBAIKAN 1: Ganti nama impor dan panggilan fungsi API
import { getAllKelasByTahunAjaran } from '../api/rombel'; 
import { useTahunAjaran } from '../hooks/useTahunAjaran';
// Asumsi: Jenjang type sudah ada di types/index.ts untuk Cascader
import type { Kelas, CreateBulkUjianPayload, Jenjang } from '../types'; 
import { createBulkUjian } from '../api/pembelajaran';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { useNotification } = notification;

// Tipe data untuk Cascader options
interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

const UjianPage: React.FC = () => {
  const [api, contextHolder] = useNotification();
  // const queryClient = useQueryClient(); // Dihapus
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeTahunAjaran } = useTahunAjaran();

  // 1. Fetch data Rombel berdasarkan Tahun Ajaran aktif
  const { data: rombelData, isLoading: isLoadingRombel } = useQuery<Kelas[]>({
    queryKey: ['rombelListByTahunAjaran', activeTahunAjaran?.id],
    // PERBAIKAN 1: Panggil fungsi API dengan nama yang benar
    queryFn: () => getAllKelasByTahunAjaran(activeTahunAjaran!.id),
    enabled: !!activeTahunAjaran?.id,
  });

  // 2. Transformasi data Rombel ke format Cascader
  const cascaderOptions: CascaderOption[] = useMemo(() => {
    if (!rombelData) return [];

    // Grouping by Jenjang and Tingkatan
    const groups = new Map<string, CascaderOption>(); // Key: JenjangID-TingkatanID

    rombelData.forEach(kelas => {
      
      // PERBAIKAN: Gunakan flat fields yang baru dari backend (kelas.jenjang_id, kelas.nama_jenjang)
      if (!kelas.jenjang_id || !kelas.nama_tingkatan || !kelas.nama_jenjang) { 
          // Logik pengecekan baru yang sesuai dengan data flat
          console.warn(`Kelas ID ${kelas.id} dilewati karena data jenjang atau tingkatan hilang.`);
          return;
      }
      
      // Menggunakan tingkatan_id dan jenjang_id dari field flat
      const key = `${kelas.jenjang_id}-${kelas.tingkatan_id}`;
      const jenjangLabel = kelas.nama_jenjang;
      const tingkatanLabel = kelas.nama_tingkatan;
      const groupLabel = `${jenjangLabel} - ${tingkatanLabel}`;

      if (!groups.has(key)) {
        groups.set(key, {
          value: key,
          label: groupLabel,
          children: [],
        });
      }

      // Tambahkan Rombel/Kelas sebagai checkbox di bawah group
      groups.get(key)!.children!.push({
        value: kelas.id, // ID Kelas/Rombel (UUID)
        label: kelas.nama_kelas, 
      });
    });

    // Urutkan groups berdasarkan jenjang dan tingkatan
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rombelData]);

  // 3. Mutasi untuk membuat Bulk Ujian
  const createBulkUjianMutation = useMutation({
    mutationFn: createBulkUjian,
    onSuccess: (result) => {
      api.success({
        message: 'Pembuatan Ujian Berhasil',
        description: `Berhasil membuat ${result.success_count} ujian baru dari total ${result.total_count} mata pelajaran.`,
      });
      setIsModalOpen(false);
      form.resetFields();
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

    // Ambil hanya UUID kelas dari Cascader (level 1 dari path, karena level 0 adalah Jenjang/Tingkatan group)
    // Cascader path adalah [Jenjang-Tingkatan-Key, Kelas-ID]
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

  // Teks untuk tombol/judul
  const pageTitle = 'Manajemen Ujian';
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
              Gunakan fitur ini untuk membuat entri ujian baru secara massal di **semua mata pelajaran** dari Rombel/Kelas yang Anda pilih dalam satu kali proses.
            </Text>
            <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                    Untuk melihat, mengedit, dan menambah detail penilaian pada ujian, silakan menuju menu <Link to="/rombel">Rombel</Link>, pilih kelas, dan masuk ke menu <Link to="/teacher/materi-ajar/:pengajarKelasID">Materi Ajar</Link> pada mata pelajaran yang diinginkan.
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