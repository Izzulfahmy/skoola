// file: frontend/src/pages/superadmin/SuperAdminDashboard.tsx
import { Card, Col, Row, Statistic, Typography, Space } from 'antd';
import { BankOutlined, GoldOutlined } from '@ant-design/icons'; // <-- Impor ikon baru
import { useEffect, useState } from 'react';
import { getTenants } from '../../api/tenants';
import { getFoundations } from '../../api/foundations'; // <-- Impor API yayasan

const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const [tenantCount, setTenantCount] = useState(0);
  const [foundationCount, setFoundationCount] = useState(0); // <-- State baru untuk jumlah yayasan
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // --- PERBAIKAN DI SINI: Ambil data sekolah dan yayasan secara bersamaan ---
        const [tenants, foundations] = await Promise.all([
          getTenants(),
          getFoundations(),
        ]);
        
        setTenantCount(tenants?.length || 0);
        setFoundationCount(foundations?.length || 0);

      } catch (error) {
        console.error("Gagal memuat data statistik:", error);
        // Set ke 0 jika terjadi error
        setTenantCount(0);
        setFoundationCount(0);
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
        {/* --- KARTU STATISTIK BARU UNTUK YAYASAN --- */}
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Yayasan Terdaftar"
              value={foundationCount}
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