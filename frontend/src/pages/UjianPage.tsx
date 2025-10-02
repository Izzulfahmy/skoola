// file: frontend/src/pages/UjianPage.tsx
import React, { useState, useMemo } from 'react';
import { Button, Typography, Card, Space, Modal, Form, Input, Cascader, Alert, notification, Tag, Collapse } from 'antd';
import { PlusOutlined, FormOutlined, EyeOutlined, DashboardOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { getAllKelasByTahunAjaran } from '../api/rombel'; 
import { useTahunAjaran } from '../hooks/useTahunAjaran';
// FIX: Ganti Ujian menjadi UjianMonitoring untuk list monitoring
import type { Kelas, CreateBulkUjianPayload, UjianMonitoring } from '../types'; 
// FIX: Import getAllUjian
import { createBulkUjian, getAllUjian } from '../api/pembelajaran'; 
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { useNotification } = notification;

// Tipe data untuk Cascader options
interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

// --- Komponen Panel Monitoring Ujian ---
interface UjianListPanelProps {
    tahunAjaranId: string;
}

const UjianListPanel: React.FC<UjianListPanelProps> = ({ tahunAjaranId }) => {
    // Query untuk mengambil daftar Ujian
    // FIX: Gunakan tipe UjianMonitoring[]
    const { data: ujianList, isLoading: isLoadingUjian } = useQuery<UjianMonitoring[]>({
        queryKey: ['ujianList', tahunAjaranId],
        queryFn: () => getAllUjian(tahunAjaranId), // Panggil API untuk mengambil semua ujian
        enabled: !!tahunAjaranId,
    });

    if (isLoadingUjian) {
        return <Text type="secondary">Memuat daftar ujian...</Text>;
    }
    
    if (!ujianList || ujianList.length === 0) {
        return <Alert message="Belum ada ujian yang dibuat untuk tahun ajaran ini." type="info" showIcon />;
    }

    const collapseItems = ujianList.map((ujian) => ({
        key: ujian.id,
        label: (
            <Space direction="vertical" size={0}>
                {/* FIX: Gunakan nama_ujian */}
                <Title level={5} style={{ margin: 0 }}>{ujian.nama_ujian}</Title>
                <Text type="secondary" style={{ fontSize: '0.85em' }}>
                    {/* FIX: Gunakan jumlah_kelas dan jumlah_mapel */}
                    Total: {ujian.jumlah_kelas || 0} Rombel | {ujian.jumlah_mapel || 0} Mata Pelajaran
                </Text>
            </Space>
        ),
        children: (
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    message="Detail Ujian"
                    description="Klik link 'Lihat Penilaian' untuk mengelola detail rombel dan mata pelajaran."
                    type="info"
                    showIcon
                />
                <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => console.log('Navigasi ke Detail Ujian:', ujian.id)}
                >
                    Lihat Detail Ujian (Rombel & Mapel)
                </Button>
            </Space>
        ),
        extra: (
            <Link to={`/penilaian?ujian_id=${ujian.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="small" icon={<DashboardOutlined />} type="default">Lihat Penilaian</Button>
            </Link>
        )
    }));

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}><ScheduleOutlined /> Daftar Ujian Dibuat</Title>
            <Collapse items={collapseItems} accordion style={{ width: '100%' }} />
        </Space>
    );
}

// --- Komponen Utama UjianPage ---

const UjianPage: React.FC = () => {
  const [api, contextHolder] = useNotification();
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
        description: `Entri ujian baru telah berhasil dibuat. Silakan cek di panel monitoring.`,
      });
      setIsModalOpen(false);
      form.resetFields();
      // Invalidasi query ujianList agar daftar ujian terbaru muncul
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
          <>
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

            {/* Tambahkan Panel Monitoring Ujian di sini */}
            <UjianListPanel tahunAjaranId={activeTahunAjaran.id} />
          </>
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