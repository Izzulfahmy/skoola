// file: src/layouts/AdminLayout.tsx
import { useState } from 'react';
import {
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography } from 'antd';
// PERUBAHAN 1: Impor `useLocation`
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  // PERUBAHAN 2: Dapatkan informasi lokasi (URL) saat ini
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // PERUBAHAN 3: Buat array untuk memetakan path URL ke key menu
  const menuItems = [
    {
      key: '1',
      path: '/dashboard',
      icon: <DesktopOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '2',
      path: '/teachers',
      icon: <UserOutlined />,
      label: <Link to="/teachers">Data Guru</Link>,
    },
    {
      key: '3',
      path: '/students',
      icon: <TeamOutlined />,
      label: <Link to="/students">Data Siswa</Link>,
    },
  ];
  
  // Cari key menu yang path-nya cocok dengan URL saat ini
  const currentMenuItem = menuItems.find(item => location.pathname.startsWith(item.path));
  const selectedKey = currentMenuItem ? currentMenuItem.key : '1'; // Default ke '1' jika tidak cocok

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', lineHeight: '32px', color: 'white' }}>
          SKOOLA
        </div>
        <Menu
          theme="dark"
          mode="inline"
          // PERUBAHAN 4: Ganti `defaultSelectedKeys` menjadi `selectedKeys` yang dinamis
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <div style={{ marginRight: '24px' }}>
            <Text style={{ marginRight: '16px' }}>Halo, Admin!</Text>
            <Button type="primary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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
        <Footer style={{ textAlign: 'center' }}>
          Skoola Admin Panel ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;