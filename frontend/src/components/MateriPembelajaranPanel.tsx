// file: frontend/src/components/MateriPembelajaranPanel.tsx
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
            onPressEnter={(e) => {
              e.preventDefault();
              handleSave();
            }}
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

  const fetchData = async () => {
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
  
  const handleSave = async (newValue: string) => {
    if (!editingKey) return;
    const { type, id, parentId } = parseKey(editingKey);

    try {
        if (type === 'materi') {
            await updateMateri(id as number, { nama_materi: newValue, pengajar_kelas_id: pengajarKelasId });
        } else if (type === 'ujian') {
            await updateUjian(id as number, { nama_ujian: newValue, pengajar_kelas_id: pengajarKelasId });
        } else if (type === 'tp') {
            const tp = rencanaList.flatMap(m => m.tujuan_pembelajaran || []).find(t => t.id === id);
            if (tp && parentId) {
                await updateTujuan(id as number, { ...tp, deskripsi_tujuan: newValue, materi_pembelajaran_id: parentId });
            }
        }
        message.success("Perubahan berhasil disimpan.");
        setEditingKey(null);
        fetchData();
    } catch (error) {
        message.error("Gagal menyimpan perubahan.");
    }
  };

  const handleDelete = async (key: string) => {
    const { type, id } = parseKey(key);
    try {
      if (type === 'materi') {
        await deleteMateri(id as number);
      } else if (type === 'ujian') {
        await deleteUjian(id as number);
      } else if (type === 'tp') {
        await deleteTujuan(id as number);
      } else if (type === 'penilaian') {
        await deletePenilaian(String(id));
      }
      message.success("Data berhasil dihapus.");
      fetchData();
    } catch (error) {
      message.error("Gagal menghapus data.");
    }
  };
  
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

  const handleFinishPenilaian = async (values: any) => {
    if (!currentItem) return;

    const payload: UpsertPenilaianSumatifInput = {
      ...values,
      tanggal_pelaksanaan: values.tanggal_pelaksanaan ? values.tanggal_pelaksanaan.format('YYYY-MM-DD') : undefined,
    };
    
    if ('deskripsi_tujuan' in currentItem) { // Cek apakah ini TujuanPembelajaran
        payload.tujuan_pembelajaran_id = currentItem.id;
    } else { // Ini adalah Ujian
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
  };

  const onDrop: TreeProps['onDrop'] = () => {
    message.warning("Drag and drop antar tipe item yang berbeda belum didukung.");
    return;
    // Logika drag and drop yang lebih kompleks bisa ditambahkan di sini nanti.
  };

  const generateTreeData = useCallback((): TreeDataNode[] => {
    return rencanaList.map(item => {
        if (item.type === 'ujian') {
            const key = `ujian_${item.id}`;
            return {
                key: key,
                icon: <FileTextOutlined />,
                title: editingKey === key ? (
                    <EditableTitle 
                        initialValue={item.nama} 
                        onSave={handleSave} 
                        onCancel={() => setEditingKey(null)}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontWeight: 'bold', flex: 1, marginRight: '8px' }}>{item.nama}</span>
                        <Space>
                            <Tooltip title="Tambah Rincian Ujian">
                                <Button icon={<AuditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(item as Ujian, null)}/>
                            </Tooltip>
                            <Button icon={<EditOutlined />} onClick={() => setEditingKey(key)} size="small" type="text" />
                            <Popconfirm title="Hapus ujian ini?" onConfirm={() => handleDelete(key)}>
                                <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                            </Popconfirm>
                        </Space>
                    </div>
                ),
                // --- PERBAIKAN DI SINI ---
                children: (item.penilaian_sumatif || []).map(penilaian => {
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
                          <Popconfirm title="Hapus rincian ini?" onConfirm={() => handleDelete(penilaianKey)}>
                              <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                          </Popconfirm>
                        </Space>
                      </div>
                    ),
                    isLeaf: true
                  }
                })
            };
        }

        // Jika item.type === 'materi'
        const key = `materi_${item.id}`;
        return {
            key: key,
            title: editingKey === key ? (
              <EditableTitle 
                initialValue={item.nama} 
                onSave={handleSave} 
                onCancel={() => setEditingKey(null)}
              />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontWeight: 'bold', flex: 1, marginRight: '8px' }}>{item.nama}</span>
                    <Space>
                        <Button icon={<PlusOutlined />} onClick={() => handleAddTujuan(item.id)} size="small" type="text" />
                        <Button icon={<EditOutlined />} onClick={() => setEditingKey(key)} size="small" type="text" />
                        <Popconfirm title="Hapus materi & semua tujuannya?" onConfirm={() => handleDelete(key)}>
                            <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                        </Popconfirm>
                    </Space>
                </div>
            ),
            children: (item.tujuan_pembelajaran || []).map(tp => {
                const tpKey = `tp_${tp.id}_${item.id}`;
                return {
                    key: tpKey,
                    title: editingKey === tpKey ? (
                        <EditableTitle 
                            initialValue={tp.deskripsi_tujuan}
                            isTextArea
                            onSave={handleSave}
                            onCancel={() => setEditingKey(null)}
                        />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Text style={{ flex: 1, marginRight: '8px' }}>{tp.deskripsi_tujuan}</Text>
                        <Space>
                          <Tooltip title="Tambah Penilaian">
                            <Button icon={<AuditOutlined />} size="small" type="text" onClick={() => handleOpenPenilaianModal(tp, null)}/>
                          </Tooltip>
                          <Button icon={<EditOutlined />} onClick={() => setEditingKey(tpKey)} size="small" type="text" />
                          <Popconfirm title="Hapus tujuan ini?" onConfirm={() => handleDelete(tpKey)}>
                            <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                          </Popconfirm>
                        </Space>
                      </div>
                    ),
                    children: (tp.penilaian_sumatif || []).map(penilaian => {
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
                              <Popconfirm title="Hapus penilaian ini?" onConfirm={() => handleDelete(penilaianKey)}>
                                  <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                              </Popconfirm>
                            </Space>
                          </div>
                        ),
                        isLeaf: true
                      }
                    })
                }
            })
        };
    });
  }, [rencanaList, editingKey]);
  
  if (loading) return <Spin />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PlusOutlined />} onClick={handleAddMateri}>
          Tambah Materi
        </Button>
        <Button icon={<PlusOutlined />} onClick={handleAddUjian}>
          Tambah Ujian
        </Button>
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