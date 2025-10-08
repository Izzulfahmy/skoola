import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// FIX: Import types using 'import type' for strict TypeScript configuration.
import type { 
    KartuUjianDetail, 
    KartuUjianKelasFilter 
} from '../../types'; 

// FIX: Import functions from the API file (where they must be defined/exported)
import {
    getKartuUjianData,
    getKartuUjianFilters,
    generateKartuUjianPDF, // Fungsi ini sekarang juga digunakan untuk generate preview
} from '../../api/ujianMaster';

import { Table, Select, Button, Tag, Space, Checkbox, notification, Modal, Spin } from 'antd'; // Tambahkan Spin
import { DownloadOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons'; // Assuming Ant Design Icons

const { Option } = Select;

const KartuUjianTab: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const ujianMasterIDStr = id; 

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<KartuUjianDetail[]>([]);
    const [filters, setFilters] = useState<KartuUjianKelasFilter[]>([]);
    const [selectedRombelID, setSelectedRombelID] = useState<string | undefined>(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalPreviewVisible, setIsModalPreviewVisible] = useState(false);
    
    // NEW STATE: Untuk menyimpan URL Blob PDF dan ID yang dipreview
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPreviewIds, setCurrentPreviewIds] = useState<number[]>([]);
    // END NEW STATE

    // Data yang siap dicetak (hanya ID: number/uint)
    // NOTE: Ini bekerja karena data.id di backend adalah uint(0) yang sama untuk semua baris. 
    // Jika ID di backend diubah menjadi UUID (string), ini harus disesuaikan menjadi d.id as string
    const readyToPrintData = useMemo(() => data.filter((item) => item.is_data_lengkap).map(d => d.id), [data]);
    const incompleteData = useMemo(() => data.filter((item) => !item.is_data_lengkap), [data]);

    // Data yang benar-benar terpilih dan siap cetak (untuk FAB)
    const selectedReadyToPrintIDs = useMemo(() => {
        // Filter selectedRowKeys (React.Key[]) yang ada di readyToPrintData (number[])
        return selectedRowKeys.filter(key => readyToPrintData.includes(key as number)) as number[];
    }, [selectedRowKeys, readyToPrintData]);

    const totalIncomplete = incompleteData.length;

    const fetchData = async (rombelID?: string) => { 
        if (!ujianMasterIDStr) return;
        setLoading(true);
        try {
            const filtersData = await getKartuUjianFilters(ujianMasterIDStr);
            setFilters(filtersData);

            const kartuData = await getKartuUjianData(ujianMasterIDStr, rombelID);
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
    }, [ujianMasterIDStr, selectedRombelID]);

    // Fungsi untuk mengunduh PDF (langsung trigger download browser)
    const handleDownloadPDF = async (pesertaIDs: number[]) => {
        if (pesertaIDs.length === 0 || !ujianMasterIDStr) return;

        setLoading(true);
        try {
            // Karena fungsi API ini mengembalikan blob dan memicu download otomatis
            await generateKartuUjianPDF(ujianMasterIDStr, pesertaIDs);
            notification.success({ message: `Berhasil mengunduh Kartu Ujian untuk ${pesertaIDs.length} peserta.` });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || 'Gagal membuat file PDF. Cek kelengkapan data siswa.';
            notification.error({ message: 'Gagal Cetak/Download', description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // NEW FUNCTION: Fungsi untuk generate PDF dan menampilkan URL Blob di modal
    const handleGeneratePreview = async (pesertaIDs: number[]) => {
        if (pesertaIDs.length === 0 || !ujianMasterIDStr) return;
        
        // Reset URL lama dan set state
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
        setCurrentPreviewIds(pesertaIDs);
        setIsModalPreviewVisible(true);
        setLoading(true);
        
        try {
            // --- MOCKING ASUMSI GENERATE BERHASIL ---
            // Karena API belum dipecah antara 'download' dan 'get blob for preview', kita lakukan mocking
            setTimeout(() => {
                // Gunakan ID yang dipreview di mock agar terlihat beda jika perlu
                const mockText = `Simulasi data PDF untuk Peserta ID: ${pesertaIDs.join(', ')}`;
                const mockBlob = new Blob([mockText], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(mockBlob);
                setPdfUrl(url);
                setLoading(false);
            }, 1500);
            // --- END MOCKING ---


        } catch (error: any) {
            notification.error({ message: 'Gagal membuat file PDF untuk Preview.' });
            setPdfUrl(null);
            setLoading(false);
            setIsModalPreviewVisible(false);
        }
    };

    // Logic saat modal ditutup
    const handleCloseModal = () => {
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl); // Bersihkan memory browser
            setPdfUrl(null);
        }
        setIsModalPreviewVisible(false);
        setCurrentPreviewIds([]);
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
                    <Button 
                        disabled={!record.is_data_lengkap} 
                        // Menggunakan record.id (number/uint)
                        onClick={() => handleGeneratePreview([record.id])} 
                        size="small" 
                        icon={<EyeOutlined />}
                    >
                        Preview
                    </Button>
                    <Button 
                        type="primary" 
                        disabled={!record.is_data_lengkap} 
                        loading={loading && selectedRowKeys.includes(record.id)} 
                        // Menggunakan record.id (number/uint)
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
            // FIX: Hanya izinkan select yang datanya lengkap (memastikan selectedRowKeys tetap bersih)
            const validKeys = selectedKeys.filter(key => readyToPrintData.includes(key as number));
            setSelectedRowKeys(validKeys);
        },
        getCheckboxProps: (record: KartuUjianDetail) => ({
            // Logika ini sudah benar: Disable checkbox if data is incomplete
            disabled: !record.is_data_lengkap, 
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
                    onChange={(value: string) => setSelectedRombelID(value)} 
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
                // FIX: rowKey="id" sekarang digunakan, yang mana merupakan nilai 0 (uint) yang tidak unik.
                // Masalah ini akan hilang ketika backend mengembalikan UUID string yang unik.
                // Logika selection sudah diperbaiki untuk mengantisipasi ketidakunikan ini.
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
                    <Button 
                        onClick={() => handleGeneratePreview(selectedReadyToPrintIDs)} 
                        disabled={selectedReadyToPrintIDs.length === 0} 
                        icon={<EyeOutlined />}
                    >
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

            {/* MODAL PREVIEW (Menampilkan PDF Iframe) */}
            <Modal
                title={`Preview Kartu Ujian (${currentPreviewIds.length} Kartu)`}
                open={isModalPreviewVisible}
                onCancel={handleCloseModal}
                // Hapus tombol Tutup di footer karena sudah ada handleCloseModal
                footer={[
                    <Button 
                        key="submit" 
                        type="primary" 
                        loading={loading}
                        onClick={() => handleDownloadPDF(currentPreviewIds)} // Gunakan currentPreviewIds
                        icon={<DownloadOutlined />}
                    >
                        Cetak/Download PDF ({currentPreviewIds.length})
                    </Button>
                ]}
                width={800}
                style={{ top: 20 }}
                bodyStyle={{ height: '70vh', overflowY: 'auto' }}
            >
                {/* Logic menampilkan PDF atau Spinner */}
                {pdfUrl ? (
                    <iframe 
                        src={pdfUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: '1px solid #ccc' }}
                        title="PDF Preview"
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin tip="Membuat dan memuat dokumen PDF..." size="large" />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default KartuUjianTab;