// file: frontend/src/pages/superadmin/SuperAdminDashboard.tsx
import { Card, Col, Row, Statistic, Typography, Space } from 'antd';
import { BankOutlined, GoldOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getTenants } from '../../api/tenants';
import { getAllNaungan } from '../../api/naungan'; // <-- Diubah

const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const [tenantCount, setTenantCount] = useState(0);
  const [naunganCount, setNaunganCount] = useState(0); // <-- Diubah
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tenants, naunganList] = await Promise.all([ // <-- Diubah
          getTenants(),
          getAllNaungan(), // <-- Diubah
        ]);
        
        setTenantCount(tenants?.length || 0);
        setNaunganCount(naunganList?.length || 0); // <-- Diubah

      } catch (error) {
        console.error("Gagal memuat data statistik:", error);
        setTenantCount(0);
        setNaunganCount(0); // <-- Diubah
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
              title="Total Naungan Terdaftar" // <-- Diubah
              value={naunganCount} // <-- Diubah
              loading={loading}
              prefix={<GoldOutlined />}
            />
          </Card>
        </Col>

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