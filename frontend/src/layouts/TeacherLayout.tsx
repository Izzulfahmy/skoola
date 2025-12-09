import { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  BookOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const { logout, user } = useAuth();
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

  // --- MENU ITEMS ---
  const allMenuItems: MenuProps['items'] = [
    { key: '/teacher/dashboard', icon: <DesktopOutlined />, label: 'Dashboard' },
    { key: '/teacher/biodata', icon: <IdcardOutlined />, label: 'Biodata' },
    { type: 'divider' },
    // PERBAIKAN: Mengganti Kelas Saya menjadi Penugasan
    { key: '/teacher/penugasan', icon: <ApartmentOutlined />, label: 'Penugasan' },
    { key: '/teacher/materi-ajar', icon: <BookOutlined />, label: 'Materi Ajar' },
    { key: '/teacher/penilaian', icon: <EditOutlined />, label: 'Penilaian Siswa' },
  ];
  
  // --- FUNGSI NAVIGASI ---
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);

    // Tutup drawer jika di mode mobile
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  // Logika untuk menyorot menu yang aktif
  let activeKey = location.pathname;

  // Penyesuaian highlight jika berada di sub-halaman
  if (location.pathname === '/teacher' || location.pathname === '/teacher/') {
    activeKey = '/teacher/dashboard';
  } else if (location.pathname.startsWith('/teacher/penilaian')) {
    activeKey = '/teacher/penilaian'; // Highlight menu penilaian
  } else if (location.pathname.startsWith('/teacher/materi-ajar')) {
    activeKey = '/teacher/materi-ajar'; // Highlight menu materi ajar
  } else if (location.pathname.startsWith('/teacher/penugasan')) {
    activeKey = '/teacher/penugasan'; // Highlight menu penugasan
  }
  
  const menuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {isMobile || !collapsed ? 'Guru Panel' : ''}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
        items={allMenuItems}
        onClick={handleMenuClick}
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
              <Text style={{ marginRight: '8px', fontWeight: 500 }}>{user?.name || 'Panel Guru'}</Text>
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