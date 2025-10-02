// frontend/src/pages/teacher/PenilaianPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Card,
  Spin,
  message,
  Button,
  Empty
} from 'antd';
import { HomeOutlined, BookOutlined, EditOutlined } from '@ant-design/icons';

// --- MENGGUNAKAN FUNGSI DAN TIPE YANG BENAR DARI FILE ANDA ---
import { getPenilaianLengkap, upsertNilaiBulk } from '../../api/penilaian';
import { useAuth } from '../../context/AuthContext';
import type { FullPenilaianData, RencanaPembelajaranItem, BulkUpsertNilaiInput } from '../../types';

const { Title, Text } = Typography;

const PenilaianPage = () => {
  const { kelasID, pengajarKelasID } = useParams<{ kelasID: string, pengajarKelasID: string }>();
  
  const [penilaianData, setPenilaianData] = useState<FullPenilaianData | null>(null);
  const [rencanaPembelajaran, setRencanaPembelajaran] = useState<RencanaPembelajaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (kelasID && pengajarKelasID) {
      const loadPenilaianData = async () => {
        setLoading(true);
        try {
          const response = await getPenilaianLengkap(kelasID, pengajarKelasID);
          setPenilaianData(response.penilaian);
          setRencanaPembelajaran(response.rencana);
        } catch (error) {
          message.error('Gagal memuat data penilaian lengkap untuk kelas ini.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadPenilaianData();
    }
  }, [kelasID, pengajarKelasID]);

  const handleSave = async () => {
    if (!penilaianData) {
        // --- PERBAIKAN DI SINI ---
        message.warning('Tidak ada data untuk disimpan.');
        return;
    }
    
    // Logika untuk mengumpulkan data nilai yang diubah (jika ada tabel input)
    // Untuk saat ini, kita simulasikan payload kosong karena UI input belum ada
    const payload: BulkUpsertNilaiInput = {
        nilai_formatif: [],
        nilai_sumatif: [],
    };

    message.loading({ content: 'Menyimpan data...', key: 'upsert' });
    try {
        await upsertNilaiBulk(payload);
        message.success({ content: 'Data berhasil disimpan!', key: 'upsert', duration: 2 });
    } catch (error) {
        message.error({ content: 'Gagal menyimpan data.', key: 'upsert', duration: 2 });
    }
  };
  
  return (
    <Spin spinning={loading}>
      <Title level={2}><EditOutlined /> Penilaian Siswa</Title>
      
      <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item><Link to="/teacher"><HomeOutlined /></Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/teacher/kelas-saya"><BookOutlined /><span> Kelas Saya</span></Link></Breadcrumb.Item>
          <Breadcrumb.Item>Penilaian</Breadcrumb.Item>
      </Breadcrumb>
      
      <Card>
        <Title level={4}>Data Penilaian Kelas</Title>
        <Text>Selamat datang, {user?.name}. Halaman ini akan menampilkan data penilaian siswa.</Text>
        
        {penilaianData && penilaianData.siswa.length > 0 ? (
            <div style={{marginTop: 20}}>
                <p>Berhasil memuat data untuk {penilaianData.siswa.length} siswa.</p>
                <p>Terdapat {rencanaPembelajaran.length} item rencana pembelajaran (materi/ujian).</p>
                {/* Di sini Anda bisa membangun tabel penilaian menggunakan data 'penilaianData' dan 'rencanaPembelajaran' */}
            </div>
        ) : (
            !loading && <Empty description="Belum ada data penilaian yang ditemukan untuk kelas ini." />
        )}
        
        <Button onClick={handleSave} type="primary" style={{marginTop: 24}}>
          Simpan Perubahan
        </Button>
      </Card>
    </Spin>
  );
};

export default PenilaianPage;