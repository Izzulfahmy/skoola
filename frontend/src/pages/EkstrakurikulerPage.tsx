// file: frontend/src/pages/EkstrakurikulerPage.tsx
import { useState, useEffect } from 'react';
import { Card, Typography, Layout, Menu, Select, Spin, Empty, Alert, Tabs, Badge, message } from 'antd';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllEkstrakurikuler, getOrCreateSesi } from '../api/ekstrakurikuler';
import type { TahunAjaran, Ekstrakurikuler, EkstrakurikulerSesi } from '../types';
import EkstrakurikulerDetailTab from '../components/EkstrakurikulerDetailTab';
import EkstrakurikulerAnggotaTab from '../components/EkstrakurikulerAnggotaTab';

const { Title } = Typography;
const { Sider, Content } = Layout;

const EkstrakurikulerPage = () => {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [ekskulList, setEkskulList] = useState<Ekstrakurikuler[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string | null>(null);
  const [selectedEkskulId, setSelectedEkskulId] = useState<number | null>(null);
  const [selectedEkskul, setSelectedEkskul] = useState<Ekstrakurikuler | null>(null);
  const [currentSesi, setCurrentSesi] = useState<EkstrakurikulerSesi | null>(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsListLoading(true);
      setError(null);
      try {
        const [tahunAjaranData, ekskulData] = await Promise.all([
          getAllTahunAjaran(),
          getAllEkstrakurikuler(),
        ]);

        setTahunAjaranList(tahunAjaranData);
        setEkskulList(ekskulData);
        
        const aktif = tahunAjaranData.find(ta => ta.status.toLowerCase() === 'aktif');
        if (aktif) {
          setSelectedTahunAjaranId(aktif.id);
        } else if (tahunAjaranData.length > 0) {
          setSelectedTahunAjaranId(tahunAjaranData[0].id);
        }
      } catch (err) {
        setError('Gagal memuat data awal.');
      } finally {
        setIsListLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEkskulId && selectedTahunAjaranId) {
      const fetchSesi = async () => {
        setIsDetailLoading(true);
        setCurrentSesi(null);
        try {
          const sesiData = await getOrCreateSesi(selectedEkskulId, selectedTahunAjaranId);
          setCurrentSesi(sesiData);
        } catch (err) {
          message.error('Gagal memuat detail sesi ekstrakurikuler.');
        } finally {
          setIsDetailLoading(false);
        }
      };
      fetchSesi();
    }
  }, [selectedEkskulId, selectedTahunAjaranId]);

  const handleEkskulSelect = (id: number) => {
    setSelectedEkskulId(id);
    const ekskul = ekskulList.find(e => e.id === id) || null;
    setSelectedEkskul(ekskul);
  };
  
  const refreshSesi = () => {
    if (selectedEkskulId && selectedTahunAjaranId) {
      getOrCreateSesi(selectedEkskulId, selectedTahunAjaranId).then(setCurrentSesi);
    }
  };

  const DetailPanel = () => {
    if (isDetailLoading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }
    if (!selectedEkskul || !currentSesi) {
      return <Empty description="Pilih ekstrakurikuler dari daftar di sebelah kiri untuk memulai" />;
    }

    const items = [
      {
        key: 'detail',
        label: 'Detail',
        children: <EkstrakurikulerDetailTab sesi={currentSesi} onSesiUpdate={refreshSesi} />,
      },
      {
        key: 'anggota',
        label: <Badge count={currentSesi.jumlah_anggota} size="small"><span>Anggota</span></Badge>,
        children: <EkstrakurikulerAnggotaTab sesi={currentSesi} onAnggotaUpdate={refreshSesi} tahunAjaranId={selectedTahunAjaranId} />,
      },
    ];

    return (
      <Card title={`Detail: ${selectedEkskul.nama_kegiatan}`}>
        <Tabs defaultActiveKey="detail" items={items} />
      </Card>
    );
  };

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (isListLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <Layout style={{ background: '#fff' }}>
      <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <Title level={5}>Pilih Tahun Ajaran</Title>
          <Select
            style={{ width: '100%' }}
            value={selectedTahunAjaranId}
            onChange={(value) => setSelectedTahunAjaranId(value)}
            options={tahunAjaranList.map(ta => ({
              value: ta.id,
              label: `${ta.nama_tahun_ajaran} (${ta.status})`,
            }))}
            loading={isListLoading}
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedEkskulId ? [String(selectedEkskulId)] : []}
          onSelect={({ key }) => handleEkskulSelect(Number(key))}
          items={ekskulList.map(e => ({
            key: e.id,
            label: e.nama_kegiatan,
          }))}
        />
        {ekskulList.length === 0 && (
            <div style={{padding: '16px'}}>
                <Empty description="Belum ada data master ekstrakurikuler. Silakan tambah di menu Pengaturan."/>
            </div>
        )}
      </Sider>
      <Content style={{ padding: '24px', minHeight: 280 }}>
        <DetailPanel />
      </Content>
    </Layout>
  );
};

export default EkstrakurikulerPage;