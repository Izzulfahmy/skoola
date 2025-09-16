// file: src/pages/TeachersPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message } from 'antd'; // Tambahan: Button, Modal, message
import type { TableColumnsType } from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // Tambahan: Icon
import { getTeachers, createTeacher } from '../api/teachers'; // Tambahan: createTeacher
import type { Teacher, CreateTeacherInput } from '../types'; // Tambahan: CreateTeacherInput
import TeacherForm from '../components/TeacherForm'; // Impor komponen form baru

const { Title } = Typography;

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State baru untuk modal dan status pengiriman form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definisi kolom untuk tabel (tidak ada perubahan)
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
      render: (text) => text || '-',
    },
    {
      title: 'Nomor Telepon',
      dataIndex: 'nomor_telepon',
      key: 'nomor_telepon',
      render: (text) => text || '-',
    },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      render: (text) => text || '-',
    },
  ];

  // Membungkus logika fetch agar bisa dipanggil ulang
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers(); 
      setTeachers(data);
      setError(null); // Bersihkan error jika fetch berhasil
    } catch (err) {
      setError('Gagal memuat data guru. Pastikan server backend berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect sekarang hanya memanggil fetchTeachers
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fungsi untuk menangani submit form tambah guru
  const handleCreateTeacher = async (values: CreateTeacherInput) => {
    setIsSubmitting(true);
    try {
      const tenantId = 'sekolah_pertama';
      await createTeacher(values, tenantId);
      setIsModalOpen(false); // Tutup modal jika berhasil
      message.success('Guru baru berhasil ditambahkan!');
      fetchTeachers(); // Ambil ulang data terbaru dari server
    } catch (err) {
      const errorMessage = (err as any)?.response?.data || 'Gagal menambahkan guru baru.';
      message.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilkan error besar hanya jika tidak ada data sama sekali
  if (error && !teachers.length) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      {/* Header Halaman dengan Tombol Tambah */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Manajemen Data Guru</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Tambah Guru
        </Button>
      </div>

      {/* Tampilkan error kecil di atas tabel jika ada masalah saat refresh */}
      {error && <Alert message={error} type="warning" style={{ marginBottom: '16px' }} />}
      
      {/* Tabel Data Guru */}
      <Table
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      {/* Modal untuk Form Tambah Guru */}
      <Modal
        title="Tambah Guru Baru"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose // Reset form saat modal ditutup
        footer={null} // Footer disembunyikan karena tombol ada di dalam form
      >
        <TeacherForm
          onFinish={handleCreateTeacher}
          onCancel={() => setIsModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default TeachersPage;