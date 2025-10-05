import { Spin, Empty, Collapse, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { GroupedPesertaUjian, PesertaUjian } from '../../types';

const { Panel } = Collapse;
const { Text } = Typography;

interface PesertaUjianTabProps {
  data: GroupedPesertaUjian | undefined;
  isLoading: boolean;
}

const PesertaUjianTab: React.FC<PesertaUjianTabProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Spin style={{ display: 'block', margin: '24px auto' }} />;
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ paddingTop: '24px' }}>
        <Empty description="Belum ada peserta ujian yang terdaftar." />
      </div>
    );
  }

  const columns: TableProps<PesertaUjian>['columns'] = [
    {
      title: 'No. Urut',
      dataIndex: 'urutan',
      key: 'urutan',
      width: 100,
      align: 'center',
    },
    {
      title: 'Nama Siswa',
      dataIndex: 'nama_siswa',
      key: 'nama_siswa',
    },
    {
      title: 'NISN',
      dataIndex: 'nisn',
      key: 'nisn',
    },
    {
      title: 'Nomor Ujian',
      dataIndex: 'nomor_ujian',
      key: 'nomor_ujian',
      render: (nomor) => nomor || <Text type="secondary">-</Text>,
    },
  ];

  return (
    <Collapse accordion>
      {Object.entries(data).map(([namaKelas, pesertaList]) => (
        <Panel header={`${namaKelas} (${pesertaList.length} Peserta)`} key={namaKelas}>
          <Table
            columns={columns}
            dataSource={pesertaList}
            pagination={false}
            size="small"
            rowKey="id"
          />
        </Panel>
      ))}
    </Collapse>
  );
};

export default PesertaUjianTab;