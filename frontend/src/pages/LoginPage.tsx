// frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined, IdcardOutlined, CrownOutlined, BankOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Row, Col, Typography, message, Tooltip } from 'antd';
import { loginUser } from '../api/auth';
import type { LoginInput } from '../types';
import { useAuth } from '../context/AuthContext';
import { getRoleFromToken } from '../utils/auth';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [isSuperAdminLogin, setIsSuperAdminLogin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleModeChange = () => {
    form.resetFields(['tenantId']); 
    setIsSuperAdminLogin(!isSuperAdminLogin);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const tenantId = isSuperAdminLogin ? '' : values.tenantId;
      
      const credentials: LoginInput = {
        email: values.email,
        password: values.password,
      };

      const response = await loginUser(credentials, tenantId);
      const token = response.token;
      login(token);

      message.success('Login berhasil!');
      const role = getRoleFromToken(token);

      if (role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const serverErrorMessage = error.response?.data?.message || 'Email, password, atau ID Sekolah salah';
      message.error(serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card style={{ position: 'relative' }}> 
          <Tooltip title={isSuperAdminLogin ? 'Beralih ke login sekolah' : 'Beralih ke login superadmin'}>
            <Button 
              type="text" 
              shape="circle"
              icon={isSuperAdminLogin ? <BankOutlined /> : <CrownOutlined />} 
              onClick={handleModeChange}
              style={{
                position: 'absolute',
                // --- PERUBAHAN 1: Posisi tombol digeser lebih ke pojok ---
                top: '10px',
                right: '10px',
              }}
            />
          </Tooltip>

          {/* --- PERUBAHAN 2: Jarak bawah judul dikurangi --- */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Title level={2}>{isSuperAdminLogin ? 'Login Superadmin' : 'Selamat Datang!'}</Title>
            <Text type="secondary">
              {isSuperAdminLogin ? 'Silakan masuk untuk mengelola sistem' : 'Silakan masuk untuk melanjutkan'}
            </Text>
          </div>

          <Form name="login" form={form} onFinish={onFinish} layout="vertical">
            {!isSuperAdminLogin && (
              <Form.Item
                label="ID Sekolah"
                name="tenantId"
                rules={[{ required: true, message: 'Harap masukkan ID Sekolah!' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Contoh: sekolah_pertama" />
              </Form.Item>
            )}
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
            <Form.Item style={{ marginBottom: 0 }}>
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