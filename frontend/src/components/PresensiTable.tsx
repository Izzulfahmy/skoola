// file: frontend/src/components/PresensiTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, message, Spin, Empty, Tag, Tooltip, Typography, Popover, Radio, Input, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import { CommentOutlined, DeleteOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { getPresensiBulanan, upsertPresensi, deletePresensi } from '../api/presensi';
import type { PresensiSiswa, UpsertPresensiInput, PresensiData } from '../types';
import dayjs from 'dayjs';

interface PresensiTableProps {
  kelasId: string;
  year: number;
  month: number;
}

const { Text } = Typography;
const { TextArea } = Input;

type StatusPresensi = 'H' | 'S' | 'I' | 'A';

// Komponen kontrol di dalam Popover
const PresensiInputControl: React.FC<{
  value: Omit<PresensiData, 'anggota_kelas_id'>;
  onSave: (newValue: Omit<PresensiData, 'anggota_kelas_id'>) => void;
  onDelete: () => void;
}> = ({ value, onSave, onDelete }) => {
  const [status, setStatus] = useState<StatusPresensi | null>(value.status || null);
  const [catatan, setCatatan] = useState(value.catatan || '');

  const handleStatusChange = (newStatus: StatusPresensi) => {
    setStatus(newStatus);
    if (newStatus === 'H') {
      setCatatan('');
    }
  };

  const showCatatan = status === 'S' || status === 'I' || status === 'A';

  const handleSaveClick = () => {
    if (!status) {
      message.warning('Pilih salah satu status presensi.');
      return;
    }
    onSave({
      status,
      catatan: catatan.trim() || undefined,
    });
  };

  return (
    <div style={{ width: 220 }}>
      <Radio.Group value={status} onChange={(e) => handleStatusChange(e.target.value)} size="small">
        <Radio.Button value="H">Hadir</Radio.Button>
        <Radio.Button value="S">Sakit</Radio.Button>
        <Radio.Button value="I">Izin</Radio.Button>
        <Radio.Button value="A">Alfa</Radio.Button>
      </Radio.Group>
      {showCatatan && (
        <TextArea
          rows={2}
          placeholder="Tambahkan catatan..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          style={{ marginTop: 8 }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Button danger size="small" icon={<DeleteOutlined />} onClick={onDelete}>
          Kosongkan
        </Button>
        <Button type="primary" size="small" onClick={handleSaveClick}>
          Simpan
        </Button>
      </div>
    </div>
  );
};

const PresensiTable = ({ kelasId, year, month }: PresensiTableProps) => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<PresensiSiswa[]>([]);
  const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPresensiBulanan(kelasId, year, month);
      setDataSource(data);
    } catch (error) {
      message.error(`Gagal memuat data presensi.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kelasId, year, month]);
  
  const handlePresensiUpsert = async (anggotaKelasId: string, day: number, newData: Omit<PresensiData, 'anggota_kelas_id'>) => {
    const tanggal = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
    const key = `upsert-${anggotaKelasId}-${tanggal}`;
    message.loading({ content: 'Menyimpan...', key });

    setDataSource(prev => prev.map(siswa => {
      if (siswa.anggota_kelas_id === anggotaKelasId) {
        const newPresensi = { ...siswa.presensi_per_hari, [day]: { status: newData.status, catatan: newData.catatan } };
        return { ...siswa, presensi_per_hari: newPresensi };
      }
      return siswa;
    }));
    
    setOpenPopoverKey(null);

    try {
        const payload: UpsertPresensiInput = {
            kelas_id: kelasId,
            tanggal,
            data: [{ anggota_kelas_id: anggotaKelasId, ...newData }],
        };
        await upsertPresensi(payload);
        message.success({ content: 'Berhasil disimpan!', key, duration: 2 });
    } catch (error) {
        message.error({ content: 'Gagal menyimpan!', key, duration: 2 });
        fetchData();
    }
  };
  
  const handlePresensiDelete = async (anggotaKelasId: string, day: number) => {
    const tanggal = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
    const key = `delete-${anggotaKelasId}-${tanggal}`;
    message.loading({ content: 'Menghapus...', key });

    setDataSource(prev => prev.map(siswa => {
      if (siswa.anggota_kelas_id === anggotaKelasId) {
        const newPresensi = { ...siswa.presensi_per_hari };
        delete newPresensi[day];
        return { ...siswa, presensi_per_hari: newPresensi };
      }
      return siswa;
    }));
    
    setOpenPopoverKey(null);

    try {
        await deletePresensi({ tanggal, anggota_kelas_ids: [anggotaKelasId] });
        message.success({ content: 'Berhasil dihapus!', key, duration: 2 });
    } catch (error) {
        message.error({ content: 'Gagal menghapus!', key, duration: 2 });
        fetchData();
    }
  };

  // --- FUNGSI 'HADIR SEMUA' YANG DIPERBARUI ---
  const handleMarkAllPresent = async (day: number) => {
    const tanggal = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
    const key = `present-all-${tanggal}`;
    message.loading({ content: `Menandai semua hadir tgl ${day}...`, key });

    // Optimistic UI Update
    setDataSource(prev => prev.map(siswa => {
        const newPresensi = { ...siswa.presensi_per_hari, [day]: { status: 'H' as const }};
        return { ...siswa, presensi_per_hari: newPresensi };
    }));

    try {
        const allPresentData: PresensiData[] = dataSource.map(siswa => ({
            anggota_kelas_id: siswa.anggota_kelas_id,
            status: 'H',
            catatan: undefined,
        }));

        const payload: UpsertPresensiInput = {
            kelas_id: kelasId,
            tanggal,
            data: allPresentData,
        };
        await upsertPresensi(payload);
        message.success({ content: `Semua siswa berhasil ditandai hadir!`, key, duration: 2 });
    } catch (error) {
        message.error({ content: 'Gagal menyimpan data!', key, duration: 2 });
        fetchData(); // Rollback jika gagal
    }
  };

  const columns = useMemo(() => {
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
    const dynamicColumns: TableColumnsType<PresensiSiswa> = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = dayjs(`${year}-${month}-${day}`);
      const isWeekend = date.day() === 0 || date.day() === 6;

      const renderStatusTag = (status?: StatusPresensi, catatan?: string) => {
        if (!status) return <Tag style={{ cursor: 'pointer', minWidth: '28px', textAlign: 'center' }}>-</Tag>;
        const color = {'H': 'green', 'S': 'gold', 'I': 'blue', 'A': 'red'}[status];
        return (
          <Tooltip title={catatan}>
            <Tag color={color} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {status}
              {catatan && <CommentOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
            </Tag>
          </Tooltip>
        );
      };
      
      return {
        title: () => (
            <Space direction="vertical" align="center" size={0}>
              <Text>{day}</Text>
              {!isWeekend && (
                <Tooltip title={`Hadir Semua Tgl ${day}`}>
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<CheckSquareOutlined />}
                        onClick={() => handleMarkAllPresent(day)}
                        style={{ padding: 0, height: 'auto', lineHeight: 1 }}
                    />
                </Tooltip>
              )}
            </Space>
        ),
        dataIndex: 'presensi_per_hari', key: `day-${day}`, align: 'center', width: 60,
        onCell: () => ({ style: { backgroundColor: isWeekend ? '#fafafa' : undefined, padding: '4px' } }),
        render: (presensi: Record<number, { status: StatusPresensi, catatan?: string }>, record: PresensiSiswa) => {
          const dataHari = presensi?.[day];
          const popoverKey = `${record.anggota_kelas_id}-${day}`;
          return (
            <Popover
              open={openPopoverKey === popoverKey}
              onOpenChange={(visible) => setOpenPopoverKey(visible ? popoverKey : null)}
              content={
                <PresensiInputControl
                  value={{ status: dataHari?.status, catatan: dataHari?.catatan }}
                  onSave={(newData) => handlePresensiUpsert(record.anggota_kelas_id, day, newData)}
                  onDelete={() => handlePresensiDelete(record.anggota_kelas_id, day)}
                />
              }
              title={`Presensi Tgl ${day}`} trigger="click"
            >
              <div>{renderStatusTag(dataHari?.status, dataHari?.catatan)}</div>
            </Popover>
          );
        },
      };
    });
    
    const summaryColumns: TableColumnsType<PresensiSiswa> = [
      { title: 'S', key: 'summary-s', align: 'center', width: 45, render: (_, record) => Object.values(record.presensi_per_hari || {}).filter(p => p.status === 'S').length },
      { title: 'I', key: 'summary-i', align: 'center', width: 45, render: (_, record) => Object.values(record.presensi_per_hari || {}).filter(p => p.status === 'I').length },
      { title: 'A', key: 'summary-a', align: 'center', width: 45, render: (_, record) => Object.values(record.presensi_per_hari || {}).filter(p => p.status === 'A').length },
    ];

    const finalColumns: TableColumnsType<PresensiSiswa> = [
      { title: 'Nama Siswa', dataIndex: 'nama_siswa', key: 'nama', width: 200, fixed: 'left', render: (text: string, record: PresensiSiswa) => (<Tooltip title={record.nis || 'NIS tidak ada'}><Text>{text}</Text></Tooltip>) },
      ...dynamicColumns,
      { title: 'Jumlah', key: 'summary', fixed: 'right', children: summaryColumns }
    ];

    return finalColumns;

  }, [year, month, dataSource, openPopoverKey]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><Spin /></div>;
  if (dataSource.length === 0) return <Empty description="Tidak ada siswa dalam rombel ini." style={{ marginTop: 32 }} />;
  
  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        bordered
        size="small"
        rowKey="anggota_kelas_id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PresensiTable;