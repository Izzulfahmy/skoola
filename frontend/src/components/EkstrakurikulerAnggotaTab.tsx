// file: frontend/src/components/EkstrakurikulerAnggotaTab.tsx
import { useState, useEffect } from 'react';
import { Button, Table, message, Popconfirm, Spin, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAnggotaBySesiId, addAnggotaToSesi, removeAnggota } from '../api/ekstrakurikuler';
import type { EkstrakurikulerSesi, EkstrakurikulerAnggota } from '../types';
import AddAnggotaModal from './AddAnggotaModal';

interface AnggotaTabProps {
  sesi: EkstrakurikulerSesi;
  tahunAjaranId: string | null;
  onAnggotaUpdate: () => void;
}

const EkstrakurikulerAnggotaTab = ({ sesi, tahunAjaranId, onAnggotaUpdate }: AnggotaTabProps) => {
  const [anggota, setAnggota] = useState<EkstrakurikulerAnggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchAnggota = async () => {
    if (!sesi?.id) return;
    setLoading(true);
    try {
      const data = await getAnggotaBySesiId(sesi.id);
      setAnggota(data || []); // Pastikan data selalu array
    } catch (err) {
      message.error('Gagal memuat daftar anggota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnggota();
  }, [sesi.id]);

  const handleAddAnggota = async (studentIds: string[]) => {
    try {
      await addAnggotaToSesi(sesi.id, { student_ids: studentIds });
      message.success(`${studentIds.length} anggota berhasil ditambahkan!`);
      fetchAnggota();
      onAnggotaUpdate();
    } catch (err) {
      throw err;
    }
  };

  const handleRemoveAnggota = async (anggotaId: number) => {
    try {
      await removeAnggota(anggotaId);
      message.success('Anggota berhasil dihapus.');
      fetchAnggota();
      onAnggotaUpdate();
    } catch (err) {
      message.error('Gagal menghapus anggota.');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Tambah Anggota
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={anggota}
          columns={[
            { title: 'NISN', dataIndex: ['student_details', 'nisn'] },
            { title: 'Nama Siswa', dataIndex: ['student_details', 'nama_lengkap'] },
            {
              title: 'Aksi',
              key: 'action',
              render: (_, record) => (
                <Popconfirm
                  title="Hapus Anggota"
                  description="Yakin ingin menghapus siswa ini dari keanggotaan?"
                  onConfirm={() => handleRemoveAnggota(record.id)}
                >
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              )
            }
          ]}
          pagination={false}
          locale={{ emptyText: <Empty description="Belum ada anggota" /> }}
          size="small"
        />
      </Spin>
      <AddAnggotaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAnggota}
        existingAnggotaIds={anggota.map(a => a.student_id)}
        tahunAjaranId={tahunAjaranId}
      />
    </div>
  );
};

export default EkstrakurikulerAnggotaTab;