// file: frontend/src/pages/SettingsPage.tsx
import { Card, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';
// --- 1. IMPOR KOMPONEN BARU ---
import AdminSettingsTab from '../components/AdminSettingsTab';

const { Title } = Typography;

// --- Komponen Placeholder untuk Tab lain ---
const TingkatanTab = () => (
  <div>
    <p>Konten untuk manajemen Tingkatan Kelas akan ditampilkan di sini.</p>
  </div>
);

const JabatanTab = () => (
  <div>
    <p>Konten untuk manajemen Jabatan akan ditampilkan di sini.</p>
  </div>
);

const JenjangPendidikanTab = () => (
  <div>
    <p>Konten untuk manajemen Jenjang Pendidikan akan ditampilkan di sini.</p>
  </div>
);

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Tingkatan Kelas',
    children: <TingkatanTab />,
  },
  {
    key: '2',
    label: 'Jabatan',
    children: <JabatanTab />,
  },
  {
    key: '3',
    label: 'Jenjang Pendidikan',
    children: <JenjangPendidikanTab />,
  },
  {
    key: '4',
    label: 'Pengaturan Admin',
    // --- 2. GUNAKAN KOMPONEN BARU DI SINI ---
    children: <AdminSettingsTab />,
  },
];

const SettingsPage = () => {
  return (
    <Card>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Pengaturan Sekolah
      </Title>
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default SettingsPage;