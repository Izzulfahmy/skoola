// file: frontend/src/pages/SettingsPage.tsx
import { Card, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';

const { Title } = Typography;

// --- Komponen Placeholder untuk setiap Tab ---

const TingkatanTab = () => (
  <div>
    {/* Nanti di sini akan ada tabel dan tombol untuk mengelola Tingkatan Kelas */}
    <p>Konten untuk manajemen Tingkatan Kelas akan ditampilkan di sini.</p>
  </div>
);

const JabatanTab = () => (
  <div>
    {/* Nanti di sini akan ada tabel dan tombol untuk mengelola Jabatan */}
    <p>Konten untuk manajemen Jabatan akan ditampilkan di sini.</p>
  </div>
);

const JenjangPendidikanTab = () => (
  <div>
    {/* Nanti di sini akan ada tabel dan tombol untuk mengelola Jenjang Pendidikan */}
    <p>Konten untuk manajemen Jenjang Pendidikan akan ditampilkan di sini.</p>
  </div>
);

const PengaturanAdminTab = () => (
  <div>
    {/* Nanti di sini akan ada form untuk pengaturan admin */}
    <p>Konten untuk Pengaturan Admin akan ditampilkan di sini.</p>
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
    children: <PengaturanAdminTab />,
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