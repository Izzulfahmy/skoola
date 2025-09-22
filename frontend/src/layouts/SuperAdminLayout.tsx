// file: frontend/src/layouts/SuperAdminLayout.tsx
import { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  GoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography, Drawer, Avatar, Dropdown, Space, ConfigProvider, message } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const SuperAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
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
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const mainMenuItems = [
    { key: '/superadmin', icon: <DesktopOutlined />, label: <Link to="/superadmin">Dashboard</Link> },
    { key: '/superadmin/naungan', icon: <GoldOutlined />, label: <Link to="/superadmin/naungan">Naungan</Link> },
    { key: '/superadmin/sekolah', icon: <BankOutlined />, label: <Link to="/superadmin/sekolah">Sekolah</Link> }, // <-- PERUBAHAN DI SINI
  ];

  const sortedMenuItems = [...mainMenuItems].sort((a, b) => b.key.length - a.key.length);
  const activeKey = sortedMenuItems.find(item => location.pathname.startsWith(item.key))?.key || '/superadmin';

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
        items={mainMenuItems}
        onClick={isMobile ? () => setDrawerVisible(false) : undefined}
      />
      <div style={{ flexGrow: 1 }} />
      <Menu
        theme="dark"
        mode="inline"
        onClick={() => message.info('Fitur ini dalam proses pengembangan.')}
        items={[
          { key: 'settings', icon: <SettingOutlined />, label: 'Pengaturan' },
        ]}
      />
    </div>
  );

  const siderWidth = 200;
  const siderCollapsedWidth = 60;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f5222d',
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
             <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                  <Space>
                    <Text>Superadmin</Text>
                    <Avatar style={{ backgroundColor: '#f56a00' }}>S</Avatar>
                  </Space>
                </a>
              </Dropdown>
          </Header>
          <Content style={{
            margin: isMobile ? '16px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}>
            <Outlet />
          </Content>
           <Footer style={{ textAlign: 'center', padding: '12px 24px' }}>
              Skoola Superadmin Panel ©{new Date().getFullYear()}
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
    </ConfigProvider>
  );
};

export default SuperAdminLayout;