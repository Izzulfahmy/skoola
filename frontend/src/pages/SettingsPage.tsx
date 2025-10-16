// file: frontend/src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react'; // <-- Pastikan ini ada
import { Card, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';
import AdminSettingsTab from '../components/AdminSettingsTab';
import JenjangPendidikanTab from '../components/JenjangPendidikanTab';
import JabatanTab from '../components/JabatanTab';
import TingkatanTab from '../components/TingkatanTab';
import JenisUjianTab from '../components/JenisUjianTab';
import ConnectionTestTab from '../components/ConnectionTestTab';
// --- NEW IMPORT ---
import PaperSizeTab from '../components/PaperSizeTab'; // <-- Tambahkan import ini

const { Title } = Typography;

// Hook untuk mendeteksi ukuran layar
// --- DEFINISI useWindowSize DIKEMBALIKAN ---
const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};
// ------------------------------------------

const items: TabsProps['items'] = [
  {
    key: '0', 
    label: 'Ukuran Kertas', // <-- Tab Ukuran Kertas
    children: <PaperSizeTab />, 
  },
  {
    key: '1', 
    label: 'Jenis Ujian',
    children: <JenisUjianTab />,
  },
  {
    key: '2', 
    label: 'Tingkatan Kelas',
    children: <TingkatanTab />,
  },
  {
    key: '3', 
    label: 'Jabatan',
    children: <JabatanTab />,
  },
  {
    key: '4', 
    label: 'Jenjang Pendidikan',
    children: <JenjangPendidikanTab />,
  },
  {
    key: '5', 
    label: 'Pengaturan Admin',
    children: <AdminSettingsTab />,
  },
  {
    key: '6', 
    label: 'Tes Koneksi',
    children: <ConnectionTestTab />,
  },
];

const SettingsPage = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  return (
    <Card>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Pengaturan Sekolah
      </Title>
      <Tabs 
        defaultActiveKey="0" 
        items={items} 
        tabPosition={isMobile ? 'top' : 'right'} 
      />
    </Card>
  );
};

export default SettingsPage;