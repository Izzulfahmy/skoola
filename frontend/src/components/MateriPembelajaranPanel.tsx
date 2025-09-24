// file: frontend/src/components/MateriPembelajaranPanel.tsx
import { useState, useEffect } from 'react';
import { Tree, Button, message, Spin, Empty, Input, Popconfirm, Space } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
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
import type { MateriPembelajaran, TujuanPembelajaran } from '../types';
import type { Key } from 'react';

const { TextArea } = Input;

interface MateriPembelajaranPanelProps {
  pengajarKelasId: string;
}

type EditableNode = {
    key: string;
    value: string;
};

// Fungsi bantuan untuk mem-parsing key
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
  const [loading, setLoading] = useState(true);
  const [editableNode, setEditableNode] = useState<EditableNode | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllMateriByPengajarKelas(pengajarKelasId);
      setMateriList(data || []);
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
                                    <span>{tp.deskripsi_tujuan}</span>
                                )}
                           </div>
                           {isEditingTP ? (
                                <Space>
                                    <Button icon={<CheckOutlined />} onClick={handleSave} type="primary" size="small" />
                                    <Button icon={<CloseOutlined />} onClick={() => setEditableNode(null)} size="small" />
                                </Space>
                            ) : (
                                <Space>
                                    <Button icon={<EditOutlined />} onClick={() => setEditableNode({ key: tpKey, value: tp.deskripsi_tujuan })} size="small" type="text" />
                                    <Popconfirm title="Hapus tujuan ini?" onConfirm={() => handleDelete(tpKey)}>
                                        <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                                    </Popconfirm>
                                </Space>
                            )}
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
          showLine // <-- PERUBAHAN DI SINI
          draggable={{ icon: false }}
          blockNode
          onDrop={onDrop}
          treeData={generateTreeData()}
          defaultExpandAll
        />
      ) : (
        <Empty description="Belum ada materi untuk mata pelajaran ini." />
      )}
    </div>
  );
};

export default MateriPembelajaranPanel;