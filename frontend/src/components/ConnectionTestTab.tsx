// file: frontend/src/components/ConnectionTestTab.tsx
import { useState } from 'react';
import { Button, Card, Descriptions, Spin, Typography, message, Space } from 'antd';
import { RocketOutlined, WifiOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { testConnection, type ConnectionTestResult } from '../api/connection';

const { Title, Text, Paragraph } = Typography;

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

  return (
    <Card>
      <Title level={4}>Tes Koneksi Server</Title>
      <Paragraph type="secondary">
        Uji latensi dan kecepatan unduh dari browser Anda ke server Skoola. Ini membantu mendiagnosis masalah koneksi yang mungkin mempengaruhi pengalaman Anda.
      </Paragraph>
      <div style={{ marginTop: 24, marginBottom: 24 }}>
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

      {loading && <Spin tip="Mengukur kecepatan..." style={{ display: 'block' }} />}

      {result && (
        <Descriptions bordered column={1} title="Hasil Tes">
          <Descriptions.Item label={<Space><FieldTimeOutlined />Latensi (Ping)</Space>}>
            <Text strong style={{ color: result.latency < 100 ? '#52c41a' : '#faad14' }}>
              {result.latency.toFixed(0)} ms
            </Text>
            <Text type="secondary"> (Waktu respon pertama dari server)</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><WifiOutlined />Kecepatan Unduh</Space>}>
            <Text strong style={{ color: result.bandwidth > 10 ? '#52c41a' : '#faad14' }}>
              {result.bandwidth.toFixed(2)} Mbps
            </Text>
            <Text type="secondary"> (Megabit per detik)</Text>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default ConnectionTestTab;