// frontend/src/pages/teacher/PenilaianPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Card,
  Select,
  Row,
  Col,
  Alert,
  Empty,
  Button,
  Radio, // <--- Import Radio ditambahkan
  type RadioChangeEvent // <--- Import tipe event jika menggunakan TypeScript ketat
} from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';

// API
import { getMyClasses } from '../../api/teachers';
import { getAllPengajarByKelas } from '../../api/rombel';

// Types & Components
import type { Kelas, PengajarKelas } from '../../types';
import PenilaianPanel, { type PenilaianPanelRef, type ViewMode } from '../../components/PenilaianPanel';

const { Title, Text } = Typography;
const { Option } = Select;

const PenilaianPage = () => {
  // State untuk Dropdown
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  
  const [pengajarList, setPengajarList] = useState<PengajarKelas[]>([]);
  const [selectedPengajarId, setSelectedPengajarId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rata-rata');

  // Ref untuk memanggil fungsi save di dalam PenilaianPanel
  const panelRef = useRef<PenilaianPanelRef>(null);

  // 1. Ambil Data Kelas saat component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesData = await getMyClasses();
        setMyClasses(classesData || []);
      } catch (err) {
        setError('Gagal memuat daftar kelas Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // 2. Ambil Data Mapel saat Kelas dipilih
  useEffect(() => {
    if (selectedKelasId) {
      const fetchPengajar = async () => {
        setLoading(true);
        setSelectedPengajarId(null); // Reset pilihan mapel
        try {
          const pengajarData = await getAllPengajarByKelas(selectedKelasId);
          setPengajarList(pengajarData || []);
        } catch (err) {
          setError('Gagal memuat daftar mata pelajaran.');
        } finally {
          setLoading(false);
        }
      };
      fetchPengajar();
    } else {
      setPengajarList([]);
      setSelectedPengajarId(null);
    }
  }, [selectedKelasId]);

  // Fungsi Wrapper untuk tombol Save di luar panel
  const triggerSave = () => {
    if (panelRef.current) {
      panelRef.current.handleSave();
    }
  };

  // Handler untuk perubahan mode tampilan
  const handleViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value);
  };

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }
  
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}><EditOutlined /> Penilaian Siswa</Title>
          <Text type="secondary">Pilih kelas dan mata pelajaran untuk melakukan penilaian.</Text>
        </div>
        
        {/* Tombol Simpan hanya muncul jika Mapel sudah dipilih */}
        {selectedPengajarId && (
            <Button type="primary" icon={<SaveOutlined />} onClick={triggerSave}>
              Simpan Perubahan
            </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="middle">
        <Col xs={24} md={8}>
          <Text strong>1. Pilih Kelas</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            placeholder="Pilih Kelas"
            onChange={(val) => setSelectedKelasId(val)}
            loading={loading}
          >
            {myClasses.map((c) => (
              <Option key={c.id} value={c.id}>{c.nama_kelas}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={8}>
          <Text strong>2. Pilih Mata Pelajaran</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            placeholder="Pilih Mapel"
            onChange={(val) => setSelectedPengajarId(val)}
            value={selectedPengajarId}
            disabled={!selectedKelasId}
          >
            {pengajarList.map((p) => (
              <Option key={p.id} value={p.id}>{p.nama_mapel}</Option>
            ))}
          </Select>
        </Col>

        {/* --- BAGIAN INI YANG DIUBAH MENJADI RADIO BUTTON --- */}
        <Col xs={24} md={8}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>3. Mode Tampilan</Text>
            <Radio.Group 
                value={viewMode} 
                onChange={handleViewModeChange}
                buttonStyle="solid"
                disabled={!selectedPengajarId}
            >
                <Radio.Button value="rata-rata">Ringkasan</Radio.Button>
                <Radio.Button value="detail">Detail</Radio.Button>
            </Radio.Group>
        </Col>
        {/* --------------------------------------------------- */}
      </Row>

      {/* Render Panel Penilaian jika semua sudah dipilih */}
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
            description="Silakan pilih Kelas dan Mata Pelajaran terlebih dahulu." 
            style={{ marginTop: 60 }} 
          />
        )}
      </div>
    </Card>
  );
};

export default PenilaianPage;