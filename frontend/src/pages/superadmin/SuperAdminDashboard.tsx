// file: frontend/src/pages/superadmin/SuperAdminDashboard.tsx
import { Card, Col, Row, Statistic, Typography, Space } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getTenants } from '../../api/tenants';

const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const [tenantCount, setTenantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantCount = async () => {
      try {
        const tenants = await getTenants();
        // --- PERBAIKAN DI SINI ---
        // Pastikan tenants adalah array sebelum mengambil .length
        // Jika null atau undefined, anggap jumlahnya 0.
        setTenantCount(tenants?.length || 0);
      } catch (error) {
        console.error("Gagal memuat jumlah sekolah:", error);
        setTenantCount(0); // Set ke 0 jika terjadi error
      } finally {
        setLoading(false);
      }
    };

    fetchTenantCount();
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2}>Dasbor Superadmin</Title>
        <Text type="secondary">Selamat datang! Anda dapat mengelola semua sekolah dari sini.</Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Sekolah Terdaftar"
              value={tenantCount}
              loading={loading}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default SuperAdminDashboard;