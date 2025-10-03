import React, { useState, useEffect, useCallback } from 'react';
import { Tree, Button, message, Spin, Empty, Input, Popconfirm, Space, Modal, Form, Select, DatePicker, Tag, Tooltip, Typography } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CalendarOutlined, AuditOutlined, FileTextOutlined } from '@ant-design/icons';
import {
  getAllRencanaPembelajaran,
  createMateri,
  updateMateri,
  deleteMateri,
  createUjian,
  updateUjian,
  deleteUjian,
  createTujuan,
  updateTujuan,
  deleteTujuan,
  updateRencanaUrutan,
  updateUrutanTujuan,
} from '../api/pembelajaran';
import { getAllJenisUjian } from '../api/jenisUjian';
import { createPenilaian, updatePenilaian, deletePenilaian } from '../api/penilaianSumatif';
import type { RencanaPembelajaranItem, TujuanPembelajaran, JenisUjian, PenilaianSumatif, UpsertPenilaianSumatifInput, Ujian } from '../types';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { format, parseISO } from 'date-fns';

const { TextArea } = Input;
const { Text } = Typography;

interface EditableTitleProps {
  initialValue: string;
  isTextArea?: boolean;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ initialValue, isTextArea = false, onSave, onCancel }) => {
  const [text, setText] = useState(initialValue);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
    } else {
      message.error("Nama tidak boleh kosong.");
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <div style={{ flex: 1, marginRight: '8px' }}>
        {isTextArea ? (
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => { e.preventDefault(); handleSave(); }}
            autoFocus
          />
        ) : (
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={handleSave}
            autoFocus
          />
        )}
      </div>
      <Space>
        <Button icon={<CheckOutlined />} onClick={handleSave} type="primary" size="small" />
        <Button icon={<CloseOutlined />} onClick={onCancel} size="small" />
      </Space>
    </div>
  );
};

interface MateriPembelajaranPanelProps {
  pengajarKelasId: string;
}

const parseKey = (key: Key): { type: string; id: number | string; parentId?: number } => {
    const keyStr = String(key);
    const parts = keyStr.split('_');
    const id = (parts[0] === 'penilaian' || parts[0] === 'ujian') ? parts[1] : parseInt(parts[1], 10);
    return {
        type: parts[0],
        id: id,
        parentId: parts.length > 2 ? parseInt(parts[2], 10) : undefined,
    };
};

const MateriPembelajaranPanel = ({ pengajarKelasId }: MateriPembelajaranPanelProps) => {
  const [rencanaList, setRencanaList] = useState<RencanaPembelajaranItem[]>([]);
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<Key | null>(null);

  const [penilaianModalVisible, setPenilaianModalVisible] = useState(false);
  const [isEditingPenilaian, setIsEditingPenilaian] = useState(false);
  const [currentItem, setCurrentItem] = useState<TujuanPembelajaran | Ujian | null>(null);
  const [editingPenilaian, setEditingPenilaian] = useState<PenilaianSumatif | null>(null);
  const [penilaianForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    if (!pengajarKelasId) return;
    setLoading(true);
    try {
      const [rencanaData, jenisUjianData] = await Promise.all([
        getAllRencanaPembelajaran(pengajarKelasId),
        getAllJenisUjian()
      ]);
      setRencanaList(rencanaData || []);
      setJenisUjianList(jenisUjianData || []);
    } catch (error) {
      message.error('Gagal memuat data rencana pembelajaran.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pengajarKelasId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMateri = async () => {
    try {
      await createMateri({ pengajar_kelas_id: pengajarKelasId, nama_materi: "Materi Baru" });
      message.success("Materi baru berhasil ditambahkan.");
      fetchData();
    } catch (error) {
      message.error("Gagal menambahkan materi baru.");
    }
  };

  const handleAddUjian = async () => {
    try {
      await createUjian({ pengajar_kelas_id: pengajarKelasId, nama_ujian: "Ujian Baru" });
      message.success("Ujian baru berhasil ditambahkan.");
      fetchData();
    } catch (error) {
      message.error("Gagal menambahkan ujian baru.");
    }
  };

  const handleAddTujuan = async (materiId: number) => {
    try {
      await createTujuan({ materi_pembelajaran_id: materiId, deskripsi_tujuan: "Tujuan pembelajaran baru." });
      message.success("Tujuan pembelajaran baru berhasil ditambahkan.");
      fetchData();
    } catch (error) {
      message.error("Gagal menambahkan tujuan pembelajaran.");
    }
  };

  const handleSave = useCallback(async (newValue: string) => {
    if (!editingKey) return;
    const { type, id, parentId } = parseKey(editingKey);

    setEditingKey(null);

    try {
      if (type === 'materi') {
        await updateMateri(id as number, { nama_materi: newValue, pengajar_kelas_id: pengajarKelasId });
      } else if (type === 'ujian') {
        await updateUjian(id as number, { nama_ujian: newValue, pengajar_kelas_id: pengajarKelasId });
      } else if (type === 'tp' && parentId) {
        await updateTujuan(id as number, { deskripsi_tujuan: newValue, materi_pembelajaran_id: parentId });
      }
      message.success("Perubahan berhasil disimpan.");
      fetchData();
    } catch (error) {
      message.error("Gagal menyimpan perubahan.");
      fetchData();
    }
  }, [editingKey, pengajarKelasId, fetchData]);


  const handleDelete = useCallback(async (key: string) => {
    const { type, id } = parseKey(key);
    try {
      if (type === 'materi') await deleteMateri(id as number);
      else if (type === 'ujian') await deleteUjian(id as number);
      else if (type === 'tp') await deleteTujuan(id as number);
      else if (type === 'penilaian') await deletePenilaian(String(id));
      message.success("Data berhasil dihapus.");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus data.");
    }
  }, [fetchData]);

  const handleOpenPenilaianModal = (item: TujuanPembelajaran | Ujian, penilaian: PenilaianSumatif | null) => {
    setCurrentItem(item);
    setEditingPenilaian(penilaian);
    setIsEditingPenilaian(!!penilaian);
    penilaianForm.setFieldsValue(
      penilaian
        ? { ...penilaian, tanggal_pelaksanaan: penilaian.tanggal_pelaksanaan ? dayjs(penilaian.tanggal_pelaksanaan) : null }
        : { jenis_ujian_id: undefined, nama_penilaian: '', tanggal_pelaksanaan: null, keterangan: '' }
    );
    setPenilaianModalVisible(true);
  };

  const handleFinishPenilaian = useCallback(async (values: any) => {
    if (!currentItem) return;
    const payload: UpsertPenilaianSumatifInput = {
      ...values,
      tanggal_pelaksanaan: values.tanggal_pelaksanaan ? values.tanggal_pelaksanaan.format('YYYY-MM-DD') : undefined,
    };

    if ('deskripsi_tujuan' in currentItem) {
      payload.tujuan_pembelajaran_id = currentItem.id;
    } else {
      payload.ujian_id = currentItem.id;
    }

    try {
      if (isEditingPenilaian && editingPenilaian) {
        await updatePenilaian(editingPenilaian.id, payload);
        message.success("Rencana penilaian berhasil diperbarui.");
      } else {
        await createPenilaian(payload);
        message.success("Rencana penilaian berhasil ditambahkan.");
      }
      setPenilaianModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Gagal menyimpan rencana penilaian.");
    }
  }, [currentItem, isEditingPenilaian, editingPenilaian, fetchData]);

  // PERBAIKAN: Definisikan handler secara terpisah dengan tipe eksplisit
  const dropHandler: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const dragNodeData = parseKey(dragKey);
    const dropNodeData = parseKey(dropKey);

    if (!info.dropToGap) {
        message.warning("Item hanya bisa diurutkan, bukan dijadikan sub-item.");
        return;
    }

    if ((dragNodeData.type === 'materi' || dragNodeData.type === 'ujian') && (dropNodeData.type === 'materi' || dropNodeData.type === 'ujian')) {
        const reorderedList = [...rencanaList];
        const dragIndex = reorderedList.findIndex(item => `${item.type}_${item.id}` === dragKey);
        const [draggedItem] = reorderedList.splice(dragIndex, 1);
        const dropIndex = reorderedList.findIndex(item => `${item.type}_${item.id}` === dropKey);
        reorderedList.splice(dropPosition <= 0 ? dropIndex : dropIndex + 1, 0, draggedItem);
        setRencanaList(reorderedList);
        const orderedItems = reorderedList.map(item => ({ id: item.id, type: item.type as 'materi' | 'ujian' }));
        try {
            await updateRencanaUrutan({ ordered_items: orderedItems });
            message.success('Urutan berhasil diperbarui.');
        } catch (error) {
            message.error('Gagal menyimpan urutan baru. Memuat ulang data...');
            fetchData();
        }
    }
    else if (dragNodeData.type === 'tp' && dropNodeData.type === 'tp' && dragNodeData.parentId === dropNodeData.parentId) {
        const parentMateri = rencanaList.find(m => m.id === dragNodeData.parentId);
        if (!parentMateri || !parentMateri.tujuan_pembelajaran) return;
        const reorderedTPs = [...parentMateri.tujuan_pembelajaran];
        const dragIndex = reorderedTPs.findIndex(tp => `tp_${tp.id}_${tp.materi_pembelajaran_id}` === dragKey);
        const [draggedItem] = reorderedTPs.splice(dragIndex, 1);
        const dropIndex = reorderedTPs.findIndex(tp => `tp_${tp.id}_${tp.materi_pembelajaran_id}` === dropKey);
        reorderedTPs.splice(dropPosition <= 0 ? dropIndex : dropIndex + 1, 0, draggedItem);
        const updatedRencanaList = rencanaList.map(m => m.id === dragNodeData.parentId ? { ...m, tujuan_pembelajaran: reorderedTPs } : m);
        setRencanaList(updatedRencanaList);
        const orderedIds = reorderedTPs.map(tp => tp.id);
        try {
            await updateUrutanTujuan({ ordered_ids: orderedIds });
            message.success('Urutan tujuan pembelajaran berhasil diperbarui.');
        } catch (error) {
            message.error('Gagal menyimpan urutan baru. Memuat ulang data...');
            fetchData();
        }
    } else {
        message.warning("Drag and drop hanya didukung untuk item pada level yang sama.");
    }
  };

  // Bungkus handler yang sudah memiliki tipe dengan useCallback
  const onDrop = useCallback(dropHandler, [rencanaList, fetchData]);


  const generateTreeData = useCallback((): TreeDataNode[] => {
    return rencanaList.map(item => {
        const itemKey = `${item.type}_${item.id}`;
        let childrenNodes: TreeDataNode[] = [];

        if (item.type === 'materi' && item.tujuan_pembelajaran) {
            childrenNodes = item.tujuan_pembelajaran.map(tp => {
                const tpKey = `tp_${tp.id}_${item.id}`;
                const penilaianNodes = (tp.penilaian_sumatif || []).map(penilaian => {
                    const penilaianKey = `penilaian_${penilaian.id}_${tp.id}`;
                    return {
                        key: penilaianKey,
                        title: (
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <div style={{ flex: 1, marginRight: '8px' }}>
                                    <Space>
                                        <Tag color="blue">{penilaian.kode_jenis_ujian}</Tag>
                                        <Text>{penilaian.nama_penilaian}</Text>
                                        {penilaian.tanggal_pelaksanaan && <Tag icon={<CalendarOutlined />}>{format(parseISO(penilaian.tanggal_pelaksanaan), 'dd MMM')}</Tag>}
                                    </Space>
                                </div>
                                <Space>
                                    <Button icon={<EditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(tp, penilaian)} />
                                    <Popconfirm title="Hapus penilaian ini?" onConfirm={() => handleDelete(penilaianKey)}><Button icon={<DeleteOutlined />} size="small" type="text" danger /></Popconfirm>
                                </Space>
                            </div>
                        ),
                        isLeaf: true
                    };
                });
                return {
                    key: tpKey,
                    title: editingKey === tpKey ? (
                        <EditableTitle initialValue={tp.deskripsi_tujuan} isTextArea onSave={(val) => handleSave(val)} onCancel={() => setEditingKey(null)} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Text style={{ flex: 1, marginRight: '8px' }}>{tp.deskripsi_tujuan}</Text>
                            <Space>
                                <Tooltip title="Tambah Penilaian"><Button icon={<AuditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(tp, null)}/></Tooltip>
                                <Button icon={<EditOutlined />} onClick={() => setEditingKey(tpKey)} size="small" type="text" />
                                <Popconfirm title="Hapus tujuan ini?" onConfirm={() => handleDelete(tpKey)}><Button icon={<DeleteOutlined />} size="small" type="text" danger /></Popconfirm>
                            </Space>
                        </div>
                    ),
                    children: penilaianNodes
                };
            });
        } else if (item.type === 'ujian' && item.penilaian_sumatif) {
            childrenNodes = item.penilaian_sumatif.map(penilaian => {
                const penilaianKey = `penilaian_${penilaian.id}_${item.id}`;
                return {
                    key: penilaianKey,
                    title: (
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ flex: 1, marginRight: '8px' }}>
                                <Space>
                                    <Tag color="purple">{penilaian.kode_jenis_ujian}</Tag>
                                    <Text>{penilaian.nama_penilaian}</Text>
                                    {penilaian.tanggal_pelaksanaan && <Tag icon={<CalendarOutlined />}>{format(parseISO(penilaian.tanggal_pelaksanaan), 'dd MMM')}</Tag>}
                                </Space>
                            </div>
                            <Space>
                                <Button icon={<EditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(item as Ujian, penilaian)} />
                                <Popconfirm title="Hapus rincian ini?" onConfirm={() => handleDelete(penilaianKey)}><Button icon={<DeleteOutlined />} size="small" type="text" danger /></Popconfirm>
                            </Space>
                        </div>
                    ),
                    isLeaf: true
                };
            });
        }

        return {
            key: itemKey,
            icon: item.type === 'ujian' ? <FileTextOutlined /> : undefined,
            title: editingKey === itemKey ? (
                <EditableTitle initialValue={item.nama} onSave={(val) => handleSave(val)} onCancel={() => setEditingKey(null)} />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontWeight: 'bold', flex: 1, marginRight: '8px' }}>{item.nama}</span>
                    <Space>
                        {item.type === 'materi' && <Button icon={<PlusOutlined />} onClick={() => handleAddTujuan(item.id)} size="small" type="text" />}
                        {item.type === 'ujian' && <Tooltip title="Tambah Rincian Ujian"><Button icon={<AuditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(item as Ujian, null)}/></Tooltip>}
                        <Button icon={<EditOutlined />} onClick={() => setEditingKey(itemKey)} size="small" type="text" />
                        <Popconfirm title={`Hapus ${item.type} ini?`} onConfirm={() => handleDelete(itemKey)}><Button icon={<DeleteOutlined />} size="small" type="text" danger /></Popconfirm>
                    </Space>
                </div>
            ),
            children: childrenNodes
        };
    });
  }, [rencanaList, editingKey, handleSave, handleDelete, handleOpenPenilaianModal, handleAddTujuan]);


  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><Spin /></div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PlusOutlined />} onClick={handleAddMateri}>Tambah Materi</Button>
        <Button icon={<PlusOutlined />} onClick={handleAddUjian}>Tambah Ujian</Button>
      </Space>
      {rencanaList.length > 0 ? (
        <Tree
          showLine={{ showLeafIcon: false }}
          draggable={{ icon: false }}
          blockNode
          onDrop={onDrop}
          treeData={generateTreeData()}
          defaultExpandAll
        />
      ) : (
        <Empty description="Belum ada materi atau ujian untuk mata pelajaran ini." />
      )}
      <Modal
        title={isEditingPenilaian ? "Edit Rencana Penilaian" : "Tambah Rencana Penilaian"}
        open={penilaianModalVisible}
        onCancel={() => setPenilaianModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={penilaianForm} layout="vertical" onFinish={handleFinishPenilaian} style={{ marginTop: 24 }}>
          <Form.Item name="jenis_ujian_id" label="Jenis Ujian" rules={[{ required: true }]}>
            <Select placeholder="Pilih jenis ujian" options={jenisUjianList.map(ju => ({ value: ju.id, label: `${ju.nama_ujian} (${ju.kode_ujian})` }))} />
          </Form.Item>
          <Form.Item name="nama_penilaian" label="Nama Penilaian" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Ulangan Harian Bab 1" />
          </Form.Item>
          <Form.Item name="tanggal_pelaksanaan" label="Tanggal Pelaksanaan (Opsional)">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="keterangan" label="Keterangan (Opsional)">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={() => setPenilaianModalVisible(false)} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit">Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MateriPembelajaranPanel;