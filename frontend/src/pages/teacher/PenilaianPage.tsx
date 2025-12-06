// frontend/src/pages/teacher/PenilaianPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Card,
  Alert,
  Empty,
  Button,
  Radio,
  Cascader,
  Space,
  type RadioChangeEvent
} from 'antd';
import { 
  SaveOutlined, 
  TableOutlined, 
  AppstoreOutlined,
  BlockOutlined
} from '@ant-design/icons';

// API
import { getMyClasses } from '../../api/teachers';
import { getAllPengajarByKelas } from '../../api/rombel';

// Types & Components
import type { Kelas } from '../../types';
import PenilaianPanel, { type PenilaianPanelRef, type ViewMode } from '../../components/PenilaianPanel';

const { Title, Text } = Typography;

// --- PERBAIKAN 1: Menambahkan properti disabled ke Interface ---
interface Option {
  value: string;
  label: string;
  isLeaf?: boolean;
  children?: Option[];
  loading?: boolean;
  disabled?: boolean; // Menambahkan ini agar tidak error
}

const PenilaianPage = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [selectedPengajarId, setSelectedPengajarId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rata-rata');

  const panelRef = useRef<PenilaianPanelRef>(null);

  // 1. Load Kelas Awal untuk Level 1 Cascader
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesData = await getMyClasses();
        if (classesData) {
          const classOptions: Option[] = classesData.map((c: Kelas) => ({
            value: c.id,
            label: c.nama_kelas,
            isLeaf: false, // false berarti punya anak (mata pelajaran)
          }));
          setOptions(classOptions);
        }
      } catch (err) {
        setError('Gagal memuat daftar kelas.');
      }
    };
    fetchClasses();
  }, []);

  // 2. Fungsi Load Data Mapel saat Kelas di-expand
  const loadData = async (selectedOptions: Option[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    try {
      // Ambil data mapel berdasarkan kelas ID (targetOption.value)
      const pengajarData = await getAllPengajarByKelas(targetOption.value);
      
      targetOption.loading = false;
      
      if (pengajarData && pengajarData.length > 0) {
        targetOption.children = pengajarData.map(p => ({
          label: p.nama_mapel,
          value: p.id, // Ini adalah pengajarKelasId
          isLeaf: true,
        }));
      } else {
        targetOption.children = [{ label: 'Tidak ada mapel', value: 'none', disabled: true, isLeaf: true }];
      }
      
      // Update state options agar re-render
      setOptions([...options]);
    } catch (err) {
      targetOption.loading = false;
      targetOption.children = [];
      setOptions([...options]);
      setError('Gagal memuat mata pelajaran.');
    }
  };

  // --- PERBAIKAN 2: Menghapus parameter selectedOptions yang tidak dipakai ---
  const onChange = (value: (string | number)[]) => {
    if (value && value.length === 2) {
      setSelectedKelasId(value[0] as string);
      setSelectedPengajarId(value[1] as string);
    } else {
      setSelectedKelasId(null);
      setSelectedPengajarId(null);
    }
  };

  const triggerSave = () => {
    if (panelRef.current) {
      panelRef.current.handleSave();
    }
  };

  const handleViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value);
  };

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  // Styles Helpers (Compact & Clean)
  const toolbarStyle: React.CSSProperties = { 
    background: '#fafafa', 
    padding: '12px 16px', // Lebih pendek tingginya
    borderRadius: '8px', 
    border: '1px solid #f0f0f0', 
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  };

  return (
    <Card bodyStyle={{ padding: '20px 24px' }} bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ marginBottom: 0, marginTop: 0 }}>
             Penilaian Siswa
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Input nilai formatif dan sumatif siswa.</Text>
        </div>
        
        {selectedPengajarId && (
            <Button type="primary" icon={<SaveOutlined />} onClick={triggerSave} size="middle">
              Simpan
            </Button>
        )}
      </div>

      {/* Minimalist Horizontal Toolbar */}
      <div style={toolbarStyle}>
        <Space size="middle" wrap style={{ flex: 1 }}>
          
          {/* 1. Cascader Kelas & Mapel - LEBAR DIPERPANJANG */}
          <div style={{ minWidth: 350 }}> 
            <span style={{ fontSize: '12px', color: '#8c8c8c', marginRight: 8, fontWeight: 500 }}>
              <BlockOutlined /> Kelas & Mapel:
            </span>
            <Cascader
              options={options}
              loadData={loadData}
              onChange={onChange as any}
              changeOnSelect
              placeholder="Pilih Kelas lalu Mapel"
              style={{ width: 350 }} // Diperpanjang menjadi 350px
              size="middle"
              expandTrigger="hover"
            />
          </div>

          {/* 2. Mode Tampilan */}
          <div>
            <span style={{ fontSize: '12px', color: '#8c8c8c', marginRight: 8, fontWeight: 500 }}>
              Mode:
            </span>
            <Radio.Group 
                value={viewMode} 
                onChange={handleViewModeChange}
                buttonStyle="solid"
                disabled={!selectedPengajarId}
                size="middle"
            >
                <Radio.Button value="rata-rata"><TableOutlined /> Ringkas</Radio.Button>
                <Radio.Button value="detail"><AppstoreOutlined /> Detail</Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </div>

      {/* Main Content */}
      <div style={{ minHeight: 400 }}>
        {selectedKelasId && selectedPengajarId ? (
          <PenilaianPanel 
            ref={panelRef}
            kelasId={selectedKelasId} 
            pengajarKelasId={selectedPengajarId} 
            viewMode={viewMode}
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<span style={{ color: '#bfbfbf' }}>Pilih Kelas dan Mata Pelajaran pada menu di atas untuk memulai.</span>} 
            style={{ marginTop: 60 }} 
          />
        )}
      </div>
    </Card>
  );
};

export default PenilaianPage;