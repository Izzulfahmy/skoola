import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  message,
  Modal,
  Form,
  Cascader,
  Typography,
  Spin,
  Card,
  Breadcrumb,
  Table,
  Tag,
  Tabs,
  Button,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUjianMasterById, assignUjianToKelas, getPesertaUjian } from '../api/ujianMaster';
import type { UjianDetail, PenugasanUjian, GroupedPesertaUjian } from '../types';
import type { TableProps } from 'antd';

import KelasTab from './ujian-detail-tabs/KelasTab';
import PesertaUjianTab from './ujian-detail-tabs/PesertaUjianTab';
import PlaceholderTab from './ujian-detail-tabs/PlaceholderTab';

// --- IMPORT KOMPONEN BARU ---
import RuanganTab from './ujian-detail-tabs/RuanganTab';
// Import komponen tab baru
import KartuUjianTab from './ujian-detail-tabs/KartuUjianTab'; 


const { Title, Text } = Typography;

interface DataType {
  key: string;
  nama_kelas: string;
  jumlah_mapel: number;
  penugasan: PenugasanUjian[];
}

const UjianDetailPage = () => {
  const { id: ujianMasterId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ujianDetail, isLoading: isUjianDetailLoading, isError } = useQuery<UjianDetail>({
    queryKey: ['ujianDetail', ujianMasterId],
    queryFn: () => getUjianMasterById(ujianMasterId!),
    enabled: !!ujianMasterId,
  });

  const { data: pesertaData, isLoading: isPesertaLoading } = useQuery<GroupedPesertaUjian>({
    queryKey: ['pesertaUjian', ujianMasterId],
    queryFn: () => getPesertaUjian(ujianMasterId!),
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

  const tableData = useMemo<DataType[]>(() => {
    if (!ujianDetail?.penugasan) return [];
    const grouped = ujianDetail.penugasan.reduce((acc, current) => {
      (acc[current.nama_kelas] = acc[current.nama_kelas] || []).push(current);
      return acc;
    }, {} as Record<string, PenugasanUjian[]>);

    return Object.entries(grouped).map(([namaKelas, penugasanList]) => ({
      key: namaKelas,
      nama_kelas: namaKelas,
      // FIX: Mengganti penugusanList menjadi penugasanList
      jumlah_mapel: penugasanList.length,
      penugasan: penugasanList,
    }));
  }, [ujianDetail?.penugasan]);

  const expandedRowRender = (record: DataType) => {
    const columns: TableProps<PenugasanUjian>['columns'] = [
      { dataIndex: 'nama_mapel', key: 'nama_mapel', width: '50%' },
      { dataIndex: 'nama_guru', key: 'nama_guru' },
    ];
    return <Table columns={columns} dataSource={record.penugasan} pagination={false} size="small" showHeader={false} />;
  };

  const mainTableColumns: TableProps<DataType>['columns'] = [
    { dataIndex: 'nama_kelas', key: 'nama_kelas', render: (text) => <Text strong>{text}</Text> },
    { dataIndex: 'jumlah_mapel', key: 'jumlah_mapel', align: 'right', render: (jumlah) => <Tag color="blue">{`${jumlah} Mapel`}</Tag> },
  ];
  
  const tabItems = [
    {
      key: '1',
      label: 'Kelas',
      children: (
        <KelasTab
          tableData={tableData}
          mainTableColumns={mainTableColumns}
          expandedRowRender={expandedRowRender}
          onDaftarkanKelasClick={() => setIsModalOpen(true)}
          canDaftarkanKelas={!!ujianDetail?.availableKelas && ujianDetail.availableKelas.length > 0}
        />
      ),
    },
    {
      key: '2',
      label: 'Peserta Ujian',
      children: (
        <PesertaUjianTab
          ujianMasterId={ujianMasterId!}
          data={pesertaData}
          isLoading={isPesertaLoading}
          penugasan={ujianDetail?.penugasan || []}
        />
      ),
    },
    {
      key: '3',
      label: 'Ruangan',
      // Menggunakan komponen RuanganTab yang baru
      children: <RuanganTab ujianMasterId={ujianMasterId!} ujianDetail={ujianDetail} />
    },
    // --- TAB KARTU UJIAN BARU DITAMBAHKAN ---
    { 
        key: '4', 
        label: 'Kartu Ujian', 
        children: <KartuUjianTab /> 
    },
    // --- END TAB KARTU UJIAN BARU ---
    { key: '5', label: 'Pengawas', children: <PlaceholderTab title="Pengawas" /> },
    { key: '6', label: 'Penilaian', children: <PlaceholderTab title="Penilaian" /> },
  ];

  if (isUjianDetailLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

  if (isError) {
    message.error("Gagal memuat detail paket ujian. Silakan coba lagi.");
    return <div>Gagal memuat data. <Button onClick={() => navigate(-1)}>Kembali</Button></div>;
  }

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to='/admin/ujian'>Manajemen Ujian</Link> },
          { title: 'Detail Paket Ujian' }
        ]}
      />
      <Title level={4} style={{ marginTop: 8, marginBottom: 3 }}> {/* NILAI MARGIN DIUBAH DARI 16 KE 8 */}
        {ujianDetail?.detail.nama_paket_ujian}
      </Title>

      <Card bordered={false} bodyStyle={{ paddingTop: 0 }}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>

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
    </>
  );
};

export default UjianDetailPage;