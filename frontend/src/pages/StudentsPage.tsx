// file: src/pages/StudentsPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message, Space, Popconfirm, Row, Col } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/students';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types';
import StudentForm from '../components/StudentForm';

const { Title } = Typography;

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data siswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showModal = (student: Student | null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleFormSubmit = async (values: CreateStudentInput | UpdateStudentInput) => {
    setIsSubmitting(true);

    const cleanedValues: any = {};
    Object.keys(values).forEach(key => {
        const value = (values as any)[key];
        cleanedValues[key] = (typeof value === 'string' && value.trim() === "") ? null : value;
    });

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, cleanedValues as UpdateStudentInput);
        message.success('Data siswa berhasil diperbarui!');
      } else {
        await createStudent(cleanedValues as CreateStudentInput);
        message.success('Siswa baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchStudents();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Terjadi kesalahan saat menyimpan data.';
      message.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      message.success('Data siswa berhasil dihapus!');
      fetchStudents();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data siswa.';
      message.error(errorMessage);
      console.error(err);
    }
  };

  const columns: TableColumnsType<Student> = [
    { title: 'Nama Lengkap', dataIndex: 'nama_lengkap', key: 'nama_lengkap', sorter: (a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap) },
    { title: 'NIS', dataIndex: 'nis', key: 'nis', render: (text) => text || '-' },
    { title: 'NISN', dataIndex: 'nisn', key: 'nisn', render: (text) => text || '-' },
    { title: 'Nama Wali', dataIndex: 'nama_wali', key: 'nama_wali', render: (text) => text || '-' },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle" direction="horizontal">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Siswa"
            description="Apakah Anda yakin?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error && !students.length) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12}>
          <Title level={2} style={{ margin: 0 }}>Manajemen Data Siswa</Title>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Tambah Siswa
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={students} loading={loading} rowKey="id" scroll={{ x: 'max-content' }} />
      {isModalOpen && (
        <Modal
          title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          open={isModalOpen}
          onCancel={handleCancel}
          destroyOnClose
          footer={null}
        >
          <StudentForm
            onFinish={handleFormSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
            initialValues={editingStudent || undefined}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentsPage;