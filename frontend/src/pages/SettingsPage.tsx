// file: frontend/src/pages/SettingsPage.tsx
import { Card, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';
import AdminSettingsTab from '../components/AdminSettingsTab';
import JenjangPendidikanTab from '../components/JenjangPendidikanTab';
import JabatanTab from '../components/JabatanTab';
import TingkatanTab from '../components/TingkatanTab';
import JenisUjianTab from '../components/JenisUjianTab'; // <-- Impor komponen baru

const { Title } = Typography;

const items: TabsProps['items'] = [
  {
    key: '0',
    label: 'Jenis Ujian',
    children: <JenisUjianTab />,
  },
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
    children: <AdminSettingsTab />,
  },
];

const SettingsPage = () => {
  return (
    <Card>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Pengaturan Sekolah
      </Title>
      <Tabs defaultActiveKey="0" items={items} />
    </Card>
  );
};

export default SettingsPage;