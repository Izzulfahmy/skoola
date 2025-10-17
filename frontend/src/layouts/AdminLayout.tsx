// frontend/src/layouts/AdminLayout.tsx
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
  ExperimentOutlined, 
  FormOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space, ConfigProvider } from 'antd'; 
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
// Fix 1: Removed 'Text' from the Typography destructuring as it is unused.
const {} = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Fix 2: Removed 'user' from the useAuth destructuring as it is unused.
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = theme.useToken();

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
      onClick: () => navigate('/admin/settings'),
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

  const allMenuItems: MenuProps['items'] = [
    { key: '/admin/dashboard', icon: <DesktopOutlined />, label: <Link to="/admin/dashboard">Dashboard</Link> },
    { key: '/admin/profile', icon: <BankOutlined />, label: <Link to="/admin/profile">Profil Sekolah</Link> },
    { key: '/admin/tahun-ajaran', icon: <CalendarOutlined />, label: <Link to="/admin/tahun-ajaran">Tahun Pelajaran</Link> },
    { key: '/admin/kurikulum', icon: <ProjectOutlined />, label: <Link to="/admin/kurikulum">Kurikulum</Link> },
    { key: '/admin/mata-pelajaran', icon: <BookOutlined />, label: <Link to="/admin/mata-pelajaran">Mata Pelajaran</Link> },
    { key: '/admin/teachers', icon: <UserOutlined />, label: <Link to="/admin/teachers">Data Guru</Link> },
    { key: '/admin/students', icon: <TeamOutlined />, label: <Link to="/admin/students">Data Siswa</Link> },
    { key: '/admin/rombel', icon: <ApartmentOutlined />, label: <Link to="/admin/rombel">Rombel</Link> },
    { key: '/admin/ujian', icon: <FormOutlined />, label: <Link to="/admin/ujian">Ujian</Link> }, 
    {
      key: '/admin/ekstrakurikuler',
      icon: <ExperimentOutlined />,
      label: <Link to="/admin/ekstrakurikuler">Ekstrakurikuler</Link>,
    },
    { key: '/admin/presensi', icon: <SolutionOutlined />, label: <Link to="/admin/presensi">Presensi</Link> },
    { key: '/admin/rapor', icon: <ReadOutlined />, label: <Link to="/admin/rapor">Rapor</Link> },
    { type: 'divider' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: <Link to="/admin/settings">Pengaturan</Link> },
  ];

  const validMenuItems = allMenuItems.filter(
    (item): item is { key: string | number; icon: React.ReactNode; label: React.ReactNode; } => 
      item !== null && typeof item === 'object' && 'key' in item && item.key !== undefined
  );
  
  const activeKey = validMenuItems
    .sort((a, b) => (typeof b.key === 'string' ? b.key.length : 0) - (typeof a.key === 'string' ? a.key.length : 0))
    .find(item => typeof item.key === 'string' && location.pathname.startsWith(item.key))?.key || '/admin/dashboard';
  
  const menuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif',
        flexShrink: 0,
      }}>
        {isMobile || !collapsed ? 'Admin Panel' : ''} 
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey.toString()]} 
        items={allMenuItems}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
        style={{ flex: 1, borderRight: 0, overflowY: 'auto' }}
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
      <Layout style={{ minHeight: '100vh' }}>
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
              overflowY: 'auto',
            }}
          >
             <style>
              {`
                .ant-menu-inline-collapsed > .ant-menu-item {
                  padding: 0 calc(50% - 16px) !important;
                }
              `}
            </style>
            <div style={{ height: '100%' }}>
              {menuContent}
            </div>
          </Sider>
        )}

        <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? siderCollapsedWidth : siderWidth), transition: 'margin-left 0.2s', minHeight: '100vh' }}>
          <Header style={{ padding: '0 16px', background: token.colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, height: 48, lineHeight: '48px' }}>
            <Button
              type="text"
              icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
            <Space align="center">
              <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                </a>
              </Dropdown>
            </Space>
          </Header>
          <Content style={{ margin: isMobile ? '16px 8px' : '24px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: isMobile ? 12 : 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, flex: 1, overflow: 'auto' }}>
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