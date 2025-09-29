import { useState } from 'react';
import { Button, Card, Typography, message, Row, Col, Statistic, Progress, Tag } from 'antd';
import { RocketOutlined, WifiOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { testConnection, type ConnectionTestResult } from '../api/connection';

const { Title, Paragraph, Text } = Typography;

const ConnectionTestTab = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const handleRunTest = async () => {
    setLoading(true);
    setResult(null);
    message.loading({ content: 'Memulai tes koneksi...', key: 'connTest' });
    try {
      const data = await testConnection();
      setResult(data);
      message.success({ content: 'Tes koneksi selesai!', key: 'connTest', duration: 2 });
    } catch (error) {
      message.error({ content: 'Gagal menjalankan tes koneksi.', key: 'connTest', duration: 2 });
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk menentukan warna dan status berdasarkan kecepatan
  const getBandwidthStatus = (bandwidth: number) => {
    if (bandwidth > 50) return { color: '#52c41a', text: 'Sangat Cepat', percent: 100 };
    if (bandwidth > 25) return { color: '#52c41a', text: 'Cepat', percent: 80 };
    if (bandwidth > 10) return { color: '#faad14', text: 'Cukup Baik', percent: 60 };
    if (bandwidth > 5) return { color: '#faad14', text: 'Lambat', percent: 40 };
    return { color: '#f5222d', text: 'Sangat Lambat', percent: 20 };
  };

  // Helper function untuk menentukan warna berdasarkan latensi
  const getLatencyColor = (latency: number) => {
    if (latency < 100) return '#52c41a'; // Hijau
    if (latency < 300) return '#faad14'; // Kuning
    return '#f5222d'; // Merah
  };

  // --- KONTEN LOADING BARU ---
  const renderLoadingState = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card>
          <Statistic
            title="Latensi (Ping)"
            loading
          />
          <Text type="secondary">Mengukur waktu respon...</Text>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card>
            <Row align="middle" gutter={16}>
                <Col flex="none">
                    <Progress 
                        type="dashboard" 
                        percent={0}
                        status="active"
                        format={() => <WifiOutlined />}
                        size={80}
                    />
                </Col>
                <Col flex="auto">
                    <Statistic
                        title="Kecepatan Unduh"
                        loading
                    />
                     <Text type="secondary">Menghitung kecepatan unduh...</Text>
                </Col>
            </Row>
        </Card>
      </Col>
    </Row>
  );

  // --- KONTEN HASIL TES ---
  const renderResultState = () => result && (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card>
          <Statistic
            title="Latensi (Ping)"
            value={result.latency.toFixed(0)}
            precision={0}
            valueStyle={{ color: getLatencyColor(result.latency) }}
            prefix={<FieldTimeOutlined />}
            suffix="ms"
          />
          <Text type="secondary">Waktu respon pertama dari server</Text>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card>
            <Row align="middle" gutter={16}>
                <Col flex="none">
                    <Progress 
                        type="dashboard" 
                        percent={getBandwidthStatus(result.bandwidth).percent}
                        format={() => <WifiOutlined />}
                        strokeColor={getBandwidthStatus(result.bandwidth).color}
                        size={80}
                    />
                </Col>
                <Col flex="auto">
                    <Statistic
                        title="Kecepatan Unduh"
                        value={result.bandwidth.toFixed(2)}
                        precision={2}
                        valueStyle={{ color: getBandwidthStatus(result.bandwidth).color }}
                        suffix="Mbps"
                    />
                     <Tag color={getBandwidthStatus(result.bandwidth).color}>
                        {getBandwidthStatus(result.bandwidth).text}
                    </Tag>
                </Col>
            </Row>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Card>
      <Title level={4}>Tes Koneksi Server</Title>
      <Paragraph type="secondary">
        Uji latensi dan kecepatan unduh dari browser Anda ke server Skoola. Ini membantu mendiagnosis masalah koneksi yang mungkin mempengaruhi pengalaman Anda.
      </Paragraph>
      <div style={{ marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={handleRunTest}
          loading={loading}
          size="large"
        >
          Mulai Tes Koneksi
        </Button>
      </div>

      {loading ? renderLoadingState() : renderResultState()}

    </Card>
  );
};

export default ConnectionTestTab;