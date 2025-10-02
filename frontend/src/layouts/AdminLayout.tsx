// file: frontend/src/layouts/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  LogoutOutlined,
  SettingOutlined,
  CalendarOutlined,
  BookOutlined,
  ProjectOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  ExperimentOutlined, // Ikon untuk Ekstrakurikuler/Ujian
  FormOutlined, // <-- Menggunakan FormOutlined untuk Menu Ujian (lebih kontekstual)
} from '@ant-design/icons';
// Hapus Avatar dari import karena sudah diakses via Dropdown/Space, atau biarkan jika digunakan
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space, ConfigProvider } from 'antd'; 
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Impor useTahunAjaran (walaupun tidak terlihat di kode yang Anda berikan, ini penting untuk Admin Panel)
// import { useTahunAjaran } from '../hooks/useTahunAjaran'; 

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Asumsi: useAuth() sudah mengembalikan user
  const { logout, user } = useAuth(); // Tambahkan user
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = theme.useToken();

  // Fix 6133: Hapus useEffect jika tidak digunakan (tapi di sini digunakan untuk resize)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Pengaturan Akun',
      icon: <SettingOutlined />,
      // Asumsi rute settings ada di '/settings'
      onClick: () => navigate('/settings'), 
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  // --- Item menu diperbarui untuk memasukkan Ujian ---
  const allMenuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <DesktopOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/profile', icon: <BankOutlined />, label: <Link to="/profile">Profil Sekolah</Link> },
    { key: '/tahun-ajaran', icon: <CalendarOutlined />, label: <Link to="/tahun-ajaran">Tahun Pelajaran</Link> },
    { key: '/kurikulum', icon: <ProjectOutlined />, label: <Link to="/kurikulum">Kurikulum</Link> },
    { key: '/mata-pelajaran', icon: <BookOutlined />, label: <Link to="/mata-pelajaran">Mata Pelajaran</Link> },
    { key: '/teachers', icon: <UserOutlined />, label: <Link to="/teachers">Data Guru</Link> },
    { key: '/students', icon: <TeamOutlined />, label: <Link to="/students">Data Siswa</Link> },
    { key: '/rombel', icon: <ApartmentOutlined />, label: <Link to="/rombel">Rombongan Belajar</Link> },
    
    // --- PENAMBAHAN MENU UJIAN ---
    { key: '/ujian', icon: <FormOutlined />, label: <Link to="/ujian">Ujian & Penilaian</Link> }, 
    
    {
      key: '/ekstrakurikuler',
      icon: <ExperimentOutlined />,
      label: <Link to="/ekstrakurikuler">Ekstrakurikuler</Link>,
    },
    { key: '/presensi', icon: <SolutionOutlined />, label: <Link to="/presensi">Presensi</Link> },
    { type: 'divider' },
    { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Pengaturan</Link> },
  ];
  // ----------------------------------------------------

  // Menyaring item menu yang valid dan memiliki key, untuk menghindari error saat iterasi
  const validMenuItems = allMenuItems.filter(
    // Kita harus memastikan item adalah objek dan memiliki key yang berupa string/React.Key
    (item): item is { key: string | number; icon: React.ReactNode; label: React.ReactNode; } => 
      item !== null && typeof item === 'object' && 'key' in item && item.key !== undefined
  );
  
  // Logika activeKey yang disederhanakan
  const activeKey = validMenuItems
    // Sortir dari path terpanjang ke terpendek agar match yang lebih spesifik diprioritaskan
    .sort((a, b) => (typeof b.key === 'string' ? b.key.length : 0) - (typeof a.key === 'string' ? a.key.length : 0))
    // Temukan key yang path-nya cocok dengan awal pathname (misal: /rombel/detail cocok dengan /rombel)
    .find(item => typeof item.key === 'string' && location.pathname.startsWith(item.key))?.key || '/dashboard';
  
  const menuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {isMobile || !collapsed ? 'Admin Panel' : ''}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        // selectedKeys harus berupa string[]
        selectedKeys={[activeKey.toString()]} 
        items={allMenuItems}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
        style={{ flex: 1, borderRight: 0 }}
      />
    </div>
  );

  const siderWidth = 200;
  const siderCollapsedWidth = 60;

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: 'rgba(255, 255, 255, 0.15)',
            itemSelectedColor: '#FFFFFF',
            itemBorderRadius: 6,
            itemMarginInline: 8,
          },
        },
      }}
    >
      <Layout style={{ height: '100vh' }}>
        {!isMobile && (
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            width={siderWidth}
            collapsedWidth={siderCollapsedWidth}
            style={{
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
             <style>
              {`
                /* Styling untuk mengatasi padding saat menu collapse */
                .ant-menu-inline-collapsed > .ant-menu-item {
                  padding: 0 calc(50% - 16px) !important;
                }
              `}
            </style>
            {menuContent}
          </Sider>
        )}

        <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? siderCollapsedWidth : siderWidth), transition: 'margin-left 0.2s' }}>
          <Header style={{ padding: '0 16px', background: token.colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, height: 48, lineHeight: '48px' }}>
            <Button
              type="text"
              icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
            <Space align="center">
              {/* Menggunakan user.name atau username jika tersedia */}
              {!isMobile && <Text style={{ marginRight: '8px' }}>Halo, {user?.name || user?.username || 'Admin'}!</Text>}
              <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                </a>
              </Dropdown>
            </Space>
          </Header>
          <Content style={{ margin: isMobile ? '16px 8px' : '24px 16px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: isMobile ? 12 : 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, flex: 1 }}>
              <Outlet />
            </div>
            <Footer style={{ textAlign: 'center', padding: '12px 24px', flexShrink: 0 }}>
              Skoola Admin Panel ©{new Date().getFullYear()}
            </Footer>
          </Content>
        </Layout>

        {isMobile && (
          <Drawer
            placement="left"
            closable={false} 
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0, backgroundColor: '#001529' }}
            width={siderWidth}
          >
            {menuContent}
          </Drawer>
        )}
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;