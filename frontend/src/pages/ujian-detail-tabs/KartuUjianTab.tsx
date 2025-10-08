import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// FIX: Import types using 'import type' for strict TypeScript configuration.
// Assuming these are exported from the main types file (e.g., '../../types')
import type { 
    KartuUjianDetail, 
    KartuUjianKelasFilter 
} from '../../types'; 

// FIX: Import functions from the API file (where they must be defined/exported)
import {
    getKartuUjianData,
    getKartuUjianFilters,
    generateKartuUjianPDF,
} from '../../api/ujianMaster';

import { Table, Select, Button, Tag, Space, Checkbox, notification, Modal } from 'antd';
import { DownloadOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons'; // Assuming Ant Design Icons

const { Option } = Select;

const KartuUjianTab: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const ujianMasterID = Number(id);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<KartuUjianDetail[]>([]);
    const [filters, setFilters] = useState<KartuUjianKelasFilter[]>([]);
    const [selectedRombelID, setSelectedRombelID] = useState<number | undefined>(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalPreviewVisible, setIsModalPreviewVisible] = useState(false);

    // Data yang siap dicetak dan yang belum
    const readyToPrintData = useMemo(() => data.filter((item) => item.is_data_lengkap).map(d => d.id), [data]);
    const incompleteData = useMemo(() => data.filter((item) => !item.is_data_lengkap), [data]);

    // Data yang benar-benar terpilih dan siap cetak (untuk FAB)
    const selectedReadyToPrintIDs = useMemo(() => {
        return selectedRowKeys.filter(key => readyToPrintData.includes(key as number)) as number[];
    }, [selectedRowKeys, readyToPrintData]);

    const totalIncomplete = incompleteData.length;

    const fetchData = async (rombelID?: number) => {
        if (!ujianMasterID) return;
        setLoading(true);
        try {
            const filtersData = await getKartuUjianFilters(ujianMasterID);
            setFilters(filtersData);

            const kartuData = await getKartuUjianData(ujianMasterID, rombelID);
            setData(kartuData);

            // Clear selection upon filter change/refresh
            setSelectedRowKeys([]);

        } catch (error) {
            notification.error({ message: 'Gagal memuat data Kartu Ujian' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedRombelID);
    }, [ujianMasterID, selectedRombelID]);

    const handleDownloadPDF = async (pesertaIDs: number[]) => {
        if (pesertaIDs.length === 0) {
            notification.warning({ message: 'Pilih minimal satu peserta untuk dicetak.' });
            return;
        }
        setLoading(true);
        try {
            await generateKartuUjianPDF(ujianMasterID, pesertaIDs);
            notification.success({ message: `Berhasil mengunduh Kartu Ujian untuk ${pesertaIDs.length} peserta.` });
        } catch (error: any) {
            // Menarik pesan error dari response BE (Status 412 Precondition Failed)
            const errorMessage = error?.response?.data?.error || 'Gagal membuat file PDF. Cek kelengkapan data siswa.';
            notification.error({ message: 'Gagal Cetak/Download', description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'NAMA SISWA',
            dataIndex: 'nama_siswa',
            key: 'nama_siswa',
            render: (_: string, record: KartuUjianDetail) => (
                <div>
                    <strong>{record.nama_siswa}</strong>
                    <small style={{ display: 'block', color: '#888' }}>NISN: {record.nisn}</small>
                </div>
            ),
            sorter: (a: KartuUjianDetail, b: KartuUjianDetail) => a.nama_siswa.localeCompare(b.nama_siswa),
        },
        {
            title: 'KELAS',
            dataIndex: 'nama_kelas',
            key: 'nama_kelas',
            sorter: (a: KartuUjianDetail, b: KartuUjianDetail) => a.nama_kelas.localeCompare(b.nama_kelas),
        },
        {
            title: 'NO. UJIAN',
            dataIndex: 'no_ujian',
            key: 'no_ujian',
            render: (text: string) => text || '-',
        },
        {
            title: 'RUANGAN/KURSI',
            key: 'ruangan_kursi',
            render: (_: string, record: KartuUjianDetail) => (
                record.nama_ruangan && record.nomor_kursi ? `${record.nama_ruangan} / K${record.nomor_kursi}` : '-'
            ),
        },
        {
            title: 'STATUS DATA',
            dataIndex: 'is_data_lengkap',
            key: 'is_data_lengkap',
            render: (isComplete: boolean) => (
                <Tag color={isComplete ? 'success' : 'warning'}>
                    {isComplete ? '✅ Lengkap' : '⚠️ Belum Lkp'}
                </Tag>
            ),
            filters: [
                { text: 'Lengkap', value: true },
                { text: 'Belum Lengkap', value: false },
            ],
            onFilter: (value: boolean | React.Key, record: KartuUjianDetail) => record.is_data_lengkap === value,
        },
        {
            title: 'AKSI INDIVIDU',
            key: 'action',
            render: (_: string, record: KartuUjianDetail) => (
                <Space size="small">
                    <Button disabled={!record.is_data_lengkap} onClick={() => setIsModalPreviewVisible(true)} size="small" icon={<EyeOutlined />}>
                        Preview
                    </Button>
                    <Button
                        type="primary"
                        disabled={!record.is_data_lengkap}
                        loading={loading && selectedRowKeys.includes(record.id)}
                        onClick={() => handleDownloadPDF([record.id])}
                        size="small"
                        icon={<DownloadOutlined />}
                    >
                        Cetak
                    </Button>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) => {
            // Hanya izinkan select yang datanya lengkap
            const validKeys = selectedKeys.filter(key => readyToPrintData.includes(key as number));
            setSelectedRowKeys(validKeys);
        },
        getCheckboxProps: (record: KartuUjianDetail) => ({
            disabled: !record.is_data_lengkap, // Disable checkbox if data is incomplete
        }),
    };

    // FAB Style (Sticky Footer) - Implementasi Sticky Footer
    const fabStyle: React.CSSProperties = {
        position: 'sticky',
        bottom: 0,
        padding: '10px 20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
        zIndex: 10,
        display: selectedReadyToPrintIDs.length > 0 ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
    };

    return (
        <div>
            {/* FILTER AREA */}
            <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                <Select
                    style={{ width: 250 }}
                    placeholder="FILTER KELAS/ROMBEL"
                    allowClear
                    onChange={(value: number) => setSelectedRombelID(value)}
                    value={selectedRombelID}
                >
                    {filters.map((f) => (
                        <Option key={f.rombel_id} value={f.rombel_id}>
                            {f.nama_kelas}
                        </Option>
                    ))}
                </Select>
                <Button onClick={() => fetchData(selectedRombelID)} loading={loading} icon={<SyncOutlined />}>
                    Refresh Data
                </Button>
                <Tag color="success" style={{ padding: '5px 10px', fontSize: '14px' }}>
                    ✅ {readyToPrintData.length} Siswa Siap Cetak
                </Tag>
                <Tag color="error" style={{ padding: '5px 10px', fontSize: '14px' }}>
                    ⚠️ {totalIncomplete} Siswa Belum Lengkap
                </Tag>
            </Space>

            {/* TABLE */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                rowSelection={rowSelection}
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
            />

            {/* FLOATING ACTION BAR (FAB) / STICKY FOOTER */}
            <div style={fabStyle}>
                <Space>
                    <Checkbox
                        checked={selectedReadyToPrintIDs.length === readyToPrintData.length && readyToPrintData.length > 0}
                        indeterminate={selectedReadyToPrintIDs.length > 0 && selectedReadyToPrintIDs.length < readyToPrintData.length}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedRowKeys(readyToPrintData); // Pilih hanya yang datanya lengkap
                            } else {
                                setSelectedRowKeys([]);
                            }
                        }}
                    >
                        Pilih Semua Siap Cetak ({selectedReadyToPrintIDs.length} dari {readyToPrintData.length} total)
                    </Checkbox>
                    <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>
                        {selectedReadyToPrintIDs.length} Siswa Terpilih
                    </span>
                </Space>

                <Space>
                    <Button onClick={() => setIsModalPreviewVisible(true)} disabled={selectedReadyToPrintIDs.length === 0} icon={<EyeOutlined />}>
                        Preview ({selectedReadyToPrintIDs.length})
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        disabled={selectedReadyToPrintIDs.length === 0}
                        onClick={() => handleDownloadPDF(selectedReadyToPrintIDs)}
                        icon={<DownloadOutlined />}
                    >
                        Cetak/Download PDF ({selectedReadyToPrintIDs.length})
                    </Button>
                </Space>
            </div>

            {/* MODAL PREVIEW (Placeholder) */}
            <Modal
                title={`Preview Kartu Ujian (${selectedReadyToPrintIDs.length} Kartu)`}
                open={isModalPreviewVisible}
                onCancel={() => setIsModalPreviewVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsModalPreviewVisible(false)}>
                        Tutup
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={() => handleDownloadPDF(selectedReadyToPrintIDs)}
                        icon={<DownloadOutlined />}
                    >
                        Cetak/Download PDF ({selectedReadyToPrintIDs.length})
                    </Button>
                ]}
                width={800}
            >
                <p>--- MOCKUP PREVIEW KARTU UJIAN ---</p>
                <p>Implementasi visual untuk memastikan layout cetak sudah benar.</p>
                <p>Siswa terpilih untuk preview: {data.filter(d => selectedReadyToPrintIDs.includes(d.id)).map(d => d.nama_siswa).join(', ')}</p>
                <p>Data ini yang akan dicetak. Template cetak harus disesuaikan di logika Go backend (`GenerateKartuUjianPDF`).</p>
            </Modal>
        </div>
    );
};

export default KartuUjianTab;