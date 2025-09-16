// file: src/pages/TeachersPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert } from 'antd';
import type { TableColumnsType } from 'antd';
import { getTeachers } from '../api/teachers'; // <- Impor fungsi API yang baru kita buat
import type { Teacher } from '../types'; // <- Impor tipe data Teacher

const { Title } = Typography;

const TeachersPage = () => {
  // State untuk menyimpan data, status loading, dan pesan error
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Definisi kolom untuk tabel Ant Design
  const columns: TableColumnsType<Teacher> = [
    {
      title: 'Nama Lengkap',
      dataIndex: 'nama_lengkap',
      key: 'nama_lengkap',
      sorter: (a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap),
    },
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      render: (text) => text || '-', // Tampilkan '-' jika NIP kosong
    },
    {
      title: 'Nomor Telepon',
      dataIndex: 'nomor_telepon',
      key: 'nomor_telepon',
      render: (text) => text || '-', // Tampilkan '-' jika Nomor Telepon kosong
    },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      render: (text) => text || '-', // Tampilkan '-' jika Alamat kosong
    },
  ];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Panggil fungsi getTeachers tanpa argumen tenantId
        const data = await getTeachers(); 
        setTeachers(data);
      } catch (err) {
        setError('Gagal memuat data guru. Pastikan server backend berjalan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);
  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2}>Manajemen Data Guru</Title>
      <Table
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }} // Agar tabel bisa di-scroll horizontal
      />
    </div>
  );
};

export default TeachersPage;