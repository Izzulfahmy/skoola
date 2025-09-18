// file: src/pages/superadmin/SuperAdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Button, Typography, message, Modal, Table, Alert, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusOutlined } from '@ant-design/icons';
import { registerTenant, getTenants, type RegisterTenantInput } from '../../api/tenants';
import type { Tenant } from '../../types'; // <-- Impor tipe baru
import RegisterTenantForm from '../../components/RegisterTenantForm';
import { format } from 'date-fns'; // <-- Library untuk format tanggal

const { Title, Paragraph } = Typography;

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- STATE BARU UNTUK MENAMPILKAN DATA SEKOLAH ---
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FUNGSI UNTUK MENGAMBIL DATA SEKOLAH ---
  const fetchTenants = async () => {
    setTableLoading(true);
    try {
      const data = await getTenants();
      setTenants(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar sekolah. Pastikan server berjalan.');
    } finally {
      setTableLoading(false);
    }
  };

  // --- useEffect AKAN MEMUAT DATA SAAT KOMPONEN DITAMPILKAN ---
  useEffect(() => {
    fetchTenants();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegisterTenant = async (values: RegisterTenantInput) => {
    setLoading(true);
    try {
      await registerTenant(values);
      message.success(`Sekolah "${values.nama_sekolah}" berhasil didaftarkan!`);
      setIsModalOpen(false);
      fetchTenants(); // <-- Muat ulang data setelah berhasil mendaftar
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || "Gagal mendaftarkan sekolah.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // --- DEFINISI KOLOM UNTUK TABEL ---
  const columns: TableColumnsType<Tenant> = [
    {
      title: 'Nama Sekolah',
      dataIndex: 'nama_sekolah',
      key: 'nama_sekolah',
      sorter: (a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah),
    },
    {
      title: 'ID Unik (Schema)',
      dataIndex: 'schema_name',
      key: 'schema_name',
      render: (schema) => <Tag color="blue">{schema}</Tag>,
    },
    {
      title: 'Tanggal Didaftarkan',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(new Date(date), 'dd MMMM yyyy, HH:mm'),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Dasbor Superadmin</Title>
        <Button type="primary" onClick={handleLogout}>Logout</Button>
      </div>
      <Paragraph>Selamat datang, Superadmin! Dari sini Anda dapat mengelola semua sekolah yang terdaftar dalam sistem.</Paragraph>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={4} style={{ margin: 0 }}>Manajemen Sekolah</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Daftarkan Sekolah Baru
          </Button>
        </div>

        {/* --- TAMPILKAN TABEL ATAU PESAN ERROR --- */}
        {error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          <Table
            columns={columns}
            dataSource={tenants}
            loading={tableLoading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
          />
        )}
      </div>

      <Modal
        title="Daftarkan Sekolah Baru"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        footer={null}
      >
        <RegisterTenantForm
          onFinish={handleRegisterTenant}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;