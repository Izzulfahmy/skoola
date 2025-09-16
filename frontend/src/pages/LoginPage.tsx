// file: src/pages/LoginPage.tsx
import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Row, Col, Typography, message } from 'antd';
import { loginUser } from '../api/auth';
import type { LoginInput } from '../types';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- Impor hook useAuth

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // <-- Gunakan hook untuk mendapatkan fungsi login

  const onFinish = async (values: LoginInput) => {
    setLoading(true);
    try {
      const tenantId = 'sekolah_pertama';
      const response = await loginUser(values, tenantId);
      
      message.success('Login berhasil!');
      
      // Panggil fungsi login dari context untuk menyimpan token secara global
      login(response.token);

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      // Ambil pesan error dari backend Go Anda
      const serverErrorMessage = (axiosError.response?.data as any)?.error || axiosError.response?.data || 'Email atau password salah';
      message.error(serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2}>Selamat Datang!</Title>
            <Typography.Text type="secondary">Silakan masuk untuk melanjutkan</Typography.Text>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Harap masukkan email Anda!', type: 'email' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Harap masukkan password Anda!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                Masuk
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;