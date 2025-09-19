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
      key: '1',
      label: 'Pengaturan',
      icon: <SettingOutlined />,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuItems = [
    { key: '1', path: '/dashboard', icon: <DesktopOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '4', path: '/profile', icon: <BankOutlined />, label: <Link to="/profile">Profil Sekolah</Link> },
    { key: '2', path: '/teachers', icon: <UserOutlined />, label: <Link to="/teachers">Data Guru</Link> },
    { key: '3', path: '/students', icon: <TeamOutlined />, label: <Link to="/students">Data Siswa</Link> },
  ];
  
  const currentMenuItem = menuItems.find(item => location.pathname.startsWith(item.path));
  const selectedKey = currentMenuItem ? currentMenuItem.key : '1';

  const menuContent = (
    <>
      <div style={{
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {isMobile || !collapsed ? 'SKOOLA' : ''}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          collapsedWidth={60}
        >
          {menuContent}
        </Sider>
      )}

      <Layout>
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
                {/* --- PERUBAHAN WARNA DI SINI --- */}
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              </a>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: isMobile ? '16px 8px' : '24px 16px', padding: isMobile ? 12 : 24,
          minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', padding: '1px 24px' }}>
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
          width={200}
        >
          {menuContent}
        </Drawer>
      )}
    </Layout>
  );
};

export default AdminLayout;