// file: frontend/src/components/PaperSizeTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, InputNumber, Row, Col, Typography, Select } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllPaperSize, createPaperSize, updatePaperSize, deletePaperSize } from '../api/paperSize';
import type { PaperSize, UpsertPaperSizeInput } from '../types';
// import { format } from 'date-fns'; // <-- HAPUS IMPORT INI KARENA TIDAK DIGUNAKAN LAGI

const { Text } = Typography;
const { Option } = Select;

// Tambahkan CSS kustom untuk memperpendek tinggi baris tabel
// Ini harus ditempatkan di file CSS global Anda (seperti frontend/src/index.css atau App.css)
// Namun, untuk demonstrasi, kita akan menyisipkannya menggunakan style prop jika Ant Design mengizinkannya, 
// atau cara terbaik adalah menggunakan kelas CSS global.

const PaperSizeTab = () => {
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState<PaperSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<PaperSize | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPaperSize();
      setDataList(data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data ukuran kertas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (record: PaperSize | null) => {
    setEditingData(record);
    // Inisialisasi nilai untuk form
    form.setFieldsValue(record ? {
        ...record,
    } : { 
        nama_kertas: '', 
        satuan: 'mm',
        panjang: 297.00, // Memberikan nilai default yang lebih realistis
        lebar: 210.00,   // Memberikan nilai default yang lebih realistis
        margin_atas: 10.0,
        margin_bawah: 10.0,
        margin_kiri: 10.0,
        margin_kanan: 10.0,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingData(null);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    // Konversi nilai dari InputNumber ke float
    const payload: UpsertPaperSizeInput = {
        ...values,
        // Pastikan nilai diubah menjadi string jika InputNumber mengembalikan nilai number/null
        panjang: parseFloat(values.panjang),
        lebar: parseFloat(values.lebar),
        margin_atas: parseFloat(values.margin_atas),
        margin_bawah: parseFloat(values.margin_bawah),
        margin_kiri: parseFloat(values.margin_kiri),
        margin_kanan: parseFloat(values.margin_kanan),
    };

    try {
      if (editingData) {
        await updatePaperSize(editingData.id, payload);
        message.success('Ukuran kertas berhasil diperbarui!');
      } else {
        await createPaperSize(payload);
        message.success('Ukuran kertas baru berhasil ditambahkan!');
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      // Mengambil error message dari response backend
      const backendError = err.response?.data?.error || err.response?.data || 'Gagal menyimpan data. Pastikan Nama Kertas unik.';
      message.error(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaperSize(id);
      message.success('Ukuran kertas berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Gagal menghapus data.';
      message.error(errorMessage);
    }
  };

  const columns: TableColumnsType<PaperSize> = [
    { 
      title: 'Nama Kertas', 
      dataIndex: 'nama_kertas', 
      key: 'nama_kertas',
      // Memperpendek baris dengan mengurangi padding di cell (jika perlu)
      onCell: () => ({ style: { padding: '8px 16px' } }) 
    },
    { 
      title: 'Satuan', 
      dataIndex: 'satuan', 
      key: 'satuan',
      width: 100,
      align: 'center',
      render: (text) => <Text code>{text}</Text>,
      onCell: () => ({ style: { padding: '8px 8px' } }) 
    },
    { 
        title: 'Ukuran (P x L)', 
        key: 'ukuran',
        align: 'center',
        render: (_, record) => (
            <Text>{`${record.panjang} x ${record.lebar} ${record.satuan}`}</Text>
        ),
        onCell: () => ({ style: { padding: '8px 16px' } }) 
    },
    { 
        title: 'Margin Atas/Bawah', 
        key: 'margin_v',
        align: 'center',
        responsive: ['md'],
        render: (_, record) => (
            <Text>{`${record.margin_atas} / ${record.margin_bawah} ${record.satuan}`}</Text>
        ),
        onCell: () => ({ style: { padding: '8px 16px' } }) 
    },
    { 
        title: 'Margin Kiri/Kanan', 
        key: 'margin_h',
        align: 'center',
        responsive: ['md'],
        render: (_, record) => (
            <Text>{`${record.margin_kiri} / ${record.margin_kanan} ${record.satuan}`}</Text>
        ),
        onCell: () => ({ style: { padding: '8px 16px' } }) 
    },
    // KOLOM TANGGAL DIBUAT TELAH DIHAPUS

    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120, // Tambahkan width agar tombol tidak terlalu rapat
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => showModal(record)} />
          <Popconfirm
            title="Hapus Ukuran Kertas?"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
      onCell: () => ({ style: { padding: '8px 8px' } }) 
    },
  ];

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
          Tambah Ukuran Kertas
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataList}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small" // <-- Gunakan properti Ant Design untuk memperpendek baris
        // rowClassName={() => 'compact-table-row'} // <-- Alternatif, jika Anda menggunakan CSS kustom
      />
      <Modal
        title={editingData ? 'Edit Ukuran Kertas' : 'Tambah Ukuran Kertas'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nama_kertas"
            label="Nama Kertas"
            rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
          >
            <Input placeholder="Contoh: A4, F4, Letter" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
                <Form.Item name="satuan" label="Satuan" rules={[{ required: true }]}>
                    <Select placeholder="Pilih satuan">
                        <Option value="mm">mm (Milimeter)</Option>
                        <Option value="cm">cm (Sentimeter)</Option>
                        <Option value="in">in (Inch)</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="panjang"
                    label="Panjang"
                    // Mengubah tipe ke `number` di rule agar validasi bekerja dengan InputNumber
                    rules={[{ required: true, type: 'number', min: 0.01, message: 'Harap isi Panjang (>0)' }]}
                >
                    <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Contoh: 297.00" />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    name="lebar"
                    label="Lebar"
                    rules={[{ required: true, type: 'number', min: 0.01, message: 'Harap isi Lebar (>0)' }]}
                >
                    <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Contoh: 210.00" />
                </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    name="margin_atas"
                    label="Margin Atas"
                    rules={[{ required: true, type: 'number', min: 0, message: 'Harap isi Margin' }]}
                >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="10.0" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="margin_bawah"
                    label="Margin Bawah"
                    rules={[{ required: true, type: 'number', min: 0, message: 'Harap isi Margin' }]}
                >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="10.0" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="margin_kiri"
                    label="Margin Kiri"
                    rules={[{ required: true, type: 'number', min: 0, message: 'Harap isi Margin' }]}
                >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="10.0" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="margin_kanan"
                    label="Margin Kanan"
                    rules={[{ required: true, type: 'number', min: 0, message: 'Harap isi Margin' }]}
                >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="10.0" />
                </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PaperSizeTab;