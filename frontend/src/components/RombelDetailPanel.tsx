// file: frontend/src/components/RombelDetailPanel.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Tabs,
  Typography,
  Descriptions,
  Tag,
  Table,
  Button,
  Modal,
  Transfer,
  Form,
  Select,
  Popconfirm,
  message,
  Space,
  Badge,
  Empty,
  Radio, // <-- Impor Radio
} from 'antd';
import type { TableColumnsType, TransferProps } from 'antd';
import { PlusOutlined, UsergroupAddOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type {
  Kelas,
  AnggotaKelas,
  PengajarKelas,
  Student,
  Teacher,
  MataPelajaran,
  UpsertPengajarKelasInput,
} from '../types';
import {
  getAllAnggotaByKelas,
  addAnggotaKelas,
  removeAnggotaKelas,
  getAllPengajarByKelas,
  createPengajarKelas,
  removePengajarKelas,
  updateUrutanAnggota,
} from '../api/rombel';
import { getAvailableStudents } from '../api/students';
import { getTaughtMataPelajaran } from '../api/mataPelajaran';
import MateriPembelajaranPanel from './MateriPembelajaranPanel';
import PenilaianPanel from './PenilaianPanel';
// --- BARIS LAMA BERMASALAH (Dihapus/Diganti): 
// import type { PenilaianPanelRef, ViewMode } from './PenilaianPanel'; 
// ---

const { Text, Title } = Typography;
const { Option } = Select;

// --- DEFINISI ULANG TIPE DI SINI ---
// Asumsi PenilaianPanel memiliki method handleSave()
interface PenilaianPanelRef {
  handleSave: () => Promise<void>;
}

// Asumsi ViewMode adalah tipe union dari string literal
type ViewMode = 'rata-rata' | 'detail';
// ------------------------------------

interface RombelDetailPanelProps {
  rombel: Kelas;
  teachers: Teacher[];
  onUpdate: () => void;
  onBack?: () => void;
}

const type = 'DraggableBodyRow';

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableRow: React.FC<DraggableRowProps> = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};


const RombelDetailPanel = ({ rombel, teachers, onUpdate, onBack }: RombelDetailPanelProps) => {
  const [anggota, setAnggota] = useState<AnggotaKelas[]>([]);
  const [pengajar, setPengajar] = useState<PengajarKelas[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  const [isGuruModalOpen, setIsGuruModalOpen] = useState(false);
  const [allMapel, setAllMapel] = useState<MataPelajaran[]>([]);
  const [form] = Form.useForm();
  
  // --- STATE UNTUK KONTROL PENILAIAN ---
  const [activePenilaianTab, setActivePenilaianTab] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rata-rata');
  const [isSaving, setIsSaving] = useState(false);
  const penilaianPanelRef = useRef<PenilaianPanelRef>(null);
  // ------------------------------------------

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anggotaData, pengajarData] = await Promise.all([
        getAllAnggotaByKelas(rombel.id),
        getAllPengajarByKelas(rombel.id),
      ]);
      setAnggota(anggotaData || []);
      const pengajarList = pengajarData || [];
      setPengajar(pengajarList);
      
      // Set tab penilaian aktif pertama jika belum ada
      if(pengajarList.length > 0 && !activePenilaianTab) {
        setActivePenilaianTab(pengajarList[0].id);
      } else if (pengajarList.length === 0) {
        setActivePenilaianTab(null);
      }

    } catch (error) {
      message.error('Gagal memuat detail rombel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rombel]);

  // --- FUNGSI UNTUK MENYIMPAN NILAI ---
  const triggerSave = async () => {
    if (penilaianPanelRef.current) {
      setIsSaving(true);
      await penilaianPanelRef.current.handleSave();
      setIsSaving(false);
    }
  };
  // ----------------------------------------

  const handleShowSiswaModal = async () => {
    try {
      const studentsData = await getAvailableStudents(rombel.tahun_ajaran_id);
      setAvailableStudents(studentsData || []);
      setTargetKeys([]);
      setIsSiswaModalOpen(true);
    } catch {
      message.error("Gagal memuat daftar siswa yang tersedia.");
    }
  };

  const handleAddSiswa = async () => {
    if (targetKeys.length === 0) {
      message.warning('Pilih minimal satu siswa.');
      return;
    }
    try {
      await addAnggotaKelas(rombel.id, { student_ids: targetKeys });
      message.success(`${targetKeys.length} siswa berhasil ditambahkan.`);
      setIsSiswaModalOpen(false);
      fetchData();
      onUpdate();
    } catch (error) {
      message.error('Gagal menambahkan siswa.');
    }
  };
  const handleRemoveSiswa = async (anggotaId: string) => {
    try {
      await removeAnggotaKelas(anggotaId);
      message.success('Siswa berhasil dihapus dari rombel.');
      fetchData();
      onUpdate();
    } catch (error) {
      message.error('Gagal menghapus siswa.');
    }
  };
  
  const moveRow = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const dragRow = anggota[dragIndex];
      const newAnggota = [...anggota];
      newAnggota.splice(dragIndex, 1);
      newAnggota.splice(hoverIndex, 0, dragRow);
      setAnggota(newAnggota);

      const orderedIds = newAnggota.map(a => a.id);
      try {
        await updateUrutanAnggota(orderedIds);
        message.success('Urutan absen berhasil disimpan!');
        fetchData(); 
      } catch (error) {
        message.error('Gagal menyimpan urutan absen.');
        setAnggota(anggota); 
      }
    },
    [anggota, fetchData],
  );

  const anggotaColumns: TableColumnsType<AnggotaKelas> = [
    { title: 'No', dataIndex: 'urutan', key: 'urutan', align: 'center', width: 80, render: (text) => text || '-' },
    { title: 'NIS', dataIndex: 'nis', key: 'nis', render: (text) => text || '-' },
    { title: 'Nama Lengkap', dataIndex: 'nama_lengkap', key: 'nama_lengkap' },
    { title: 'L/P', dataIndex: 'jenis_kelamin', key: 'jenis_kelamin', render: (text) => text?.charAt(0) || '-' },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Hapus siswa dari rombel?"
          onConfirm={() => handleRemoveSiswa(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];
  const handleTransferChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys.map(key => String(key)));
  };
  const handleShowGuruModal = async () => {
    try {
        const mapelData = await getTaughtMataPelajaran();
        setAllMapel(mapelData || []);
        setIsGuruModalOpen(true);
    } catch {
        message.error("Gagal memuat daftar mata pelajaran.");
    }
  };
  const handleTugaskanGuru = async (values: UpsertPengajarKelasInput) => {
    try {
        await createPengajarKelas(rombel.id, values);
        message.success("Guru berhasil ditugaskan.");
        setIsGuruModalOpen(false);
        form.resetFields();
        fetchData();
    } catch (error) {
        message.error("Gagal menugaskan guru. Mungkin sudah ada.");
    }
  };
  const handleRemovePengajar = async (pengajarId: string) => {
    try {
        await removePengajarKelas(pengajarId);
        message.success("Tugas guru berhasil dihapus.");
        fetchData();
    } catch (error) {
        message.error("Gagal menghapus tugas guru.");
    }
  };
  
  const pengajarColumns: TableColumnsType<PengajarKelas> = [
    { title: 'Mata Pelajaran', dataIndex: 'nama_mapel', key: 'nama_mapel' },
    { title: 'Nama Guru', dataIndex: 'nama_guru', key: 'nama_guru' },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Hapus tugas guru ini?"
          onConfirm={() => handleRemovePengajar(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const pembelajaranTabs = pengajar.map(p => ({
    key: p.id,
    label: p.kode_mapel,
    children: <MateriPembelajaranPanel pengajarKelasId={p.id} />,
  }));

  // --- KONTEN TAB PENILAIAN YANG DIPERBARUI ---
  const penilaianContent = (
    <div>
        <Space style={{ marginBottom: 16 }} wrap>
            <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} buttonStyle="solid">
                <Radio.Button value="rata-rata">Rata-rata TP</Radio.Button>
                <Radio.Button value="detail">Semua Penilaian</Radio.Button>
            </Radio.Group>
            <Button type="primary" icon={<SaveOutlined />} onClick={triggerSave} loading={isSaving}>
                Simpan Nilai
            </Button>
        </Space>

        {activePenilaianTab ? (
            <PenilaianPanel
                ref={penilaianPanelRef}
                key={`${activePenilaianTab}-${viewMode}`}
                pengajarKelasId={activePenilaianTab}
                kelasId={rombel.id}
                viewMode={viewMode}
            />
        ) : <Empty />}
    </div>
  );
  
  const penilaianTabs = pengajar.map(p => ({
    key: p.id,
    label: p.kode_mapel,
    children: penilaianContent, // Kontennya sekarang sama untuk semua
  }));
  // ------------------------------------------

  const mainTabItems = [
    {
      key: '1',
      label: 'Detail Rombel',
      children: (
        <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="Nama Rombel">{rombel.nama_kelas}</Descriptions.Item>
          <Descriptions.Item label="Wali Kelas">{rombel.nama_wali_kelas || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tingkatan">{rombel.nama_tingkatan}</Descriptions.Item>
          <Descriptions.Item label="Jumlah Siswa">
            <Tag color="blue">{anggota.length} Siswa</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tahun Ajaran">{`${rombel.nama_tahun_ajaran || ''} - ${rombel.semester || ''}`}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          Anggota Kelas
          <Badge count={anggota.length} color="green" />
        </Space>
      ),
      children: (
        <>
          <Button icon={<UsergroupAddOutlined />} onClick={handleShowSiswaModal} style={{ marginBottom: 16 }}>
            Tambah Siswa
          </Button>
          <DndProvider backend={HTML5Backend}>
            <Table
                columns={anggotaColumns}
                dataSource={anggota}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
                components={{
                    body: {
                        row: DraggableRow,
                    },
                }}
                onRow={(_, index) => ({
                    index: index!,
                    moveRow,
                } as any)}
            />
          </DndProvider>
        </>
      ),
    },
    {
      key: '3',
      label: (
        <Space>
          Guru Pengajar
          <Badge count={pengajar.length} color="purple" />
        </Space>
      ),
      children: (
        <>
          <Button icon={<PlusOutlined />} onClick={handleShowGuruModal} style={{ marginBottom: 16 }}>
            Tugaskan Guru
          </Button>
          <Table
            columns={pengajarColumns}
            dataSource={pengajar}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
          />
        </>
      ),
    },
    {
        key: '4',
        label: "Materi Pembelajaran",
        children: pengajar.length > 0 ? (
            <Tabs 
                tabPosition="top"
                items={pembelajaranTabs}
            />
        ) : (
            <Empty description="Belum ada guru pengajar yang ditugaskan di kelas ini." style={{marginTop: 32}}/>
        ),
    },
    {
        key: '5',
        label: "Penilaian",
        children: pengajar.length > 0 ? (
            <Tabs 
                tabPosition="top"
                items={penilaianTabs}
                activeKey={activePenilaianTab ?? undefined}
                onChange={setActivePenilaianTab}
            />
        ) : (
            <Empty description="Tugaskan guru pengajar terlebih dahulu untuk memulai penilaian." style={{marginTop: 32}}/>
        ),
    }
  ];

  return (
    <>
      {onBack && (
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack} 
          style={{ marginBottom: 16 }}
        >
          Kembali ke Daftar Rombel
        </Button>
      )}
      <Title level={4} style={{ margin: 0 }}>
        {rombel.nama_kelas}
      </Title>
      <Text type="secondary">{rombel.nama_tingkatan}</Text>
      
      <Tabs defaultActiveKey="1" items={mainTabItems} style={{ marginTop: 16 }} />

      <Modal
        title="Tambah Siswa ke Rombel"
        open={isSiswaModalOpen}
        onCancel={() => setIsSiswaModalOpen(false)}
        onOk={handleAddSiswa}
        width={720}
        okText="Tambahkan"
        cancelText="Batal"
      >
        <Transfer
            dataSource={availableStudents.map(s => ({
                key: s.id,
                title: `${s.nama_lengkap} (${s.nis || 'No NIS'})`,
                description: s.nama_panggilan
            }))}
            targetKeys={targetKeys}
            onChange={handleTransferChange}
            render={item => item.title}
            listStyle={{ width: 300, height: 300 }}
            showSearch
            filterOption={(inputValue, option) => 
                option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
            }
        />
      </Modal>

      <Modal
        title="Tugaskan Guru Pengajar"
        open={isGuruModalOpen}
        onCancel={() => setIsGuruModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleTugaskanGuru} style={{ marginTop: 24 }}>
          <Form.Item name="mata_pelajaran_id" label="Mata Pelajaran" rules={[{ required: true }]}>
            <Select showSearch placeholder="Pilih mata pelajaran" optionFilterProp='children'>
              {allMapel.map(m => <Option key={m.id} value={m.id}>{m.nama_mapel}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="teacher_id" label="Guru" rules={[{ required: true }]}>
            <Select showSearch placeholder="Pilih guru" optionFilterProp='children'>
              {teachers.map(t => <Option key={t.id} value={t.id}>{t.nama_lengkap}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsGuruModalOpen(false)} style={{ marginRight: 8 }}>Batal</Button>
            <Button type="primary" htmlType="submit">Simpan</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RombelDetailPanel;