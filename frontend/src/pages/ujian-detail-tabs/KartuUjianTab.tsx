import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { 
    KartuUjianDetail, 
    KartuUjianKelasFilter 
} from '../../types'; 

import {
    getKartuUjianData,
    getKartuUjianFilters,
    generateKartuUjianPDF, 
} from '../../api/ujianMaster';

// Hapus Checkbox dari import karena tidak digunakan lagi
import { Table, Select, Button, Tag, Space, notification, Modal, Spin } from 'antd'; 
import { DownloadOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons'; 

const { Option } = Select;

const KartuUjianTab: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const ujianMasterIDStr = id; 

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<KartuUjianDetail[]>([]);
    const [filters, setFilters] = useState<KartuUjianKelasFilter[]>([]);
    const [selectedRombelID, setSelectedRombelID] = useState<string | undefined>(undefined);
    // State selectedRowKeys tidak digunakan lagi, tapi tidak dihapus agar tidak menimbulkan error jika ada sisa kode yang menggunakannya (walau seharusnya sudah dihapus)
    // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); 
    const [isModalPreviewVisible, setIsModalPreviewVisible] = useState(false);
    
    // NEW STATE: Untuk menyimpan URL Blob PDF dan ID yang dipreview
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPreviewIds, setCurrentPreviewIds] = useState<number[]>([]);
    // END NEW STATE

    // Data yang siap dicetak (hanya ID: number/uint)
    const readyToPrintData = useMemo(() => data.filter((item) => item.is_data_lengkap).map(d => d.id), [data]);
    const incompleteData = useMemo(() => data.filter((item) => !item.is_data_lengkap), [data]);

    // Variabel ini tidak digunakan lagi karena FAB dihapus, tapi dipertahankan untuk kompatibilitas jika ada kode lain yang mengacu
    // const selectedReadyToPrintIDs = useMemo(() => {
    //     return selectedRowKeys
    //         .filter(key => readyToPrintData.includes(key as number)) 
    //         .map(key => key as number);
    // }, [selectedRowKeys, readyToPrintData]);

    const totalIncomplete = incompleteData.length;

    const fetchData = async (rombelID?: string) => { 
        if (!ujianMasterIDStr) return;
        setLoading(true);
        try {
            const filtersData = await getKartuUjianFilters(ujianMasterIDStr);
            setFilters(filtersData);

            const kartuData = await getKartuUjianData(ujianMasterIDStr, rombelID);
            setData(kartuData);

            // setSelectedRowKeys([]); // Dihapus karena rowSelection dihilangkan

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
            await generateKartuUjianPDF(ujianMasterIDStr, pesertaIDs);
            notification.success({ message: `Berhasil mengunduh Kartu Ujian untuk ${pesertaIDs.length} peserta.` });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || 'Gagal membuat file PDF. Cek kelengkapan data siswa.';
            notification.error({ message: 'Gagal Cetak/Download', description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk generate PDF dan menampilkan URL Blob di modal
    const handleGeneratePreview = async (pesertaIDs: number[]) => {
        if (pesertaIDs.length === 0 || !ujianMasterIDStr) return;
        
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
        setCurrentPreviewIds(pesertaIDs);
        setIsModalPreviewVisible(true);
        setLoading(true);
        
        try {
            // --- MOCKING ASUMSI GENERATE BERHASIL ---
            setTimeout(() => {
                const mockText = `Simulasi data PDF untuk Peserta ID: ${pesertaIDs.join(', ')}. Ini adalah data yang sedang ditampilkan (terfilter atau terpilih).`;
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

    // Digunakan oleh tombol di atas tabel untuk semua data yang difilter
    const handleMassAction = async (action: 'preview' | 'print', pesertaIDs: number[]) => {
        if (pesertaIDs.length === 0) {
            notification.warning({ message: 'Tidak ada peserta yang siap cetak (Data belum lengkap atau tidak ada data yang difilter).' });
            return;
        }

        if (action === 'preview') {
            await handleGeneratePreview(pesertaIDs);
        } else if (action === 'print') {
            await handleDownloadPDF(pesertaIDs);
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
            render: (text: string) => <div style={{ fontWeight: 'bold' }}>{text}</div>,
            sorter: (a: KartuUjianDetail, b: KartuUjianDetail) => a.nama_siswa.localeCompare(b.nama_siswa),
        },
        {
            title: 'NISN', // Kolom NISN terpisah
            dataIndex: 'nisn',
            key: 'nisn',
            render: (text: string) => text || '-',
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
                <Tag color={isComplete ? 'success' : 'warning'} style={{ margin: '0' }}>
                    {isComplete ? '✅ Lengkap' : '⚠️ Belum Lkp'}
                </Tag>
            ),
            filters: [
                { text: 'Lengkap', value: true },
                { text: 'Belum Lengkap', value: false },
            ],
            onFilter: (value: boolean | React.Key, record: KartuUjianDetail) => record.is_data_lengkap === value,
        },
    ];

    // Hilangkan rowSelection
    // const rowSelection = { ... };

    // Hilangkan fabStyle

    return (
        <div>
            {/* FILTER & BUTTON AREA (Memenuhi layout sejajar dengan filter) */}
            <Space style={{ marginBottom: 16, flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                
                {/* Left Side: Filter and Refresh */}
                <Space>
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
                </Space>

                {/* Right Side: Combined Button for ALL FILTERED DATA (Acuan tabel) */}
                <Space>
                    <Tag color="success">✅ {readyToPrintData.length} Siap Cetak</Tag>
                    {totalIncomplete > 0 && (
                        <Tag color="error">⚠️ {totalIncomplete} Belum Lengkap</Tag>
                    )}
                    <Button 
                        onClick={() => handleMassAction('preview', readyToPrintData)}
                        disabled={loading || readyToPrintData.length === 0} 
                        icon={<EyeOutlined />}
                    >
                        Preview All Filtered
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        disabled={loading || readyToPrintData.length === 0}
                        onClick={() => handleMassAction('print', readyToPrintData)}
                        icon={<DownloadOutlined />}
                    >
                        Cetak All Filtered
                    </Button>
                </Space>
            </Space>

            {/* TABLE */}
            <Table
                rowKey="id" 
                columns={columns}
                dataSource={data}
                loading={loading}
                // HILANGKAN rowSelection
                // HILANGKAN paginasi
                pagination={false} 
                size="small" 
                scroll={{ x: 1000 }}
            />

            {/* FLOATING ACTION BAR (FAB) / STICKY FOOTER DIHILANGKAN */}

            {/* MODAL PREVIEW (Menampilkan PDF Iframe) */}
            <Modal
                title={`Preview Kartu Ujian (${currentPreviewIds.length} Kartu)`}
                open={isModalPreviewVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button 
                        key="back" 
                        onClick={handleCloseModal}
                    >
                        Tutup
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        loading={loading}
                        onClick={() => handleDownloadPDF(currentPreviewIds)} 
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