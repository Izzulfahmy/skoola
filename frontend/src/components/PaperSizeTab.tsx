// file: frontend/src/components/PaperSizeTab.tsx
import { useState, useEffect } from 'react';
import { Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, InputNumber, Row, Col, Typography, Select, Card } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllPaperSize, createPaperSize, updatePaperSize, deletePaperSize } from '../api/paperSize';
import type { PaperSize, UpsertPaperSizeInput } from '../types';

const { Text, Title } = Typography;
const { Option } = Select;

interface PaperPreviewProps {
    panjang: number;
    lebar: number;
    margin_atas: number;
    margin_bawah: number;
    margin_kiri: number;
    margin_kanan: number;
    satuan: string;
}

const PaperPreview: React.FC<PaperPreviewProps> = ({
    panjang,
    lebar,
    margin_atas,
    margin_bawah,
    margin_kiri,
    margin_kanan,
    satuan,
}) => {
    const MAX_DIMENSION_PX = 250; 
    const PADDING_FOR_LABELS = 30; 

    const safePanjang = Math.max(panjang, 0.01);
    const safeLebar = Math.max(lebar, 0.01);

    let paperWidthPx: number;
    let paperHeightPx: number;

    if (safePanjang > safeLebar) {
        paperHeightPx = MAX_DIMENSION_PX;
        paperWidthPx = (safeLebar / safePanjang) * MAX_DIMENSION_PX;
    } else {
        paperWidthPx = MAX_DIMENSION_PX;
        paperHeightPx = (safePanjang / safeLebar) * MAX_DIMENSION_PX;
    }

    const visualMarginTop = (margin_atas / safePanjang) * 100;
    const visualMarginBottom = (margin_bawah / safePanjang) * 100;
    const visualMarginLeft = (margin_kiri / safeLebar) * 100;
    const visualMarginRight = (margin_kanan / safeLebar) * 100;

    const contentWidthPercent = 100 - visualMarginLeft - visualMarginRight;
    const contentHeightPercent = 100 - visualMarginTop - visualMarginBottom;
    
    const finalContentWidthPercent = Math.max(0, contentWidthPercent);
    const finalContentHeightPercent = Math.max(0, contentHeightPercent);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column', 
            minHeight: 300 
        }}>
            <div
                style={{
                    width: paperWidthPx + PADDING_FOR_LABELS * 2, 
                    height: paperHeightPx + PADDING_FOR_LABELS * 2,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div 
                    style={{
                        width: paperWidthPx,
                        height: paperHeightPx,
                        border: '1px solid #d9d9d9',
                        position: 'relative',
                        boxShadow: '1px 1px 5px rgba(0,0,0,0.1)',
                        backgroundColor: '#fefefe',
                        overflow: 'hidden',
                        top: PADDING_FOR_LABELS,
                        left: PADDING_FOR_LABELS,
                        transform: `translate(-${PADDING_FOR_LABELS}px, -${PADDING_FOR_LABELS}px)`
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: `${visualMarginTop}%`,
                            left: `${visualMarginLeft}%`,
                            width: `${finalContentWidthPercent}%`,
                            height: `${finalContentHeightPercent}%`,
                            backgroundColor: '#e6f7ff',
                            border: '1px dashed #91d5ff',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 10,
                            color: '#333'
                        }}
                    >
                        Area Konten
                    </div>
                </div>
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    fontSize: 10, 
                    color: '#ff4d4f', 
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                }}>
                    Atas: {margin_atas.toFixed(1)}
                </div>
                <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    fontSize: 10, 
                    color: '#ff4d4f', 
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                }}>
                    Bawah: {margin_bawah.toFixed(1)}
                </div>
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: 0, 
                    transform: 'translateY(-50%)', 
                    fontSize: 10, 
                    color: '#ff4d4f', 
                    fontWeight: 'bold',
                    writingMode: 'vertical-lr', 
                    whiteSpace: 'nowrap'
                }}>
                    Kiri: {margin_kiri.toFixed(1)}
                </div>
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    right: 0, 
                    transform: 'translateY(-50%)', 
                    fontSize: 10, 
                    color: '#ff4d4f', 
                    fontWeight: 'bold',
                    writingMode: 'vertical-lr',
                    whiteSpace: 'nowrap'
                }}>
                    Kanan: {margin_kanan.toFixed(1)}
                </div>
            </div>
            
            <div style={{ marginTop: 15, textAlign: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>
                    Dimensi Kertas: {safePanjang.toFixed(2)} x {safeLebar.toFixed(2)} {satuan}
                </Text>
            </div>
        </div>
    );
};

const PaperSizeTab = () => {
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState<PaperSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<PaperSize | null>(null);
  
  const [previewValues, setPreviewValues] = useState({
      panjang: 297.00,
      lebar: 210.00,
      satuan: 'mm',
      margin_atas: 10.0,
      margin_bawah: 10.0,
      margin_kiri: 10.0,
      margin_kanan: 10.0,
  });

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

  const onValuesChange = (_: any, allValues: any) => {
    setPreviewValues({
        panjang: parseFloat(allValues.panjang || 0),
        lebar: parseFloat(allValues.lebar || 0),
        satuan: allValues.satuan || 'mm',
        margin_atas: parseFloat(allValues.margin_atas || 0),
        margin_bawah: parseFloat(allValues.margin_bawah || 0),
        margin_kiri: parseFloat(allValues.margin_kiri || 0),
        margin_kanan: parseFloat(allValues.margin_kanan || 0),
    });
  };

  const showModal = (record: PaperSize | null) => {
    setEditingData(record);
    const initialValues = record ? {
        ...record,
    } : { 
        nama_kertas: '', 
        satuan: 'mm',
        panjang: 297.00, 
        lebar: 210.00,   
        margin_atas: 10.0,
        margin_bawah: 10.0,
        margin_kiri: 10.0,
        margin_kanan: 10.0,
    };
    form.setFieldsValue(initialValues);
    setPreviewValues({
        panjang: parseFloat(initialValues.panjang as any || 0),
        lebar: parseFloat(initialValues.lebar as any || 0),
        satuan: initialValues.satuan as string || 'mm',
        margin_atas: parseFloat(initialValues.margin_atas as any || 0),
        margin_bawah: parseFloat(initialValues.margin_bawah as any || 0),
        margin_kiri: parseFloat(initialValues.margin_kiri as any || 0),
        margin_kanan: parseFloat(initialValues.margin_kanan as any || 0),
    });

    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingData(null);
    form.resetFields();
    setPreviewValues({
        panjang: 297.00,
        lebar: 210.00,
        satuan: 'mm',
        margin_atas: 10.0,
        margin_bawah: 10.0,
        margin_kiri: 10.0,
        margin_kanan: 10.0,
    });
  };

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    const payload: UpsertPaperSizeInput = {
        ...values,
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

    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120, 
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
        size="small" 
      />
      <Modal
        title={editingData ? 'Edit Ukuran Kertas' : 'Tambah Ukuran Kertas'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={950} 
      >
        <Row gutter={24} style={{ marginTop: 24 }}>
            <Col span={12}>
                <Card 
                    title="Pratinjau Kertas & Margin" 
                    bordered={true} 
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 8px' }}
                >
                    <PaperPreview 
                        panjang={previewValues.panjang}
                        lebar={previewValues.lebar}
                        satuan={previewValues.satuan}
                        margin_atas={previewValues.margin_atas}
                        margin_bawah={previewValues.margin_bawah}
                        margin_kiri={previewValues.margin_kiri}
                        margin_kanan={previewValues.margin_kanan}
                    />
                </Card>
            </Col>
            <Col span={12}>
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleFinish} 
                    onValuesChange={onValuesChange} 
                >
                    <Form.Item
                        name="nama_kertas"
                        label="Nama Kertas"
                        rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
                    >
                        <Input placeholder="Contoh: A4, F4, Letter" />
                    </Form.Item>
                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Dimensi Kertas (Panjang x Lebar)</Title>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="satuan" label="Satuan" rules={[{ required: true }]}>
                                <Select placeholder="Pilih satuan">
                                    <Option value="mm">mm</Option>
                                    <Option value="cm">cm</Option>
                                    <Option value="in">in</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="panjang"
                                label="Panjang"
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
                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Pengaturan Margin (Sesuai Pratinjau)</Title>
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
            </Col>
        </Row>
      </Modal>
    </>
  );
};

export default PaperSizeTab;