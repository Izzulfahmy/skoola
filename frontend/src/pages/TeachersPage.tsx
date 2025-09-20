// file: src/pages/TeachersPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message, Space, Popconfirm, Row, Col, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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

  const showModal = (teacher: Teacher | null) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleFormSubmit = async (values: CreateTeacherInput | UpdateTeacherInput) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, values as UpdateTeacherInput);
        message.success('Data guru berhasil diperbarui!');
      } else {
        await createTeacher(values as CreateTeacherInput);
        message.success('Guru baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchTeachers();
    } catch (err) {
      const errorMessage = (err as any)?.response?.data || 'Terjadi kesalahan saat menyimpan data.';
      message.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacher(id);
      message.success('Data guru berhasil dihapus!');
      fetchTeachers();
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
      render: (text, record) => (
        <div>
          {text}
          {record.gelar_akademik && <span style={{ color: '#888' }}>, {record.gelar_akademik}</span>}
        </div>
      ),
    },
    {
      title: 'NIP / NUPTK',
      dataIndex: 'nip_nuptk',
      key: 'nip_nuptk',
      render: (text) => text || '-',
    },
    {
      title: 'Nomor HP',
      dataIndex: 'no_hp',
      key: 'no_hp',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status_guru',
      key: 'status_guru',
      render: (status) => {
        let color = 'green';
        if (status === 'NonAktif') {
          color = 'volcano';
        } else if (status === 'Pindah') {
          color = 'gold';
        }
        return status ? <Tag color={color}>{status.toUpperCase()}</Tag> : '-';
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Guru"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button icon={<DeleteOutlined />} danger />
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
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12}>
          <Title level={2} style={{ margin: 0 }}>Manajemen Data Guru</Title>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Tambah Guru
          </Button>
        </Col>
      </Row>

      {error && <Alert message={error} type="warning" style={{ marginBottom: '16px' }} />}

      <Table
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        open={isModalOpen}
        onCancel={handleCancel}
        destroyOnClose
        footer={null}
        width={800}
      >
        <TeacherForm
          onFinish={handleFormSubmit}
          onCancel={handleCancel}
          loading={isSubmitting}
          initialValues={editingTeacher || undefined}
        />
      </Modal>
    </div>
  );
};

export default TeachersPage;