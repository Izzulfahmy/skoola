// file: src/pages/StudentsPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message, Space, Popconfirm, Row, Col, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/students';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types';
import StudentForm from '../components/StudentForm';
import dayjs from 'dayjs';

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
    
    const payload = {
        ...values,
        tanggal_lahir: values.tanggal_lahir ? dayjs(values.tanggal_lahir).format('YYYY-MM-DD') : undefined,
    };

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, payload as UpdateStudentInput);
        message.success('Data siswa berhasil diperbarui!');
      } else {
        await createStudent(payload as CreateStudentInput);
        message.success('Siswa baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchStudents();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Terjadi kesalahan saat menyimpan data.';
      message.error(errorMessage);
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
    }
  };

  const columns: TableColumnsType<Student> = [
    { 
      title: 'Nama Lengkap', 
      dataIndex: 'nama_lengkap', 
      key: 'nama_lengkap', 
      sorter: (a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap),
      fixed: 'left',
      width: 200,
    },
    { 
      title: 'Status', 
      dataIndex: 'status_saat_ini',
      key: 'status_saat_ini',
      render: (status) => {
        if (!status) return <Tag>BARU</Tag>;
        let color = 'default';
        if (status === 'Aktif') color = 'green';
        if (status === 'Lulus') color = 'blue';
        if (status === 'Pindah' || status === 'Keluar') color = 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      width: 100,
    },
    { title: 'NIS', dataIndex: 'nis', key: 'nis', render: (text) => text || '-', width: 120 },
    { title: 'NISN', dataIndex: 'nisn', key: 'nisn', render: (text) => text || '-', width: 120 },
    { title: 'Jenis Kelamin', dataIndex: 'jenis_kelamin', key: 'jenis_kelamin', render: (text) => text || '-', width: 120 },
    { title: 'Nama Wali', dataIndex: 'nama_wali', key: 'nama_wali', render: (_, record) => record.nama_wali || record.nama_ayah || record.nama_ibu || '-', width: 200, },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
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
      fixed: 'right',
      width: 100,
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
      <Table columns={columns} dataSource={students} loading={loading} rowKey="id" scroll={{ x: 1000 }} />
      {isModalOpen && (
        <Modal
          title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          open={isModalOpen}
          onCancel={handleCancel}
          destroyOnClose
          footer={null}
          width={800}
        >
          <StudentForm
            onFinish={handleFormSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
            initialValues={editingStudent || undefined}
            onHistoryUpdate={fetchStudents} // <-- PASS FUNGSI SEBAGAI CALLBACK
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentsPage;