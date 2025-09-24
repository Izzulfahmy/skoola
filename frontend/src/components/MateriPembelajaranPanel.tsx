// file: frontend/src/components/MateriPembelajaranPanel.tsx
import { useState, useEffect } from 'react';
import { Tree, Button, message, Spin, Empty, Input, Popconfirm, Space } from 'antd';
import type { TreeDataNode } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  getAllMateriByPengajarKelas,
  createMateri,
  updateMateri,
  deleteMateri,
  createTujuan,
  updateTujuan,
  deleteTujuan,
} from '../api/pembelajaran';
import type { MateriPembelajaran, TujuanPembelajaran } from '../types';

const { TextArea } = Input;

interface MateriPembelajaranPanelProps {
  pengajarKelasId: string;
}

type EditableNode = {
    key: string;
    value: string;
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
    const [type, idStr] = key.split('-');
    const id = parseInt(idStr, 10);

    try {
        if (type === 'materi') {
            const materi = materiList.find(m => m.id === id);
            if (materi) {
                await updateMateri(id, { ...materi, nama_materi: value, pengajar_kelas_id: materi.pengajar_kelas_id, deskripsi: materi.deskripsi || undefined, urutan: materi.urutan });
            }
        } else if (type === 'tp') {
            let tp: TujuanPembelajaran | undefined;
            let materiId: number | undefined;
            for (const m of materiList) {
                tp = m.tujuan_pembelajaran.find(t => t.id === id);
                if (tp) {
                    materiId = m.id;
                    break;
                }
            }
            if (tp && materiId) {
                await updateTujuan(id, { ...tp, deskripsi_tujuan: value, materi_pembelajaran_id: materiId, urutan: tp.urutan });
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
    const [type, idStr] = key.split('-');
    const id = parseInt(idStr, 10);
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
                            <Popconfirm title="Yakin ingin menghapus materi ini beserta semua tujuannya?" onConfirm={() => handleDelete(key)}>
                                <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                            </Popconfirm>
                        </Space>
                    )}
                </div>
            ),
            children: materi.tujuan_pembelajaran.map(tp => {
                const tpKey = `tp-${tp.id}`;
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
                                    <Popconfirm title="Yakin ingin menghapus tujuan ini?" onConfirm={() => handleDelete(tpKey)}>
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
          treeData={generateTreeData()}
          blockNode
          defaultExpandAll
        />
      ) : (
        <Empty description="Belum ada materi untuk mata pelajaran ini." />
      )}
    </div>
  );
};

export default MateriPembelajaranPanel;