// file: src/layouts/AdminLayout.tsx
import { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  LogoutOutlined,
  SettingOutlined,
  CalendarOutlined, // <-- 1. IMPORT ICON BARU
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Pengaturan Akun',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings', { state: { openTab: '4' } }),
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

  // --- 2. PERBARUI DAFTAR MENU UTAMA ---
  const mainMenuItems = [
    { key: '/dashboard', icon: <DesktopOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/profile', icon: <BankOutlined />, label: <Link to="/profile">Profil Sekolah</Link> },
    { key: '/tahun-ajaran', icon: <CalendarOutlined />, label: <Link to="/tahun-ajaran">Tahun Pelajaran</Link> },
    { key: '/teachers', icon: <UserOutlined />, label: <Link to="/teachers">Data Guru</Link> },
    { key: '/students', icon: <TeamOutlined />, label: <Link to="/students">Data Siswa</Link> },
  ];
  
  const activeKey = mainMenuItems.find(item => location.pathname.startsWith(item.key))?.key || '/dashboard';

  const menuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {isMobile || !collapsed ? 'SKOOLA' : ''}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey, location.pathname]}
        items={mainMenuItems}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
      />
      
      <div style={{ flexGrow: 1 }} />

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
        items={[
          { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Pengaturan</Link> },
        ]}
      />
    </div>
  );

  const siderWidth = 200;
  const siderCollapsedWidth = 60;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={siderWidth}
          collapsedWidth={siderCollapsedWidth}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
          }}
        >
          {menuContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? siderCollapsedWidth : siderWidth), transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space align="center">
            {!isMobile && <Text style={{ marginRight: '8px' }}>Halo, Admin!</Text>}
            <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              </a>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: isMobile ? '16px 8px' : '24px 16px', padding: isMobile ? 12 : 24,
          background: colorBgContainer, borderRadius: borderRadiusLG,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', padding: '12px 24px' }}>
          Skoola Admin Panel ©{new Date().getFullYear()}
        </Footer>
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
  );
};

export default AdminLayout;