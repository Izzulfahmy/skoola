// file: src/pages/teacher/PenilaianPage.tsx
import { useEffect, useState, useRef } from 'react';
import { Card, Typography, Select, Empty, Alert, Space, Button, Radio } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getMyClasses } from '../../api/teachers';
import { getAllPengajarByKelas } from '../../api/rombel';
import type { Kelas, PengajarKelas } from '../../types';
import PenilaianPanel from '../../components/PenilaianPanel';

const { Title, Text } = Typography;
const { Option } = Select;

export type ViewMode = 'rata-rata' | 'detail';

export interface PenilaianPanelRef {
  handleSave: () => void;
}

const PenilaianPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [myClasses, setMyClasses] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [pengajarList, setPengajarList] = useState<PengajarKelas[]>([]);
  const [selectedPengajarId, setSelectedPengajarId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rata-rata');

  const penilaianPanelRef = useRef<PenilaianPanelRef>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const classesData = await getMyClasses();
        setMyClasses(classesData || []);
      } catch (err) {
        setError('Gagal memuat daftar kelas Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelasId) {
      const fetchPengajar = async () => {
        setLoading(true);
        setSelectedPengajarId(null);
        try {
          const pengajarData = await getAllPengajarByKelas(selectedKelasId);
          setPengajarList(pengajarData || []);
        } catch (err) {
          setError('Gagal memuat daftar mata pelajaran di kelas ini.');
        } finally {
          setLoading(false);
        }
      };
      fetchPengajar();
    } else {
      setPengajarList([]);
    }
  }, [selectedKelasId]);

  const triggerSave = async () => {
    if (penilaianPanelRef.current) {
      setIsSaving(true);
      await penilaianPanelRef.current.handleSave();
      setIsSaving(false);
    }
  };

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={2}>Penilaian Siswa</Title>
      <Text type="secondary">Pilih kelas dan mata pelajaran untuk mengelola penilaian siswa.</Text>
      
      <Card style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space wrap align="center">
            <Text strong>Pilih Kelas:</Text>
            <Select
              style={{ width: 250 }}
              placeholder="Pilih kelas yang Anda ajar"
              onChange={(value) => setSelectedKelasId(value)}
              loading={loading && myClasses.length === 0}
            >
              {myClasses.map(kelas => (
                <Option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</Option>
              ))}
            </Select>

            <Text strong style={{ marginLeft: 16 }}>Pilih Mata Pelajaran:</Text>
            <Select
              style={{ width: 250 }}
              placeholder="Pilih mata pelajaran"
              onChange={(value) => setSelectedPengajarId(value)}
              disabled={!selectedKelasId || pengajarList.length === 0}
              value={selectedPengajarId}
              loading={loading && selectedKelasId !== null}
            >
              {pengajarList.map(p => (
                <Option key={p.id} value={p.id}>{p.nama_mapel}</Option>
              ))}
            </Select>
          </Space>
          
          <Space>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
              disabled={!selectedPengajarId}
            >
              <Radio.Button value="rata-rata">Rata-rata TP</Radio.Button>
              <Radio.Button value="detail">Semua Penilaian</Radio.Button>
            </Radio.Group>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={triggerSave}
              loading={isSaving}
              disabled={!selectedPengajarId}
            >
              Simpan Perubahan
            </Button>
          </Space>
        </div>
      </Card>

      <div style={{ marginTop: 24 }}>
        {selectedPengajarId && selectedKelasId ? (
          <PenilaianPanel
            ref={penilaianPanelRef}
            key={`${selectedPengajarId}-${viewMode}`}
            pengajarKelasId={selectedPengajarId}
            kelasId={selectedKelasId}
            viewMode={viewMode}
          />
        ) : (
          <Empty description="Pilih kelas dan mata pelajaran untuk memulai." style={{ paddingTop: 60, paddingBottom: 60 }} />
        )}
      </div>
    </Card>
  );
};

export default PenilaianPage;