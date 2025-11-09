import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="Maaf, halaman yang Anda kunjungi tidak ada."
        extra={
          <Button type="primary" onClick={handleBackToLogin}>
            Kembali ke Login
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;