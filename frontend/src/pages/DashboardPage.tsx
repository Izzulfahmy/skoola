// file: src/pages/DashboardPage.tsx
import { Button, Typography } from 'antd';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <Title>Selamat Datang di Dashboard!</Title>
      <Paragraph>Anda telah berhasil login.</Paragraph>
      <Button type="primary" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default DashboardPage;