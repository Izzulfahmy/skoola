// file: frontend/src/pages/MataPelajaranPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
// --- 1. 'Tooltip' dihapus dari import di bawah ---
import { App, Button, message, Modal, Table, Alert, Form, Input, Space, Popconfirm, Typography, Collapse, InputNumber, Spin, Flex, Tag } from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createMataPelajaran, updateMataPelajaran, deleteMataPelajaran, updateUrutanMataPelajaran } from '../api/mataPelajaran';
import { getAllKelompokMapel, createKelompokMapel, updateKelompokMapel, deleteKelompokMapel } from '../api/kelompokMapel';
import type { MataPelajaran, KelompokMataPelajaran, UpsertKelompokMataPelajaranInput } from '../types';

const { Title, Text } = Typography;

// Custom hook to get window size
const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const DraggableRow = ({ className, ...props }: DraggableRowProps) => {
  return <tr {...props} className={`${className} draggable-row`} style={{ cursor: 'move' }} />;
};


const MataPelajaranPageContent = () => {
  const [mapelForm] = Form.useForm();
  const [kelompokForm] = Form.useForm();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  const [kelompokList, setKelompokList] = useState<KelompokMataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: string; position: 'top' | 'bottom' } | null>(null);

  // State untuk Modal Mata Pelajaran
  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [isMapelSubmitting, setIsMapelSubmitting] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [parentMapel, setParentMapel] = useState<MataPelajaran | null>(null);
  const [currentKelompok, setCurrentKelompok] = useState<KelompokMataPelajaran | null>(null);
  
  // State untuk Modal Kelompok
  const [isKelompokModalOpen, setIsKelompokModalOpen] = useState(false);
  const [isKelompokSubmitting, setIsKelompokSubmitting] = useState(false);
  const [editingKelompok, setEditingKelompok] = useState<KelompokMataPelajaran | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllKelompokMapel();
      const sanitizedData = (data || []).map(kelompok => ({
        ...kelompok,
        mata_pelajaran: (kelompok.mata_pelajaran || []).map(mp => ({
          ...mp,
          children: mp.children || [],
        })),
      }));
      setKelompokList(sanitizedData);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragEnd = useCallback(async (list: MataPelajaran[], originalList: KelompokMataPelajaran[]) => {
    try {
      const orderedIds = list.map(item => item.id);
      await updateUrutanMataPelajaran({ ordered_ids: orderedIds });
      message.success('Urutan berhasil disimpan!');
    } catch {
      message.error('Gagal menyimpan urutan baru.');
      setKelompokList(originalList); // Rollback on error
    }
  }, []);

  const onRow = (record: MataPelajaran): React.HTMLAttributes<HTMLElement> => ({
    draggable: true,
  className: dropIndicator?.id === record.id ? `drop-indicator-${dropIndicator.position}` : '',
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', record.id);
    },
  onDragLeave: () => {
    setDropIndicator(null);
  },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position = e.clientY < midY ? 'top' : 'bottom';
      setDropIndicator({ id: record.id, position });
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
    setDropIndicator(null);
      const dragId = e.dataTransfer.getData('text/plain');
      const dropId = record.id;
  
      if (dragId === dropId) return;
  
      const findItem = (id: string, list: KelompokMataPelajaran[]): {item?: MataPelajaran, parent?: MataPelajaran, kelompok?: KelompokMataPelajaran} => {
    for (const kelompok of list) {
      for (const parent of kelompok.mata_pelajaran) {
        if (parent.id === id) return { item: parent, kelompok };
        if (parent.children) {
          const child = parent.children.find(c => c.id === id);
          if (child) return { item: child, parent, kelompok };
        }
      }
    }
        return {};
      };
      
      const { item: dragItem, parent: dragParent, kelompok: dragKelompok } = findItem(dragId, kelompokList);
      const { item: dropItem, parent: dropParent, kelompok: dropKelompok } = findItem(dropId, kelompokList);

      if (!dragItem || !dropItem || dragParent?.id !== dropParent?.id || dragKelompok?.id !== dropKelompok?.id) {
        message.warning('Hanya bisa mengurutkan mata pelajaran dalam level atau kelompok yang sama.');
        return;
      }

      const originalList = [...kelompokList];

      const reorder = (list: MataPelajaran[]): MataPelajaran[] => {
    let dragIndex = list.findIndex(item => item.id === dragId);
    let dropIndex = list.findIndex(item => item.id === dropId);
    
    const newList = [...list];
    const [reorderedItem] = newList.splice(dragIndex, 1);
    
    dropIndex = newList.findIndex(item => item.id === dropId);

    if (dropIndicator?.position === 'top') {
      newList.splice(dropIndex, 0, reorderedItem);
    } else {
      newList.splice(dropIndex + 1, 0, reorderedItem);
    }
        
        handleDragEnd(newList, originalList);
        return newList;
      }
      
      setKelompokList(prev => prev.map(kelompok => {
        if (dragParent && kelompok.id === dragKelompok?.id) {
      const newMataPelajaran = kelompok.mata_pelajaran.map(mp => 
        mp.id === dragParent.id ? {...mp, children: reorder(mp.children || [])} : mp
      )
      return { ...kelompok, mata_pelajaran: newMataPelajaran };
        }
        if (!dragParent && kelompok.id === dragKelompok?.id) {
          return { ...kelompok, mata_pelajaran: reorder(kelompok.mata_pelajaran) };
        }
        return kelompok;
      }));
    },
  });

  const showMapelModal = (mapel: MataPelajaran | null, parent?: MataPelajaran, kelompok?: KelompokMataPelajaran) => {
    setEditingMapel(mapel);
    setParentMapel(parent || null);
  setCurrentKelompok(kelompok || null);
    
    mapelForm.setFieldsValue({
      ...mapel,
    });
    setIsMapelModalOpen(true);
  };

  const handleMapelCancel = () => {
    setIsMapelModalOpen(false);
    setEditingMapel(null);
    setParentMapel(null);
  setCurrentKelompok(null);
    mapelForm.resetFields();
  };

  const handleMapelFinish = async (values: { kode_mapel: string; nama_mapel: string; }) => {
    setIsMapelSubmitting(true);
    
    const parent_id = editingMapel ? editingMapel.parent_id : parentMapel?.id;
    const kelompok_id = currentKelompok?.id !== 0 ? currentKelompok?.id : undefined;

    const payload = { ...values, parent_id, kelompok_id };

    try {
      if (editingMapel) {
        await updateMataPelajaran(editingMapel.id, payload);
        message.success('Mata pelajaran berhasil diperbarui!');
      } else {
        await createMataPelajaran(payload);
        message.success('Mata pelajaran baru berhasil ditambahkan!');
      }
      handleMapelCancel();
      fetchData(); // Fetch data again to get the correct state from server
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menyimpan data.');
    } finally {
      setIsMapelSubmitting(false);
    }
  };

  const showKelompokModal = (kelompok: KelompokMataPelajaran | null) => {
  setEditingKelompok(kelompok);
  if (kelompok) {
    kelompokForm.setFieldsValue(kelompok);
  } else {
    const nextUrutan = kelompokList.length > 0 ? Math.max(...kelompokList.map(k => k.urutan || 0)) + 1 : 1;
    kelompokForm.setFieldsValue({ nama_kelompok: '', urutan: nextUrutan });
  }
  setIsKelompokModalOpen(true);
  };

  const handleKelompokCancel = () => {
  setIsKelompokModalOpen(false);
  setEditingKelompok(null);
  kelompokForm.resetFields();
  }

  const handleKelompokFinish = async (values: UpsertKelompokMataPelajaranInput) => {
  setIsKelompokSubmitting(true);
  try {
    if (editingKelompok) {
      await updateKelompokMapel(editingKelompok.id, values);
      message.success('Kelompok berhasil diperbarui!');
    } else {
      await createKelompokMapel(values);
      message.success('Kelompok baru berhasil ditambahkan!');
    }
    handleKelompokCancel();
        fetchData();
  } catch (error) {
    message.error('Gagal menyimpan kelompok.');
  } finally {
    setIsKelompokSubmitting(false);
  }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMataPelajaran(id);
      message.success('Mata pelajaran berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data || 'Gagal menghapus data.');
    }
  };

  const handleDeleteKelompok = async (id: number) => {
  try {
    await deleteKelompokMapel(id);
    message.success('Kelompok berhasil dihapus!');
        fetchData();
    } catch (err: any) {
    message.error(err.response?.data || 'Gagal menghapus kelompok.');
    }
  }
  
  const renderMapelTable = (mapelData: MataPelajaran[], kelompok: KelompokMataPelajaran) => {
  const columns: TableProps<MataPelajaran>['columns'] = [
    {
      title: 'Nama Mata Pelajaran',
      dataIndex: 'nama_mapel',
      key: 'nama_mapel',
      render: (text) => (
      <Flex>
        <Text>{text}</Text>
      </Flex>
      ),
    },
    {
      title: 'Kode',
      dataIndex: 'kode_mapel',
      key: 'kode_mapel',
      width: 100,
      align: 'center',
          responsive: ['sm'],
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: isMobile ? 120 : 150,
      render: (_, record) => (
      <Space>
        {/* --- 2. PERBAIKAN DI SINI: <Tooltip> dihapus --- */}
        {!record.parent_id && (
          <Button shape="circle" icon={<PlusOutlined />} onClick={() => showMapelModal(null, record, kelompok)} />
        )}
        
        {/* --- 2. PERBAIKAN DI SINI: <Tooltip> dihapus --- */}
        <Button shape="circle" icon={<EditOutlined />} onClick={() => showMapelModal(record, undefined, kelompok)} />

        <Popconfirm
        title="Hapus Mata Pelajaran?"
        description={record.children && record.children.length > 0 ? "Menghapus ini akan membuat turunannya menjadi mapel mandiri." : "Apakah Anda yakin?"}
        onConfirm={() => handleDelete(record.id)}
        okText="Ya, Hapus"
        cancelText="Batal"
        >
          {/* --- 2. PERBAIKAN DI SINI: <Tooltip> dihapus --- */}
          <Button danger shape="circle" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
      ),
    },
  ];

  return (
    <Table
      components={{
        body: { row: DraggableRow },
      }}
      columns={columns}
      dataSource={mapelData}
      rowKey="id"
      pagination={false}
      size="small"
      expandable={{
        childrenColumnName: 'children',
        expandRowByClick: true,
        defaultExpandAllRows: true,
      }}
            onRow={onRow}
      showHeader={false}
    />
  )
  }

  const collapseItems = kelompokList.map(kelompok => ({
  key: kelompok.id,
  label: <Title level={5}>{kelompok.nama_kelompok}</Title>,
  children: renderMapelTable(kelompok.mata_pelajaran, kelompok),
  extra: (
    <Space onClick={(e) => e.stopPropagation()}>
      {/* --- 3. PERBAIKAN DI SINI: <Tooltip> dihapus --- */}
      <Button size="small" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => showMapelModal(null, undefined, kelompok)} />

      {kelompok.id !== 0 && (
        <>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => showKelompokModal(kelompok)} />
          <Popconfirm title="Hapus Kelompok?" onConfirm={() => handleDeleteKelompok(kelompok.id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      )}
    </Space>
  ),
  }));

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Flex justify="space-between" align="start" gap="middle" vertical={isMobile} style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Manajemen Mata Pelajaran</Title>
          <Button type="primary" onClick={() => showKelompokModal(null)}>Tambah Kelompok</Button>
      </Flex>

    {loading ? <Spin /> : (
    <Collapse ghost defaultActiveKey={kelompokList.map(k => k.id)} items={collapseItems} />
    )}

      <Modal
        title={editingMapel ? 'Edit Mata Pelajaran' : (parentMapel ? `Tambah Turunan dari ${parentMapel.nama_mapel}` : 'Tambah Mata Pelajaran Baru')}
        open={isMapelModalOpen}
        onCancel={handleMapelCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={mapelForm} layout="vertical" onFinish={handleMapelFinish} style={{ marginTop: 24 }}>
          <Form.Item name="kode_mapel" label="Kode Mata Pelajaran" rules={[{ required: true }]}>
            <Input placeholder="Contoh: MTK-01" />
          </Form.Item>
          <Form.Item name="nama_mapel" label="Nama Mata Pelajaran" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Matematika Wajib" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={handleMapelCancel} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={isMapelSubmitting}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    <Modal
        title={editingKelompok ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}
        open={isKelompokModalOpen}
        onCancel={handleKelompokCancel}
        footer={null}
        destroyOnClose
      >
    <Form form={kelompokForm} layout="vertical" onFinish={handleKelompokFinish} style={{ marginTop: 24 }}>
      <Form.Item name="nama_kelompok" label="Nama Kelompok" rules={[{ required: true }]}>
        <Input placeholder="Contoh: Mata Pelajaran Umum"/>
      </Form.Item>
      <Form.Item name="urutan" label="Nomor Urut">
        <InputNumber placeholder="Untuk mengurutkan tampilan" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
        <Button onClick={handleKelompokCancel} style={{ marginRight: 8 }}>Batal</Button>
        <Button type="primary" htmlType="submit" loading={isKelompokSubmitting}>
        Simpan
        </Button>
      </Form.Item>
    </Form>
    </Modal>

    </div>
  );
};

const MataPelajaranPage = () => (
    <App>
        <MataPelajaranPageContent />
    </App>
);

export default MataPelajaranPage;