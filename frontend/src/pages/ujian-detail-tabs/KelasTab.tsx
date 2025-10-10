import React, { useMemo } from 'react';
import { Button, Row, Col, Table, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

// Menjadikan komponen ini generic dengan <RecordType extends object>
// Ini memungkinkan komponen menerima tipe data apapun dari parent.
interface KelasTabProps<RecordType extends object = any> {
  // tableData harus memiliki key unik, defaultnya 'key'
  tableData: readonly RecordType[];
  mainTableColumns: TableProps<RecordType>['columns'];
  expandedRowRender: (record: RecordType) => React.ReactNode;
  onDaftarkanKelasClick: () => void;
  canDaftarkanKelas: boolean;
  // Menambahkan prop opsional untuk custom rowKey, defaultnya adalah 'key'
  rowKey?: keyof RecordType;
}

const KelasTab = <RecordType extends object>({ 
  tableData, 
  mainTableColumns,
  expandedRowRender,
  onDaftarkanKelasClick,
  canDaftarkanKelas,
  rowKey = 'key' as keyof RecordType // Default menggunakan 'key'
}: KelasTabProps<RecordType>) => {

  // Gunakan useMemo untuk menghitung kunci baris yang akan dibuka secara default
  // Ini memastikan defaultExpandedRowKeys hanya dihitung ulang jika tableData atau rowKey berubah
  const defaultExpandedKeys = useMemo(() => {
    // Memastikan rowKey ada dalam tipe RecordType dan data tidak kosong
    if (!tableData || tableData.length === 0) {
      return [];
    }

    // Mengambil semua nilai dari rowKey sebagai string atau number
    return tableData.map(record => String(record[rowKey]));
  }, [tableData, rowKey]);
  
  return (
    <>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onDaftarkanKelasClick}
            disabled={!canDaftarkanKelas}
          >
            Daftarkan Kelas
          </Button>
        </Col>
      </Row>
      <Table<RecordType> // Memberitahu Ant Design Table tipe data yang digunakan
        columns={mainTableColumns}
        dataSource={tableData}
        size="small"
        // --- MODIFIKASI DIMULAI DI SINI ---
        expandable={{ 
          expandedRowRender,
          // Properti ini membuat semua baris terbuka secara default
          defaultExpandedRowKeys: defaultExpandedKeys
        }}
        // Menentukan kunci unik untuk setiap baris, penting untuk defaultExpandedRowKeys
        rowKey={rowKey} 
        // --- MODIFIKASI BERAKHIR DI SINI ---
        showHeader={false}
        pagination={false}
        locale={{ emptyText: <Empty description="Belum ada kelas yang ditugaskan." /> }}
      />
    </>
  );
};

export default KelasTab;