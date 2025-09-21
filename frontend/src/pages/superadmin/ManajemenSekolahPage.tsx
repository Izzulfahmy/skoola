// file: frontend/src/pages/superadmin/ManajemenSekolahPage.tsx
import { useState, useEffect } from 'react';
import { Button, Typography, message, Modal, Table, Alert, Tag, Form, Input, Dropdown, Space, Row, Col, Breadcrumb } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import {
  PlusOutlined,
  LockOutlined,
  MailOutlined,
  MoreOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  HomeOutlined,
} from '@ant-design/icons';
import {
  registerTenant,
  getTenants,
  updateAdminEmail,
  resetAdminPassword,
  deleteTenant,
  type RegisterTenantInput,
} from '../../api/tenants';
import { getFoundationById } from '../../api/foundations';
import type { Tenant, Foundation } from '../../types';
import RegisterTenantForm from '../../components/RegisterTenantForm';
import { format } from 'date-fns';
import { useParams, Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

type ModalType = 'register' | 'editEmail' | 'resetPassword' | 'deleteConfirm' | null;

const ManajemenSekolahPage = () => {
  const [form] = Form.useForm();
  const { foundationId } = useParams<{ foundationId: string }>();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foundation, setFoundation] = useState<Foundation | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const fetchTenants = async () => {
    setTableLoading(true);
    try {
      const allTenants = await getTenants();
      
      if (foundationId) {
        const foundationData = await getFoundationById(foundationId);
        setFoundation(foundationData);
        // Pastikan allTenants adalah array sebelum filter
        const filteredTenants = (allTenants || []).filter(t => t.foundation_id === foundationId);
        setTenants(filteredTenants);
      } else {
        setTenants(allTenants || []);
        setFoundation(null);
      }
      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar sekolah.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [foundationId]);

  const showModal = (type: ModalType, tenant?: Tenant) => {
    if (tenant) setSelectedTenant(tenant);
    setActiveModal(type);
  };

  const handleCancel = () => {
    setActiveModal(null);
    setSelectedTenant(null);
    setDeleteConfirmInput('');
    form.resetFields();
  };

  const handleRegisterTenant = async (values: RegisterTenantInput) => {
    setLoading(true);
    try {
      const payload = foundationId ? { ...values, foundation_id: foundationId } : values;
      await registerTenant(payload);
      message.success(`Sekolah "${values.nama_sekolah}" berhasil didaftarkan!`);
      handleCancel();
      fetchTenants();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || "Gagal mendaftarkan sekolah.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFinish = async (values: any) => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      if (activeModal === 'editEmail') {
        await updateAdminEmail(selectedTenant.schema_name, { email: values.email });
        message.success(`Email admin untuk ${selectedTenant.nama_sekolah} berhasil diubah!`);
      } else if (activeModal === 'resetPassword') {
        await resetAdminPassword(selectedTenant.schema_name, { password: values.password });
        message.success(`Password admin untuk ${selectedTenant.nama_sekolah} berhasil direset!`);
      }
      handleCancel();
      fetchTenants(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTenant || deleteConfirmInput !== selectedTenant.nama_sekolah) {
      message.error('Teks konfirmasi tidak cocok dengan nama sekolah.');
      return;
    }
    setLoading(true);
    try {
      await deleteTenant(selectedTenant.schema_name);
      message.success(`Sekolah "${selectedTenant.nama_sekolah}" berhasil dihapus.`);
      handleCancel();
      fetchTenants();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menghapus sekolah.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = (record: Tenant): MenuProps['items'] => [
    { key: '1', label: 'Ubah Email Admin', icon: <MailOutlined />, onClick: () => showModal('editEmail', record) },
    { key: '2', label: 'Reset Password Admin', icon: <LockOutlined />, onClick: () => showModal('resetPassword', record) },
    { type: 'divider' },
    { key: '3', label: 'Hapus Sekolah', icon: <DeleteOutlined />, onClick: () => showModal('deleteConfirm', record), danger: true },
  ];

  const columns: TableColumnsType<Tenant> = [
    { title: 'Nama Sekolah', dataIndex: 'nama_sekolah', key: 'nama_sekolah', sorter: (a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah) },
    { title: 'ID Unik (Schema)', dataIndex: 'schema_name', key: 'schema_name', render: (schema) => <Tag color="blue">{schema}</Tag> },
    ...(!foundationId ? [{ 
        title: 'Yayasan', 
        dataIndex: 'nama_yayasan', 
        key: 'nama_yayasan', 
        render: (text: string) => text || '-' 
    }] : []),
    { title: 'Tanggal Didaftarkan', dataIndex: 'created_at', key: 'created_at', render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'), sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // --- PERBAIKAN DI SINI: Membuat array untuk properti 'items' Breadcrumb ---
  const breadcrumbItems = [
    {
      title: <Link to="/superadmin"><HomeOutlined /></Link>,
    },
    {
      title: <Link to="/superadmin/yayasan">Yayasan</Link>,
    },
    {
      title: foundation?.nama_yayasan,
    },
  ];

  return (
    <>
      {foundationId && foundation && (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      )}

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {foundationId ? `Sekolah di Bawah ${foundation?.nama_yayasan}` : 'Manajemen Semua Sekolah'}
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('register')}>
            Daftarkan Sekolah Baru
          </Button>
        </Col>
      </Row>
      
      {error ? <Alert message="Error" description={error} type="error" showIcon /> : <Table columns={columns} dataSource={tenants} loading={tableLoading} rowKey="id" scroll={{ x: 'max-content' }} />}

      <Modal title="Daftarkan Sekolah Baru" open={activeModal === 'register'} onCancel={handleCancel} destroyOnClose footer={null}>
        <RegisterTenantForm onFinish={handleRegisterTenant} onCancel={handleCancel} loading={loading} />
      </Modal>

      <Modal
        title={activeModal === 'editEmail' ? `Ubah Email Admin: ${selectedTenant?.nama_sekolah}` : `Reset Password Admin: ${selectedTenant?.nama_sekolah}`}
        open={activeModal === 'editEmail' || activeModal === 'resetPassword'}
        onCancel={handleCancel}
        destroyOnClose
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateFinish}>
          {activeModal === 'editEmail' && (
            <Form.Item name="email" label="Email Baru" rules={[{ required: true, message: 'Email tidak boleh kosong' }, { type: 'email', message: 'Format email tidak valid' }]}>
              <Input placeholder="Masukkan email baru untuk admin" />
            </Form.Item>
          )}
          {activeModal === 'resetPassword' && (
            <Form.Item name="password" label="Password Baru" rules={[{ required: true, message: 'Password tidak boleh kosong' }, { min: 8, message: 'Password minimal 8 karakter' }]}>
              <Input.Password placeholder="Masukkan password baru untuk admin" />
            </Form.Item>
          )}
          <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Simpan Perubahan</Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={
          <Space>
            <ExclamationCircleFilled style={{ color: '#faad14' }} />
            Konfirmasi Hapus Sekolah
          </Space>
        }
        open={activeModal === 'deleteConfirm'}
        onCancel={handleCancel}
        destroyOnClose
        okText="Ya, Saya Mengerti dan Hapus Sekolah Ini"
        okType="danger"
        onOk={handleConfirmDelete}
        confirmLoading={loading}
        okButtonProps={{ disabled: deleteConfirmInput !== selectedTenant?.nama_sekolah }}
      >
        <Paragraph>
          Tindakan ini akan menghapus <Text strong>{selectedTenant?.nama_sekolah}</Text> secara permanen. Semua data yang terkait akan hilang dan tidak dapat dipulihkan.
        </Paragraph>
        <Paragraph>
          Untuk melanjutkan, silakan ketik nama sekolah yang benar di bawah ini:
        </Paragraph>
        <Input placeholder={selectedTenant?.nama_sekolah} value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value)} />
      </Modal>
    </>
  );
};

export default ManajemenSekolahPage;