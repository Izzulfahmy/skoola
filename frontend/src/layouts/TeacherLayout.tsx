// file: src/layouts/TeacherLayout.tsx
import { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  IdcardOutlined,
  ApartmentOutlined, // <-- Impor ikon baru
  BookOutlined,       // <-- Impor ikon baru
  EditOutlined,       // <-- Impor ikon baru
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const allMenuItems: MenuProps['items'] = [
    { key: '/teacher/dashboard', icon: <DesktopOutlined />, label: <Link to="/teacher/dashboard">Dashboard</Link> },
    { key: '/teacher/biodata', icon: <IdcardOutlined />, label: <Link to="/teacher/biodata">Biodata</Link> },
    { type: 'divider' },
    { key: '/teacher/my-classes', icon: <ApartmentOutlined />, label: <Link to="/teacher/my-classes">Kelas Saya</Link> },
    { key: '/teacher/materials', icon: <BookOutlined />, label: <Link to="/teacher/materials">Materi Ajar</Link> },
    { key: '/teacher/assessments', icon: <EditOutlined />, label: <Link to="/teacher/assessments">Penilaian Siswa</Link> },
  ];
  
  const validMenuItems = allMenuItems.filter(
    (item): item is { key: string; icon: React.ReactNode; label: React.ReactNode; } => 
      item !== null && typeof item === 'object' && 'key' in item && typeof item.key === 'string'
  );
  
  const activeKey = validMenuItems
    .sort((a, b) => b.key.length - a.key.length)
    .find(item => location.pathname.startsWith(item.key))?.key || '/teacher/dashboard';
  
  const menuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {isMobile || !collapsed ? 'SKOOLA' : 'S'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
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
        token: {
          colorPrimary: '#389e0d',
        },
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
                .ant-menu-inline-collapsed > .ant-menu-item {
                  padding: 0 calc(50% - 16px) !important;
                }
              `}
            </style>
            {menuContent}
          </Sider>
        )}

        <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? siderCollapsedWidth : siderWidth), transition: 'margin-left 0.2s' }}>
          <Header style={{ padding: '0 16px', background: token.colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Button
              type="text"
              icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Space align="center">
              {!isMobile && <Text style={{ marginRight: '8px' }}>Panel Guru</Text>}
              <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
                </a>
              </Dropdown>
            </Space>
          </Header>
          <Content style={{ margin: isMobile ? '16px 8px' : '24px 16px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: isMobile ? 12 : 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, flex: 1 }}>
              <Outlet />
            </div>
            <Footer style={{ textAlign: 'center', padding: '12px 24px', flexShrink: 0 }}>
              Skoola Guru Panel ©{new Date().getFullYear()}
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

export default TeacherLayout;