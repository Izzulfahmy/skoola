// file: frontend/src/components/AddAnggotaModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Select, Table, message, Alert, Spin } from 'antd';
import { getAllKelasByTahunAjaran } from '../api/rombel';
import { getStudentsByRombel } from '../api/students';
import type { Kelas, StudentSimple } from '../types';

interface AddAnggotaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (studentIds: string[]) => Promise<void>;
  existingAnggotaIds: string[];
  tahunAjaranId: string | null;
}

const AddAnggotaModal = ({ open, onClose, onAdd, existingAnggotaIds, tahunAjaranId }: AddAnggotaModalProps) => {
  const [rombels, setRombels] = useState<Kelas[]>([]);
  const [selectedRombelId, setSelectedRombelId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentSimple[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tahunAjaranId) {
      setSelectedRombelId(null);
      setStudents([]);
      setSelectedStudentIds([]);
      const fetchRombels = async () => {
        try {
          const data = await getAllKelasByTahunAjaran(tahunAjaranId);
          setRombels(data || []); // <-- PERBAIKAN DI SINI
        } catch (err) {
          setError('Gagal memuat daftar rombel.');
        }
      };
      fetchRombels();
    }
  }, [open, tahunAjaranId]);

  useEffect(() => {
    if (selectedRombelId) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const data = await getStudentsByRombel(selectedRombelId);
          const availableStudents = data.filter((s: StudentSimple) => !existingAnggotaIds.includes(s.id));
          setStudents(availableStudents);
        } catch (err) {
          setError('Gagal memuat daftar siswa.');
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
        setStudents([]);
    }
  }, [selectedRombelId, existingAnggotaIds]);

  const handleOk = async () => {
    if (selectedStudentIds.length === 0) {
      message.warning('Pilih minimal satu siswa.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(selectedStudentIds);
      onClose();
    } catch (err) {
      message.error('Gagal menambahkan anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedStudentIds(selectedRowKeys as string[]);
    },
  };

  return (
    <Modal
      title="Tambah Anggota Ekstrakurikuler"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      width={700}
      okText="Tambahkan"
      cancelText="Batal"
    >
      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
      <Select
        placeholder="Filter siswa berdasarkan rombel"
        style={{ width: '100%', marginBottom: 16 }}
        onChange={(value) => setSelectedRombelId(value)}
        value={selectedRombelId}
        options={(rombels || []).map(r => ({ value: r.id, label: r.nama_kelas }))} // <-- PERBAIKAN DI SINI
        showSearch
        optionFilterProp="label"
        disabled={!tahunAjaranId}
      />
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={students}
          rowSelection={{ type: 'checkbox', ...rowSelection }}
          columns={[
            { title: 'Nama Siswa', dataIndex: 'nama_lengkap' },
            { title: 'NISN', dataIndex: 'nisn' },
          ]}
          pagination={false}
          scroll={{ y: 240 }}
          size="small"
        />
      </Spin>
    </Modal>
  );
};

export default AddAnggotaModal;