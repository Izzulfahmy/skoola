// file: frontend/src/pages/EkstrakurikulerPage.tsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Layout, 
  Select, 
  Empty, 
  Alert, 
  Tabs, 
  Badge, 
  message,
  List,
  Skeleton,
  Avatar,
  Space,
  Divider,
  Grid,
  Button,
  Drawer
} from 'antd';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import { getAllEkstrakurikuler, getOrCreateSesi } from '../api/ekstrakurikuler';
import type { TahunAjaran, Ekstrakurikuler, EkstrakurikulerSesi } from '../types';
import EkstrakurikulerDetailTab from '../components/EkstrakurikulerDetailTab';
import EkstrakurikulerAnggotaTab from '../components/EkstrakurikulerAnggotaTab';
import { ExperimentOutlined, AppstoreOutlined, MenuOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const EkstrakurikulerPage = () => {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [ekskulList, setEkskulList] = useState<Ekstrakurikuler[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string | null>(null);
  const [selectedEkskulId, setSelectedEkskulId] = useState<number | null>(null);
  const [selectedEkskul, setSelectedEkskul] = useState<Ekstrakurikuler | null>(null);
  const [currentSesi, setCurrentSesi] = useState<EkstrakurikulerSesi | null>(null);
  
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screens = useBreakpoint();

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
    } else {
      setCurrentSesi(null);
    }
  }, [selectedEkskulId, selectedTahunAjaranId]);

  const handleEkskulSelect = (id: number) => {
    setSelectedEkskulId(id);
    const ekskul = ekskulList.find(e => e.id === id) || null;
    setSelectedEkskul(ekskul);
    if (!screens.lg) { // Close drawer on selection in mobile view
      setDrawerVisible(false);
    }
  };
  
  const refreshSesi = () => {
    if (selectedEkskulId && selectedTahunAjaranId) {
      getOrCreateSesi(selectedEkskulId, selectedTahunAjaranId).then(setCurrentSesi);
    }
  };

  const renderEkskulList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Space direction="vertical" style={{ width: '100%', padding: '16px' }}>
        <Text strong>Tahun Ajaran</Text>
        <Select
          style={{ width: '100%' }}
          value={selectedTahunAjaranId}
          onChange={(value) => {
            setSelectedTahunAjaranId(value);
            setSelectedEkskulId(null);
            setSelectedEkskul(null);
          }}
          options={tahunAjaranList.map(ta => ({
            value: ta.id,
            label: `${ta.nama_tahun_ajaran} (${ta.status})`,
          }))}
          loading={isListLoading}
        />
      </Space>
      <Divider style={{ margin: 0 }} />
      {isListLoading ? <Skeleton active paragraph={{ rows: 5 }} style={{ padding: '16px' }} /> : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <List
            dataSource={ekskulList}
            renderItem={item => {
              const isSelected = selectedEkskulId === item.id;
              return (
                <List.Item
                  onClick={() => handleEkskulSelect(item.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#e6f4ff' : 'transparent',
                    border: isSelected ? '1px solid #91caff' : '1px solid transparent',
                    marginBottom: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExperimentOutlined />} style={{ backgroundColor: isSelected ? '#1677ff' : '#E0E0E0' }} />}
                    title={<Text strong={isSelected}>{item.nama_kegiatan}</Text>}
                  />
                </List.Item>
              );
            }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Tidak ada data" /> }}
          />
        </div>
      )}
    </div>
  );

  const renderDetailPanel = () => {
    if (isDetailLoading) {
      return <Card><Skeleton active avatar paragraph={{ rows: 5 }} /></Card>;
    }
    if (!selectedEkskul || !currentSesi) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '15vh' }}>
          <Empty
            image={<AppstoreOutlined style={{ fontSize: 64, color: '#e0e0e0' }} />}
            description={
              <>
                <Title level={5}>Belum ada ekstrakurikuler yang dipilih</Title>
                <Text type="secondary">Pilih salah satu kegiatan untuk melihat detailnya.</Text>
              </>
            } 
          />
        </div>
      );
    }

    const tabs = [
      {
        key: 'detail',
        label: 'Detail Pembina',
        children: <EkstrakurikulerDetailTab sesi={currentSesi} onSesiUpdate={refreshSesi} />,
      },
      {
        key: 'anggota',
        label: (
          <Space size="small">
            <span>Anggota</span>
            <Badge count={currentSesi.jumlah_anggota} showZero color={currentSesi.jumlah_anggota > 0 ? 'blue' : 'grey'} />
          </Space>
        ),
        children: <EkstrakurikulerAnggotaTab sesi={currentSesi} onAnggotaUpdate={refreshSesi} tahunAjaranId={selectedTahunAjaranId} />,
      },
    ];

    return (
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>{selectedEkskul.nama_kegiatan}</Title>
        <Paragraph type="secondary">{selectedEkskul.deskripsi || 'Tidak ada deskripsi.'}</Paragraph>
        <Divider />
        <Tabs defaultActiveKey="detail" items={tabs} />
      </Card>
    );
  };

  const pageTitle = (
    <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>Manajemen Ekstrakurikuler</Title>
      {!screens.lg && (
        <Button icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)}>
          Pilih Ekstrakurikuler
        </Button>
      )}
    </Space>
  );

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card title={pageTitle}>
      <Layout style={{ background: 'transparent' }}>
        {screens.lg ? (
          <Sider width={320} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0', marginRight: '16px' }}>
            {renderEkskulList()}
          </Sider>
        ) : (
          <Drawer
            title="Daftar Ekstrakurikuler"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            {renderEkskulList()}
          </Drawer>
        )}
        <Content>
          {renderDetailPanel()}
        </Content>
      </Layout>
    </Card>
  );
};

export default EkstrakurikulerPage;