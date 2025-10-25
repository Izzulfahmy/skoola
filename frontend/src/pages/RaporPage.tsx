// frontend/src/pages/RaporPage.tsx
import { useState } from 'react';
import {
  Typography,
  Select,
  Table,
  Space,
  Button,
  Tag,
  Breadcrumb,
  Collapse,
  Card,
  Row,
  Col,
  Tabs,
  theme,
  Divider,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BookOutlined,
  AimOutlined,
  GoldOutlined,
  FormOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  PrinterOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './RaporPage.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { CheckableTag } = Tag;

// --- INTERFACE & DATA DUMMY LENGKAP (TETAP SAMA) ---

interface DataType {
    key: string; no: number; namaSiswa: string; nisn: string; status: 'belum_final' | 'sudah_final' | 'belum_lengkap';
}
interface Penilaian { id: string; nama: string; }

// Data Dummy untuk Pratinjau Rapor (Diperkaya)
const dummySiswaRaporData = [
    {
        nama: 'Anisa Puspitasari', nisn: '102001',
        nilai: [
            { key: '1', mapel: 'Matematika Wajib', nilai: 88, predikat: 'A', deskripsi: 'Sangat baik dalam memahami konsep aljabar dan bangun ruang.' },
            { key: '2', mapel: 'Fisika', nilai: 82, predikat: 'B', deskripsi: 'Baik dalam penerapan hukum Newton, perlu peningkatan di materi optik.' },
            { key: '3', mapel: 'Kimia', nilai: 85, predikat: 'B', deskripsi: 'Memiliki pemahaman yang baik tentang stoikiometri.' },
            { key: '4', mapel: 'Biologi', nilai: 91, predikat: 'A', deskripsi: 'Sangat menguasai materi genetika dan klasifikasi makhluk hidup.' },
            { key: '5', mapel: 'Bahasa Indonesia', nilai: 90, predikat: 'A', deskripsi: 'Memiliki kemampuan analisis teks dan penulisan esai yang sangat baik.' },
            { key: '6', mapel: 'Bahasa Inggris', nilai: 87, predikat: 'A', deskripsi: 'Sangat fasih dalam percakapan dan memiliki tata bahasa yang baik.' },
        ],
        ekstrakurikuler: [
            { key: '1', nama: 'Pramuka', deskripsi: 'Aktif mengikuti kegiatan kepramukaan dan menjabat sebagai pratama.' },
            { key: '2', nama: 'KIR (Kelompok Ilmiah Remaja)', deskripsi: 'Berperan aktif dalam penelitian tentang energi terbarukan.' }
        ],
        prestasi: [
            { key: '1', nama: 'Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten' },
            { key: '2', nama: 'Peserta Olimpiade Sains Nasional (OSN) Bidang Biologi' }
        ],
        kehadiran: { sakit: 2, izin: 1, alfa: 0 },
        catatan: 'Anisa adalah siswa yang teladan, rajin, dan berprestasi. Terus pertahankan semangat belajarmu dan teruslah menginspirasi teman-temanmu!',
        statusNaik: 'Naik Kelas',
    },
    {
        nama: 'Bima Sakti', nisn: '102002',
        nilai: [
            { key: '1', mapel: 'Matematika Wajib', nilai: 78, predikat: 'B', deskripsi: 'Perlu lebih banyak berlatih soal-soal turunan dan integral.' },
            { key: '2', mapel: 'Fisika', nilai: 75, predikat: 'C', deskripsi: 'Cukup baik, perlu pemahaman lebih dalam pada materi optik dan kelistrikan.' },
            { key: '3', mapel: 'Kimia', nilai: 77, predikat: 'B', deskripsi: 'Cukup memahami konsep laju reaksi, perlu latihan.' },
            { key: '4', mapel: 'Biologi', nilai: 80, predikat: 'B', deskripsi: 'Baik dalam memahami ekosistem.' },
            { key: '5', mapel: 'Bahasa Indonesia', nilai: 85, predikat: 'B', deskripsi: 'Baik dalam menulis esai dan menyampaikan gagasan.' },
            { key: '6', mapel: 'Bahasa Inggris', nilai: 82, predikat: 'B', deskripsi: 'Memiliki kemampuan percakapan yang baik.' },
        ],
        ekstrakurikuler: [{ key: '1', nama: 'Paskibra', deskripsi: 'Menunjukkan disiplin dan tanggung jawab yang tinggi.' }],
        prestasi: [],
        kehadiran: { sakit: 1, izin: 3, alfa: 1 },
        catatan: 'Bima memiliki potensi yang sangat baik. Tingkatkan kehadiran dan fokus saat proses belajar mengajar agar potensi tersebut bisa lebih tergali secara maksimal.',
        statusNaik: 'Naik Kelas',
    },
    {
        nama: 'Candra Wijaya', nisn: '102003',
        nilai: [
            { key: '1', mapel: 'Matematika Wajib', nilai: 92, predikat: 'A', deskripsi: 'Luar biasa, sangat cepat dan akurat dalam perhitungan.' },
            { key: '2', mapel: 'Fisika', nilai: 94, predikat: 'A', deskripsi: 'Sangat menguasai konsep mekanika dan termodinamika.' },
            { key: '3', mapel: 'Kimia', nilai: 90, predikat: 'A', deskripsi: 'Analisis kualitatif dan kuantitatif sangat baik.' },
            { key: '4', mapel: 'Biologi', nilai: 88, predikat: 'A', deskripsi: 'Sangat baik dalam praktikum dan analisis data.' },
            { key: '5', mapel: 'Bahasa Indonesia', nilai: 85, predikat: 'B', deskripsi: 'Kemampuan literasi baik, perlu ditingkatkan dalam penulisan kreatif.' },
            { key: '6', mapel: 'Bahasa Inggris', nilai: 91, predikat: 'A', deskripsi: 'Kemampuan menulis akademik dalam Bahasa Inggris sangat menonjol.' },
        ],
        ekstrakurikuler: [{ key: '1', nama: 'Klub Robotik', deskripsi: 'Inovatif dan menjadi ketua tim dalam kompetisi robotik.' }],
        prestasi: [
            { key: '1', nama: 'Medali Emas Kompetisi Robotik Nasional' },
            { key: '2', nama: 'Juara 2 Olimpiade Fisika Tingkat Provinsi' },
        ],
        kehadiran: { sakit: 0, izin: 0, alfa: 0 },
        catatan: 'Candra adalah siswa dengan talenta luar biasa di bidang sains dan teknologi. Teruslah berkarya dan jangan cepat puas dengan pencapaian yang ada.',
        statusNaik: 'Naik Kelas',
    },
];

// Data Dummy untuk Rekapitulasi Nilai (Diperkaya)
const dummySumatifData = [
    { key: 'uts', nama: 'Ujian Tengah Semester', icon: <FormOutlined />, children: [
        { key: 'uts-mat', nama: 'Matematika', penilaian: [{id: 'uts-utama-mat', nama: 'UTS Utama'}, {id: 'uts-remidi-mat', nama: 'Remidi UTS'}] },
        { key: 'uts-fis', nama: 'Fisika', penilaian: [{id: 'uts-utama-fis', nama: 'UTS Utama'}] },
        { key: 'uts-kim', nama: 'Kimia', penilaian: [{id: 'uts-utama-kim', nama: 'UTS Utama'}] },
        { key: 'uts-bio', nama: 'Biologi', penilaian: [{id: 'uts-utama-bio', nama: 'UTS Utama'}] },
    ]},
    { key: 'uas', nama: 'Ujian Akhir Semester', icon: <FormOutlined />, children: [
        { key: 'uas-mat', nama: 'Matematika', penilaian: [{id: 'uas-utama-mat', nama: 'UAS Utama'}] },
        { key: 'uas-fis', nama: 'Fisika', penilaian: [{id: 'uas-utama-fis', nama: 'UAS Utama'}] },
        { key: 'uas-kim', nama: 'Kimia', penilaian: [{id: 'uas-utama-kim', nama: 'UAS Utama'}] },
        { key: 'uas-bio', nama: 'Biologi', penilaian: [{id: 'uas-utama-bio', nama: 'UAS Utama'}] },
    ]},
];

const dummyFormatifData = [
  {
    key: 'matematika', nama: 'Matematika Wajib', icon: <BookOutlined />,
    children: [
      { key: 'materi-1', nama: 'Bangun Ruang', isMateri: true, children: [
          { key: 'tp-1-1', nama: 'Memahami pengertian bangun ruang', isTP: true, penilaian: [{ id: 'tugas-1', nama: 'Tugas 1' }, { id: 'pr-1', nama: 'PR 1' }] },
          { key: 'tp-1-2', nama: 'Menghitung volume kubus dan balok', isTP: true, penilaian: [{ id: 'tugas-2', nama: 'Latihan Soal' }] },
      ]},
      { key: 'materi-2', nama: 'Aljabar Linear', isMateri: true, children: [
          { key: 'tp-2-1', nama: 'Operasi matriks', isTP: true, penilaian: [{ id: 'kuis-1', nama: 'Kuis Cepat' }, { id: 'tugas-3', nama: 'Tugas Kelompok' }] },
      ]},
    ]
  },
  {
    key: 'fisika', nama: 'Fisika', icon: <BookOutlined />,
    children: [
        { key: 'materi-3', nama: 'Mekanika Newton', isMateri: true, children: [
            { key: 'tp-3-1', nama: 'Hukum Newton I, II, dan III', isTP: true, penilaian: [{ id: 'prak-1', nama: 'Praktikum 1' }, { id: 'lap-1', nama: 'Laporan Praktikum' }] },
        ]},
        { key: 'materi-4', nama: 'Optik Geometri', isMateri: true, children: [
            { key: 'tp-4-1', nama: 'Menganalisis sifat cermin dan lensa', isTP: true, penilaian: [{ id: 'prak-2', nama: 'Praktikum Lensa' }, { id: 'tugas-4', nama: 'Tugas Proyek Periskop' }] },
        ]},
    ]
  }
];

// --- Komponen untuk Tab Daftar Siswa ---
const DaftarSiswaTab = ({ selectedUjian, selectedRombel }: { selectedUjian: string; selectedRombel: string }) => {
    const data: DataType[] = Array.from({ length: 32 }, (_, i) => ({
        key: `${i + 1}`, no: i + 1, namaSiswa: `Siswa ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`, nisn: `1020${i.toString().padStart(3, '0')}`,
        status: i % 4 === 0 ? 'belum_lengkap' : i % 3 === 0 ? 'belum_final' : 'sudah_final',
    }));
    const columns: TableColumnsType<DataType> = [
        { title: '#', dataIndex: 'no', key: 'no', width: 50 },
        { title: 'Nama Siswa', dataIndex: 'namaSiswa', key: 'namaSiswa', render: (text) => <strong>{text}</strong> },
        { title: 'NISN', dataIndex: 'nisn', key: 'nisn' },
        { title: 'Status Finalisasi', dataIndex: 'status', key: 'status', render: (status: DataType['status']) => {
            const tagMap: Record<DataType['status'], React.ReactNode> = {
              belum_final: <Tag color="warning">⚠️ BELUM FINAL</Tag>,
              sudah_final: <Tag color="success">✅ SUDAH FINAL</Tag>,
              belum_lengkap: <Tag color="error">❌ BELUM LENGKAP</Tag>,
            };
            return tagMap[status];
          },
        },
        { title: 'Aksi/Detail', key: 'action', render: () => <Button type="primary" size="small">Lihat & Edit</Button> },
    ];
    return (
        <>
            <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>DAFTAR SISWA {selectedUjian} ROMBEL {selectedRombel} (Total: {data.length} Siswa)</Title>
            <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} size="small" />
        </>
    );
};

// --- Komponen untuk Tab Rekap Nilai ---
const RekapNilaiTab = () => {
    const { token } = theme.useToken();
    const [selectedPenilaian, setSelectedPenilaian] = useState<string[]>(['tugas-1', 'uts-utama-mat', 'prak-1']);

    const handleSelectionChange = (penilaianId: string) => {
        const newSelection = selectedPenilaian.includes(penilaianId)
            ? selectedPenilaian.filter((id) => id !== penilaianId)
            : [...selectedPenilaian, penilaianId];
        setSelectedPenilaian(newSelection);
    };

    const renderCheckableTag = (penilaian: Penilaian) => {
        const isSelected = selectedPenilaian.includes(penilaian.id);
        return (
            <CheckableTag key={penilaian.id} checked={isSelected} onChange={() => handleSelectionChange(penilaian.id)}
                style={{ padding: '2px 10px', fontSize: '13px', background: isSelected ? token.colorPrimary : '#f0f0f0',
                    color: isSelected ? '#fff' : '#000', border: `1px solid ${isSelected ? token.colorPrimary : '#d9d9d9'}`, borderRadius: '6px',
                }}>
                {penilaian.nama}
            </CheckableTag>
        );
    };
    
    const masterDataSource = [
        { key: 'header-sumatif', isHeader: true, nama: 'PENILAIAN SUMATIF (UJIAN SEMESTER)', icon: <CalendarOutlined /> },
        ...dummySumatifData,
        { key: 'header-formatif', isHeader: true, nama: 'PENILAIAN FORMATIF (PER MATA PELAJARAN)', icon: <ExperimentOutlined /> },
        ...dummyFormatifData,
    ];

    const columns: TableColumnsType<any> = [
        {
            dataIndex: 'nama', key: 'nama',
            render: (text, record) => {
                if (record.isHeader) {
                    return {
                        children: <Title level={5} type="secondary" style={{ margin: 0, padding: '8px 0' }}>{record.icon} {text}</Title>,
                        props: { colSpan: 2, style: { background: '#fafafa', paddingLeft: '16px' } },
                    };
                }
                if (record.isMateri) return <><GoldOutlined /> <Text strong>{text}</Text></>;
                if (record.isTP) return <><AimOutlined /> <Text italic>{text}</Text></>;
                return <Text strong>{record.icon} {text}</Text>;
            },
        },
        {
            dataIndex: 'penilaian', key: 'penilaian', width: '60%',
            render: (penilaian, record) => {
                if (record.isHeader) {
                    return { props: { colSpan: 0 } };
                }
                return penilaian ? <Space size={[4, 8]} wrap>{penilaian.map(renderCheckableTag)}</Space> : null;
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={masterDataSource}
            pagination={false}
            size="small"
            showHeader={false}
            defaultExpandAllRows
            style={{ border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}
        />
    );
};

// --- Komponen untuk Tab Pratinjau Rapor ---
const PratinjauRaporTab = () => {
    const [currentSiswaIndex, setCurrentSiswaIndex] = useState(0);
    const siswa = dummySiswaRaporData[currentSiswaIndex];

    const handleNext = () => setCurrentSiswaIndex(prev => (prev + 1) % dummySiswaRaporData.length);
    const handlePrev = () => setCurrentSiswaIndex(prev => (prev - 1 + dummySiswaRaporData.length) % dummySiswaRaporData.length);
    const handlePrint = () => window.print();

    const nilaiColumns: TableColumnsType<any> = [
        { title: 'Mata Pelajaran', dataIndex: 'mapel', key: 'mapel', render: (text) => <strong>{text}</strong> },
        { title: 'Nilai', dataIndex: 'nilai', key: 'nilai', width: 80, align: 'center' },
        { title: 'Predikat', dataIndex: 'predikat', key: 'predikat', width: 100, align: 'center' },
        { title: 'Deskripsi', dataIndex: 'deskripsi', key: 'deskripsi' },
    ];

    return (
        <div className="rapor-container">
            <div className="rapor-controls no-print">
                <Button icon={<ArrowLeftOutlined />} onClick={handlePrev}>Sebelumnya</Button>
                <Title level={5} style={{ margin: '0 16px' }}>
                    <UserOutlined /> {siswa.nama} ({currentSiswaIndex + 1}/{dummySiswaRaporData.length})
                </Title>
                <Button icon={<ArrowRightOutlined />} onClick={handleNext}>Berikutnya</Button>
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ marginLeft: 'auto' }}>
                    Cetak Rapor
                </Button>
            </div>

            <div className="rapor-paper">
                <header className="rapor-header">
                    <Title level={4}>LAPORAN HASIL BELAJAR SISWA</Title>
                    <Title level={5}>SMA NEGERI HARAPAN BANGSA</Title>
                    <Text>Jl. Pendidikan No. 123, Kota Cerdas, Indonesia</Text>
                </header>
                <Divider />
                <section className="rapor-info">
                    <Row>
                        <Col span={12}>
                            <Row>
                                <Col span={8}><Text>Nama Siswa</Text></Col>
                                <Col span={16}><Text>: <strong>{siswa.nama}</strong></Text></Col>
                                <Col span={8}><Text>NISN</Text></Col>
                                <Col span={16}><Text>: <strong>{siswa.nisn}</strong></Text></Col>
                                <Col span={8}><Text>Kelas</Text></Col>
                                <Col span={16}><Text>: <strong>X IPA 1</strong></Text></Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={8}><Text>Kurikulum</Text></Col>
                                <Col span={16}><Text>: <strong>Kurikulum Merdeka</strong></Text></Col>
                                <Col span={8}><Text>Fase</Text></Col>
                                <Col span={16}><Text>: <strong>E</strong></Text></Col>
                                <Col span={8}><Text>Tahun Pelajaran</Text></Col>
                                <Col span={16}><Text>: <strong>2023/2024</strong></Text></Col>
                            </Row>
                        </Col>
                    </Row>
                </section>
                <Divider />
                <Title level={5}>A. Nilai Akademik</Title>
                <Table columns={nilaiColumns} dataSource={siswa.nilai} pagination={false} size="small" bordered rowKey="key" />
                <Title level={5} style={{ marginTop: 24 }}>B. Ekstrakurikuler</Title>
                <Table columns={[{ title: 'Kegiatan', dataIndex: 'nama' }, { title: 'Keterangan', dataIndex: 'deskripsi' }]} dataSource={siswa.ekstrakurikuler} pagination={false} size="small" bordered rowKey="key" />
                <Title level={5} style={{ marginTop: 24 }}>C. Prestasi</Title>
                <Table columns={[{ title: 'Prestasi yang Dicapai', dataIndex: 'nama' }]} dataSource={siswa.prestasi} pagination={false} size="small" bordered rowKey="key" />
                <Title level={5} style={{ marginTop: 24 }}>D. Ketidakhadiran</Title>
                <Row gutter={16}>
                    <Col>Sakit: <strong>{siswa.kehadiran.sakit}</strong> hari</Col>
                    <Col>Izin: <strong>{siswa.kehadiran.izin}</strong> hari</Col>
                    <Col>Tanpa Keterangan: <strong>{siswa.kehadiran.alfa}</strong> hari</Col>
                </Row>
                <Title level={5} style={{ marginTop: 24 }}>E. Catatan Wali Kelas</Title>
                <Card size="small"><Paragraph>{siswa.catatan}</Paragraph></Card>
                
                <Row style={{ marginTop: 32, pageBreakInside: 'avoid' }} justify="space-between">
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Text>Mengetahui,</Text><br/>
                        <Text>Orang Tua/Wali</Text>
                        <br/><br/><br/><br/>
                        <Text><strong>(___________________)</strong></Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Text>Wali Kelas,</Text>
                        <br/><br/><br/><br/><br/>
                        <Text><strong>(Nama Wali Kelas, S.Pd.)</strong></Text><br/>
                        <Text>NIP. 123456789</Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Text>Kota Cerdas, 15 Desember 2023</Text><br/>
                        <Text>Kepala Sekolah,</Text>
                        <br/><br/><br/><br/>
                        <Text><strong>(Nama Kepala Sekolah, M.Pd.)</strong></Text><br/>
                        <Text>NIP. 987654321</Text>
                    </Col>
                </Row>
                
                <div style={{marginTop: 32}}>
                    <Text>Keterangan Naik/Tidak Naik Kelas:</Text><br/>
                    <Text>Berdasarkan hasil yang dicapai, maka siswa ditetapkan: <Tag color={siswa.statusNaik === 'Naik Kelas' ? 'success' : 'error'}>{siswa.statusNaik.toUpperCase()}</Tag></Text>
                </div>
            </div>
        </div>
    );
};

// --- Komponen Tampilan Detail Ujian ---
const UjianDetailView = ({ selectedUjian, selectedRombel, onBack }: { selectedUjian: string; selectedRombel: string; onBack: () => void; }) => {
    const tabItems = [
        { key: '1', label: 'Daftar Siswa', children: <DaftarSiswaTab selectedUjian={selectedUjian} selectedRombel={selectedRombel} /> },
        { key: '2', label: 'Rekapitulasi Nilai', children: <RekapNilaiTab /> },
        { key: '3', label: 'Pratinjau Rapor', children: <PratinjauRaporTab /> },
    ];
    return (
        <>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>Kembali ke Pilih Ujian</Button>
            <Tabs defaultActiveKey="3" items={tabItems} style={{ marginBottom: 0 }} />
        </>
    );
};

// --- Komponen Utama Halaman Rapor ---
const RaporPage = () => {
    const [view, setView] = useState<'pilih_ujian' | 'lihat_detail_ujian'>('pilih_ujian');
    const [selectedUjian, setSelectedUjian] = useState<{ key: string; nama: string } | null>(null);
    const [selectedTahun, setSelectedTahun] = useState('2023/2024');
    const [selectedRombel, setSelectedRombel] = useState('X IPA 1');
  
    const handleUjianSelect = (ujian: { key: string; nama: string }) => {
        setSelectedUjian(ujian);
        setView('lihat_detail_ujian');
    };
    const handleBackToUjian = () => setView('pilih_ujian');
  
    const renderPanelContent = (ujian: { key: string; nama: string }, description: string) => (
      <Row justify="space-between" align="middle">
        <Col><Text>{description}</Text></Col>
        <Col><Button type="primary" onClick={(e) => { e.stopPropagation(); handleUjianSelect(ujian); }}>Pilih Ujian</Button></Col>
      </Row>
    );
  
    return (
      // MODIFIKASI: Tambahkan `className` di sini
      <div className="rapor-page-wrapper">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Manajemen Rapor</Breadcrumb.Item>
          {selectedUjian && <Breadcrumb.Item>{selectedUjian.nama}</Breadcrumb.Item>}
        </Breadcrumb>
  
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Manajemen Rapor</Title>
          <Space wrap>
            <Select value={selectedTahun} onChange={setSelectedTahun} style={{ width: 200 }} disabled={view === 'lihat_detail_ujian'}>
              <Select.Option value="2023/2024">Tahun Pelajaran: 2023/2024</Select.Option>
            </Select>
            {view === 'lihat_detail_ujian' && (
              <Select value={selectedRombel} onChange={setSelectedRombel} style={{ width: 200 }}>
                <Select.Option value="X IPA 1">Rombel: X IPA 1</Select.Option>
                <Select.Option value="X IPA 2">Rombel: X IPA 2</Select.Option>
              </Select>
            )}
          </Space>
        </div>
  
        <Card>
          {view === 'pilih_ujian' && (
            <>
              <Title level={5}>Pilih Ujian</Title>
              <Collapse>
                <Panel header="Ujian Tengah Semester (UTS)" key="UTS">
                  {renderPanelContent({ key: 'UTS', nama: 'Ujian Tengah Semester' }, 'Manajemen rapor untuk Ujian Tengah Semester.')}
                </Panel>
                <Panel header="Ujian Akhir Semester (UAS)" key="UAS">
                  {renderPanelContent({ key: 'UAS', nama: 'Ujian Akhir Semester' }, 'Manajemen rapor untuk Ujian Akhir Semester.')}
                </Panel>
              </Collapse>
            </>
          )}
          {view === 'lihat_detail_ujian' && selectedUjian && (
            <UjianDetailView selectedUjian={selectedUjian.nama} selectedRombel={selectedRombel} onBack={handleBackToUjian} />
          )}
        </Card>
      </div>
    );
};
  
export default RaporPage;