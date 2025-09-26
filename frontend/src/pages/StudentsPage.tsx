// file: src/pages/StudentsPage.tsx
import { useEffect, useState } from 'react';
import { Table, Typography, Alert, Button, Modal, message, Space, Popconfirm, Row, Col, Tag, Dropdown, Upload, Spin, List, Divider } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { getStudents, createStudent, updateStudent, deleteStudent, downloadStudentTemplate, uploadStudentsFile } from '../api/students';
import type { Student, CreateStudentInput, UpdateStudentInput, ImportResult } from '../types';
import StudentForm from '../components/StudentForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk modal form
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // State untuk modal import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);


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

  const showFormModal = (student: Student | null) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
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
      handleFormCancel();
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

  const handleDownloadTemplate = async () => {
    message.loading('Menyiapkan template...');
    try {
      await downloadStudentTemplate();
    } catch (error) {
      message.error('Gagal mengunduh template.');
    }
  };

  const handleImportCancel = () => {
    setIsImportModalOpen(false);
    setUploadResult(null);
    setFileList([]);
    if (uploadResult) { // Jika ada hasil, refresh tabel
        fetchStudents();
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList: fileList,
    accept: '.xlsx, .xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error(`${file.name} bukan file Excel yang valid.`);
      }
      return isExcel || Upload.LIST_IGNORE;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      setIsUploading(true);
      setUploadResult(null);
      try {
        const result = await uploadStudentsFile(file as File);
        setUploadResult(result);
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal mengunggah file.';
        message.error(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
      } finally {
        setIsUploading(false);
      }
    },
    onRemove: () => {
        setFileList([]);
    },
    onChange: (info) => {
        setFileList(info.fileList.slice(-1));
    }
  };
  
  const menuItems: MenuProps['items'] = [
    { key: '1', label: 'Unduh Template Excel', icon: <DownloadOutlined />, onClick: handleDownloadTemplate },
    { key: '2', label: 'Unggah File Excel', icon: <UploadOutlined />, onClick: () => setIsImportModalOpen(true) },
  ];

  const columns: TableColumnsType<Student> = [
    { 
      title: 'Nama Lengkap', 
      dataIndex: 'nama_lengkap', 
      key: 'nama_lengkap', 
      sorter: (a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap),
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
    },
    { 
      title: 'NIS', 
      dataIndex: 'nis', 
      key: 'nis', 
      render: (text) => text || '-',
      responsive: ['md'],
    },
    { 
      title: 'NISN', 
      dataIndex: 'nisn', 
      key: 'nisn', 
      render: (text) => text || '-',
      responsive: ['lg'],
    },
    { 
      title: 'Jenis Kelamin', 
      dataIndex: 'jenis_kelamin', 
      key: 'jenis_kelamin', 
      render: (text) => text || '-',
      responsive: ['lg'],
    },
    { 
      title: 'Nama Wali', 
      dataIndex: 'nama_wali', 
      key: 'nama_wali', 
      render: (_, record) => record.nama_wali || record.nama_ayah || record.nama_ibu || '-',
      responsive: ['md'],
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showFormModal(record)} />
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
          <Title level={3} style={{ margin: 0 }}>Manajemen Data Siswa</Title>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space>
                <Dropdown.Button menu={{ items: menuItems }} >
                    Impor Siswa
                </Dropdown.Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showFormModal(null)}>
                    Tambah Siswa
                </Button>
            </Space>
        </Col>
      </Row>
      <Table 
        columns={columns} 
        dataSource={students} 
        loading={loading} 
        rowKey="id" 
        scroll={{ x: 'max-content' }}
        pagination={false} 
      />
      {isFormModalOpen && (
        <Modal
          title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          open={isFormModalOpen}
          onCancel={handleFormCancel}
          destroyOnClose
          footer={null}
          width={800}
        >
          <StudentForm
            onFinish={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={isSubmitting}
            initialValues={editingStudent || undefined}
            onHistoryUpdate={fetchStudents}
          />
        </Modal>
      )}

    <Modal
        title="Impor Data Siswa"
        open={isImportModalOpen}
        onCancel={handleImportCancel}
        footer={[
            <Button key="back" onClick={handleImportCancel}>
                {uploadResult ? 'Tutup' : 'Batal'}
            </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        {isUploading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" tip="Mengunggah dan memproses file..." />
            </div>
        ) : uploadResult ? (
            <div>
                <Title level={4}>Hasil Impor</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                        message={<Text strong>{`Berhasil mengimpor ${uploadResult.success_count} siswa.`}</Text>}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                    />
                    {uploadResult.error_count > 0 && (
                        <Alert
                            message={<Text strong>{`Gagal mengimpor ${uploadResult.error_count} siswa.`}</Text>}
                            type="error"
                            showIcon
                            icon={<CloseCircleOutlined />}
                        />
                    )}
                </Space>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <>
                        <Divider>Detail Kesalahan</Divider>
                        <List
                            size="small"
                            bordered
                            dataSource={uploadResult.errors}
                            renderItem={item => (
                                <List.Item>
                                    <Text strong>Baris {item.row}:</Text> {item.message}
                                </List.Item>
                            )}
                            style={{ maxHeight: 200, overflowY: 'auto' }}
                        />
                    </>
                )}
            </div>
        ) : (
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined />
            </p>
            <p className="ant-upload-text">Klik atau seret file Excel ke area ini</p>
            <p className="ant-upload-hint">
              Pastikan file sesuai dengan template yang disediakan. Hanya file .xlsx atau .xls yang diterima.
            </p>
          </Dragger>
        )}
      </Modal>

    </div>
  );
};

export default StudentsPage;