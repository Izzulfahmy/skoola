// file: frontend/src/components/MateriPembelajaranPanel.tsx
import { useState, useEffect } from 'react';
import { Tree, Button, message, Spin, Empty, Input, Popconfirm, Space, Modal, Form, Select, DatePicker, List, Tag, Tooltip, Typography, Popover, Badge } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CalendarOutlined, AuditOutlined } from '@ant-design/icons';
import {
  getAllMateriByPengajarKelas,
  createMateri,
  updateMateri,
  deleteMateri,
  createTujuan,
  updateTujuan,
  deleteTujuan,
  updateUrutanMateri,
  updateUrutanTujuan,
} from '../api/pembelajaran';
import { getAllJenisUjian } from '../api/jenisUjian';
import { createPenilaian, updatePenilaian, deletePenilaian } from '../api/penilaianSumatif';
import type { MateriPembelajaran, TujuanPembelajaran, JenisUjian, PenilaianSumatif, UpsertPenilaianSumatifInput } from '../types';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { format } from 'date-fns';

const { TextArea } = Input;
const { Text } = Typography;

interface MateriPembelajaranPanelProps {
  pengajarKelasId: string;
}

type EditableNode = {
    key: string;
    value: string;
};

const parseKey = (key: Key): { type: string; id: number; parentId?: number } => {
    const keyStr = String(key);
    const parts = keyStr.split('-');
    return {
        type: parts[0],
        id: parseInt(parts[1], 10),
        parentId: parts.length > 2 ? parseInt(parts[2], 10) : undefined,
    };
};

const MateriPembelajaranPanel = ({ pengajarKelasId }: MateriPembelajaranPanelProps) => {
  const [materiList, setMateriList] = useState<MateriPembelajaran[]>([]);
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableNode, setEditableNode] = useState<EditableNode | null>(null);

  // State for Penilaian Modal
  const [penilaianModalVisible, setPenilaianModalVisible] = useState(false);
  const [isEditingPenilaian, setIsEditingPenilaian] = useState(false);
  const [currentTp, setCurrentTp] = useState<TujuanPembelajaran | null>(null);
  const [editingPenilaian, setEditingPenilaian] = useState<PenilaianSumatif | null>(null);
  const [penilaianForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materiData, jenisUjianData] = await Promise.all([
        getAllMateriByPengajarKelas(pengajarKelasId),
        getAllJenisUjian()
      ]);
      setMateriList(materiData || []);
      setJenisUjianList(jenisUjianData || []);
    } catch (error) {
      message.error('Gagal memuat data materi pembelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pengajarKelasId]);

  const handleAddMateri = async () => {
    try {
      await createMateri({ pengajar_kelas_id: pengajarKelasId, nama_materi: "Materi Baru" });
      message.success("Materi baru berhasil ditambahkan.");
      fetchData();
    } catch (error) {
      message.error("Gagal menambahkan materi baru.");
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
  
  const handleSave = async () => {
    if (!editableNode) return;
    const { key, value } = editableNode;
    const { type, id } = parseKey(key);

    try {
        if (type === 'materi') {
            const materi = materiList.find(m => m.id === id);
            if (materi) {
                await updateMateri(id, { ...materi, nama_materi: value, pengajar_kelas_id: materi.pengajar_kelas_id, deskripsi: materi.deskripsi || undefined, urutan: materi.urutan });
            }
        } else if (type === 'tp') {
            const { parentId } = parseKey(key);
            const tp = materiList.flatMap(m => m.tujuan_pembelajaran).find(t => t.id === id);
            if (tp && parentId) {
                await updateTujuan(id, { ...tp, deskripsi_tujuan: value, materi_pembelajaran_id: parentId });
            }
        }
        message.success("Perubahan berhasil disimpan.");
        setEditableNode(null);
        fetchData();
    } catch (error) {
        message.error("Gagal menyimpan perubahan.");
    }
  };

  const handleDelete = async (key: string) => {
    const { type, id } = parseKey(key);
    try {
      if (type === 'materi') {
        await deleteMateri(id);
      } else if (type === 'tp') {
        await deleteTujuan(id);
      }
      message.success("Data berhasil dihapus.");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus data.");
    }
  };
  
  const handleOpenPenilaianModal = (tp: TujuanPembelajaran, penilaian: PenilaianSumatif | null) => {
    setCurrentTp(tp);
    setEditingPenilaian(penilaian);
    setIsEditingPenilaian(!!penilaian);
    penilaianForm.setFieldsValue(
      penilaian
        ? { ...penilaian, tanggal_pelaksanaan: penilaian.tanggal_pelaksanaan ? dayjs(penilaian.tanggal_pelaksanaan) : null }
        : { jenis_ujian_id: undefined, nama_penilaian: '', tanggal_pelaksanaan: null, keterangan: '' }
    );
    setPenilaianModalVisible(true);
  };

  const handleFinishPenilaian = async (values: any) => {
    if (!currentTp) return;

    const payload: UpsertPenilaianSumatifInput = {
      ...values,
      tujuan_pembelajaran_id: currentTp.id,
      tanggal_pelaksanaan: values.tanggal_pelaksanaan ? values.tanggal_pelaksanaan.format('YYYY-MM-DD') : undefined,
    };

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
  };

  const handleDeletePenilaian = async (id: string) => {
    try {
      await deletePenilaian(id);
      message.success("Rencana penilaian berhasil dihapus.");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus rencana penilaian.");
    }
  };

  const onDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const dragNodeData = parseKey(dragKey);
    const dropNodeData = parseKey(dropKey);

    if (dragNodeData.type !== dropNodeData.type) return;

    if (dragNodeData.type === 'materi') {
        const data = [...materiList];
        let dragObj: MateriPembelajaran;
        const fromIndex = data.findIndex(item => item.id === dragNodeData.id);
        if (fromIndex === -1) return;
        [dragObj] = data.splice(fromIndex, 1);

        let toIndex = data.findIndex(item => item.id === dropNodeData.id);
        if (info.dropToGap) {
            if (dropPosition >= 0) toIndex++;
        }
        data.splice(toIndex, 0, dragObj!);
        
        setMateriList(data);
        
        const orderedIDs = data.map(item => item.id);
        updateUrutanMateri({ ordered_ids: orderedIDs }).catch(() => message.error("Gagal menyimpan urutan materi."));

    } else if (dragNodeData.type === 'tp') {
        if(dragNodeData.parentId !== dropNodeData.parentId) return;
        const parentId = dragNodeData.parentId;
        if (!parentId) return;

        const data = [...materiList];
        const materiIndex = data.findIndex(m => m.id === parentId);
        if (materiIndex === -1) return;

        let tpList = [...data[materiIndex].tujuan_pembelajaran];
        let dragObj: TujuanPembelajaran;
        const fromIndex = tpList.findIndex(item => item.id === dragNodeData.id);
        if (fromIndex === -1) return;
        [dragObj] = tpList.splice(fromIndex, 1);

        let toIndex = tpList.findIndex(item => item.id === dropNodeData.id);
        if (info.dropToGap) {
            if (dropPosition >= 0) toIndex++;
        }
        tpList.splice(toIndex, 0, dragObj!);

        data[materiIndex].tujuan_pembelajaran = tpList;
        setMateriList(data);

        const orderedIDs = tpList.map(item => item.id);
        updateUrutanTujuan({ ordered_ids: orderedIDs }).catch(() => message.error("Gagal menyimpan urutan tujuan."));
    }
};

  const generateTreeData = (): TreeDataNode[] => {
    return materiList.map(materi => {
        const key = `materi-${materi.id}`;
        const isEditing = editableNode?.key === key;
        return {
            key: key,
            title: (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ flex: 1, marginRight: '8px' }}>
                        {isEditing ? (
                            <Input
                                defaultValue={editableNode.value}
                                onChange={(e) => setEditableNode({ ...editableNode, value: e.target.value })}
                                onPressEnter={handleSave}
                                autoFocus
                            />
                        ) : (
                            <span style={{ fontWeight: 'bold' }}>{materi.nama_materi}</span>
                        )}
                    </div>
                    {isEditing ? (
                        <Space>
                            <Button icon={<CheckOutlined />} onClick={handleSave} type="primary" size="small" />
                            <Button icon={<CloseOutlined />} onClick={() => setEditableNode(null)} size="small" />
                        </Space>
                    ) : (
                        <Space>
                            <Button icon={<PlusOutlined />} onClick={() => handleAddTujuan(materi.id)} size="small" type="text" />
                            <Button icon={<EditOutlined />} onClick={() => setEditableNode({ key, value: materi.nama_materi })} size="small" type="text" />
                            <Popconfirm title="Hapus materi & semua tujuannya?" onConfirm={() => handleDelete(key)}>
                                <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                            </Popconfirm>
                        </Space>
                    )}
                </div>
            ),
            children: materi.tujuan_pembelajaran.map(tp => {
                const tpKey = `tp-${tp.id}-${materi.id}`;
                const isEditingTP = editableNode?.key === tpKey;
                return {
                    key: tpKey,
                    title: (
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ flex: 1, marginRight: '8px' }}>
                          {isEditingTP ? (
                            <TextArea
                              defaultValue={editableNode.value}
                              onChange={(e) => setEditableNode({ ...editableNode, value: e.target.value })}
                              autoSize={{ minRows: 1, maxRows: 4 }}
                              onPressEnter={(e) => { e.preventDefault(); handleSave(); }}
                              autoFocus
                            />
                          ) : (
                            <Text>{tp.deskripsi_tujuan}</Text>
                          )}
                        </div>
                        <Space>
                          <Popover
                            placement="bottomRight"
                            title="Rencana Penilaian"
                            content={
                              <div style={{ minWidth: 300 }}>
                                <List
                                  size="small"
                                  dataSource={tp.penilaian_sumatif || []}
                                  renderItem={(item) => (
                                    <List.Item
                                      actions={[
                                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleOpenPenilaianModal(tp, item)} />,
                                        <Popconfirm title="Hapus penilaian ini?" onConfirm={() => handleDeletePenilaian(item.id)}>
                                          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                      ]}
                                    >
                                      <Space>
                                        <Tag color="blue">{item.kode_jenis_ujian}</Tag>
                                        <Text>{item.nama_penilaian}</Text>
                                        {item.tanggal_pelaksanaan && <Tag icon={<CalendarOutlined />}>{format(new Date(item.tanggal_pelaksanaan), 'dd MMM')}</Tag>}
                                      </Space>
                                    </List.Item>
                                  )}
                                />
                                <Button
                                  type="primary"
                                  icon={<PlusOutlined />}
                                  size="small"
                                  onClick={() => handleOpenPenilaianModal(tp, null)}
                                  style={{ marginTop: '8px', width: '100%' }}
                                >
                                  Tambah
                                </Button>
                              </div>
                            }
                            trigger="click"
                          >
                            <Badge count={(tp.penilaian_sumatif || []).length} size="small">
                              <Tooltip title="Kelola Penilaian">
                                <Button icon={<AuditOutlined />} size="small" type="text" />
                              </Tooltip>
                            </Badge>
                          </Popover>
                          {isEditingTP ? (
                            <>
                              <Button icon={<CheckOutlined />} onClick={handleSave} type="primary" size="small" />
                              <Button icon={<CloseOutlined />} onClick={() => setEditableNode(null)} size="small" />
                            </>
                          ) : (
                            <>
                              <Button icon={<EditOutlined />} onClick={() => setEditableNode({ key: tpKey, value: tp.deskripsi_tujuan })} size="small" type="text" />
                              <Popconfirm title="Hapus tujuan ini?" onConfirm={() => handleDelete(tpKey)}>
                                <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                              </Popconfirm>
                            </>
                          )}
                        </Space>
                      </div>
                    ),
                    isLeaf: true,
                }
            })
        };
    });
};
  
  if (loading) return <Spin />;

  return (
    <div>
      <Button icon={<PlusOutlined />} onClick={handleAddMateri} style={{ marginBottom: 16 }}>
        Tambah Materi
      </Button>
      {materiList.length > 0 ? (
        <Tree
          showLine
          draggable={{ icon: false }}
          blockNode
          onDrop={onDrop}
          treeData={generateTreeData()}
          defaultExpandAll
        />
      ) : (
        <Empty description="Belum ada materi untuk mata pelajaran ini." />
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
            <Select
              placeholder="Pilih jenis ujian"
              options={jenisUjianList.map(ju => ({
                value: ju.id,
                label: `${ju.nama_ujian} (${ju.kode_ujian})`
              }))}
            />
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