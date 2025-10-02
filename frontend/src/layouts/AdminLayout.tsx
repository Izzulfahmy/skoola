// file: frontend/src/layouts/AdminLayout.tsx
import { useState, useMemo } from 'react';
import { Layout, Menu, theme, Dropdown, Button, Space, Typography, Select } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  ReadOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  StarOutlined,
  FormOutlined, // <-- Import Icon Baru (FormOutlined untuk Ujian)
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/auth';
import { useTahunAjaran } from '../hooks/useTahunAjaran';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

// Fungsi untuk membuat item menu (untuk konsistensi)
const getItem = (
  label: string,
  key: string,
  icon: React.ReactNode,
  path?: string,
  children?: MenuItem[],
  disabled?: boolean
): MenuItem => {
  return {
    key,
    icon,
    label,
    path,
    children,
    disabled,
  };
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    tahunAjaranOptions,
    activeTahunAjaran,
    setActiveTahunAjaran,
  } = useTahunAjaran();

  const handleMenuClick = (e: { key: string }) => {
    const item = menuItems.find(i => i.key === e.key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  const handleDropdownClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    } else if (e.key === 'profile') {
      navigate('/admin/profile');
    }
  };

  const dropdownMenu = (
    <Menu onClick={handleDropdownClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil Sekolah
      </Menu.Item>
      <Menu.Item key="logout" icon={<SolutionOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const menuItems: MenuItem[] = useMemo(() => {
    return [
      getItem('Dashboard', '/', <HomeOutlined />, '/'),
      getItem('Guru & Pegawai', '/teachers', <UserOutlined />, '/teachers'),
      getItem('Siswa', '/students', <TeamOutlined />, '/students'),
      getItem('Rombel', '/rombel', <ReadOutlined />, '/rombel'),
      // --- PENAMBAHAN MENU BARU DI SINI ---
      getItem('Ujian', '/ujian', <FormOutlined />, '/ujian'),
      // ------------------------------------
      getItem('Presensi', '/presensi', <CheckSquareOutlined />, '/presensi'),
      getItem('Prestasi', '/prestasi', <StarOutlined />, '/prestasi'),
      getItem('Ekstrakurikuler', '/ekstrakurikuler', <BookOutlined />, '/ekstrakurikuler'),
      getItem('Akademik', '/akademik', <CalendarOutlined />, undefined, [
        getItem('Tahun Ajaran', '/tahun-ajaran', <CalendarOutlined />, '/tahun-ajaran'),
        getItem('Kurikulum', '/kurikulum', <BookOutlined />, '/kurikulum'),
        getItem('Mata Pelajaran', '/mata-pelajaran', <ReadOutlined />, '/mata-pelajaran'),
      ]),
      getItem('Pengaturan', '/settings', <SettingOutlined />, '/settings', [
        getItem('Jenjang Pendidikan', '/settings/jenjang', <SettingOutlined />, '/settings/jenjang'),
        getItem('Tingkatan', '/settings/tingkatan', <SettingOutlined />, '/settings/tingkatan'),
        getItem('Jabatan', '/settings/jabatan', <SettingOutlined />, '/settings/jabatan'),
        getItem('Jenis Ujian', '/settings/jenis-ujian', <SettingOutlined />, '/settings/jenis-ujian'),
        getItem('Pengaturan Admin', '/settings/admin', <SettingOutlined />, '/settings/admin'),
      ]),
    ];
  }, []);

  const findOpenKeys = (items: MenuItem[], path: string, currentKeys: string[] = []): string[] => {
    for (const item of items) {
      if (item.path === path) {
        return currentKeys;
      }
      if (item.children) {
        const foundKeys = findOpenKeys(item.children, path, [...currentKeys, item.key]);
        if (foundKeys.length > currentKeys.length) {
          return foundKeys;
        }
      }
    }
    return [];
  };

  const selectedKey = location.pathname;
  const openKeys = useMemo(() => findOpenKeys(menuItems, selectedKey), [menuItems, selectedKey]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          className="logo-vertical"
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          <Link to="/">SKOOLA</Link>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 24,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Space>
            {/* Pemilihan Tahun Ajaran Aktif */}
            <Text style={{ marginRight: 8 }}>Tahun Ajaran Aktif:</Text>
            <Select
              value={activeTahunAjaran?.id}
              style={{ width: 200 }}
              options={tahunAjaranOptions.map(ta => ({
                value: ta.id,
                label: ta.nama,
              }))}
              onChange={(value) => {
                const selectedTa = tahunAjaranOptions.find(ta => ta.id === value);
                if (selectedTa) {
                  setActiveTahunAjaran(selectedTa);
                }
              }}
              dropdownMatchSelectWidth={false}
            />

            <Dropdown overlay={dropdownMenu} placement="bottomRight" arrow>
              <Button type="text" style={{ padding: '0 10px' }}>
                <Space>
                  <Text strong>{user?.name || user?.username}</Text>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getInitials(user?.name || user?.username || 'Admin')}
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;