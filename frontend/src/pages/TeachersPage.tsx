// file: src/pages/TeachersPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// 1. Pastikan semua fungsi API dan Tipe diimpor
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api/teachers';
import type { Teacher, CreateTeacherInput, UpdateTeacherInput } from '../types';
import TeacherForm from '../components/TeacherForm';

const { Title } = Typography;

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data guru. Pastikan server backend berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. Handler terpusat untuk membuka modal
  const showModal = (teacher: Teacher | null) => {
    setEditingTeacher(teacher); // Jika null, ini mode 'create'. Jika ada isinya, ini mode 'edit'
    setIsModalOpen(true);
  };

  // Handler untuk menutup dan mereset modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  // 3. Handler tunggal untuk submit form (menangani create dan update)
  const handleFormSubmit = async (values: CreateTeacherInput | UpdateTeacherInput) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        // Mode Update: Panggil updateTeacher
        await updateTeacher(editingTeacher.id, values as UpdateTeacherInput);
        message.success('Data guru berhasil diperbarui!');
      } else {
        // Mode Create: Panggil createTeacher
        const tenantId = 'sekolah_pertama';
        await createTeacher(values as CreateTeacherInput, tenantId);
        message.success('Guru baru berhasil ditambahkan!');
      }
      handleCancel(); // Tutup modal
      fetchTeachers(); // Muat ulang data tabel
    } catch (err) {
      const errorMessage = (err as any)?.response?.data || 'Terjadi kesalahan saat menyimpan data.';
      message.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handler untuk menghapus data guru
  const handleDelete = async (id: string) => {
    try {
      await deleteTeacher(id);
      message.success('Data guru berhasil dihapus!');
      fetchTeachers(); // Muat ulang data tabel
    } catch (err) {
      message.error('Gagal menghapus data guru.');
      console.error(err);
    }
  };

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
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* 5. Tombol Edit sekarang memanggil showModal dengan data baris ini */}
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Hapus Guru"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button icon={<DeleteOutlined />} danger>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error && !teachers.length) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Manajemen Data Guru</Title>
        {/* 6. Tombol Tambah sekarang memanggil showModal dengan null */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal(null)}
        >
          Tambah Guru
        </Button>
      </div>

      {error && <Alert message={error} type="warning" style={{ marginBottom: '16px' }} />}

      <Table
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      {/* 7. Modal ini sekarang dinamis dan digunakan untuk Tambah & Edit */}
      {isModalOpen && (
        <Modal
          title={editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
          open={isModalOpen}
          onCancel={handleCancel}
          destroyOnClose
          footer={null}
        >
          <TeacherForm
            onFinish={handleFormSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
            initialValues={editingTeacher || undefined} // Mengisi form jika dalam mode edit
          />
        </Modal>
      )}
    </div>
  );
};

export default TeachersPage;