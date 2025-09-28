// file: frontend/src/pages/PresensiPage.tsx
import { useState, useEffect } from 'react';
import { App as AntApp, Typography, Select, Card, Spin, Alert, Tabs, Row, Col } from 'antd';
import type { TabsProps } from 'antd';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllKelasByTahunAjaran } from '../api/rombel';
import type { TahunAjaran, Kelas } from '../types';
import dayjs from 'dayjs';
import PresensiTable from '../components/PresensiTable'; // Kita akan buat file ini selanjutnya

const { Title, Text } = Typography;

const PresensiPage = () => {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | null>(null);
  
  const [rombelList, setRombelList] = useState<Kelas[]>([]);
  const [selectedRombel, setSelectedRombel] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Fetch data master (tahun ajaran)
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const taData = await getAllTahunAjaran();
        const listTA = taData || [];
        setTahunAjaranList(listTA);
        
        const aktif = listTA.find(ta => ta.status === 'Aktif');
        if (aktif) {
          setSelectedTahunAjaran(aktif.id);
        } else if (listTA.length > 0) {
          setSelectedTahunAjaran(listTA[0].id);
        }
      } catch (err) {
        setError('Gagal memuat data Tahun Ajaran.');
        message.error('Gagal memuat data Tahun Ajaran.');
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, [message]);

  // Fetch data rombel ketika tahun ajaran berubah
  useEffect(() => {
    if (selectedTahunAjaran) {
      const fetchRombel = async () => {
        setLoading(true);
        try {
          const data = await getAllKelasByTahunAjaran(selectedTahunAjaran);
          setRombelList(data || []);
          if (data && data.length > 0) {
            setSelectedRombel(data[0].id);
          } else {
            setSelectedRombel(null);
          }
        } catch (err) {
          setError('Gagal memuat data rombongan belajar.');
          message.error('Gagal memuat data rombongan belajar.');
        } finally {
          setLoading(false);
        }
      };
      fetchRombel();
    }
  }, [selectedTahunAjaran, message]);

  const items: TabsProps['items'] = rombelList.map(rombel => ({
    key: rombel.id,
    label: rombel.nama_kelas,
    children: (
      <PresensiTable
        key={`${rombel.id}-${selectedDate.format('YYYY-MM')}`}
        kelasId={rombel.id}
        year={selectedDate.year()}
        month={selectedDate.month() + 1}
      />
    ),
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={3}>Manajemen Presensi Siswa</Title>
      <Text type="secondary">Kelola data kehadiran siswa per kelas dalam rentang bulanan.</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Text strong>Tahun Pelajaran: </Text>
          <Select
            style={{ width: '100%' }}
            value={selectedTahunAjaran}
            onChange={setSelectedTahunAjaran}
            placeholder="Pilih Tahun Ajaran"
            options={tahunAjaranList.map(ta => ({
              value: ta.id,
              label: `${ta.nama_tahun_ajaran} - ${ta.semester}${ta.status === 'Aktif' ? ' (Aktif)' : ''}`,
            }))}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Bulan Presensi: </Text>
          <Select
            style={{ width: '100%' }}
            value={selectedDate.format('YYYY-MM')}
            onChange={(value) => setSelectedDate(dayjs(value))}
            placeholder="Pilih Bulan"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const date = dayjs().subtract(i, 'month');
              return (
                <Select.Option key={date.format('YYYY-MM')} value={date.format('YYYY-MM')}>
                  {date.format('MMMM YYYY')}
                </Select.Option>
              );
            })}
          </Select>
        </Col>
      </Row>

      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {rombelList.length > 0 ? (
        <Tabs
          activeKey={selectedRombel || undefined}
          items={items}
          onChange={setSelectedRombel}
        />
      ) : (
        <Alert
          message="Tidak Ada Rombel"
          description="Tidak ada rombongan belajar yang terdaftar pada tahun pelajaran yang dipilih."
          type="info"
          showIcon
        />
      )}
    </Card>
  );
};

// Bungkus komponen utama dengan AntApp Provider
const WrappedPresensiPage = () => (
  <AntApp>
    <PresensiPage />
  </AntApp>
);

export default WrappedPresensiPage;