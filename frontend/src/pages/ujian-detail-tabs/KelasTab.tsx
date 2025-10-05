import React from 'react';
import { Button, Row, Col, Table, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

// Menjadikan komponen ini generic dengan <RecordType extends object>
// Ini memungkinkan komponen menerima tipe data apapun dari parent.
interface KelasTabProps<RecordType extends object = any> {
  tableData: readonly RecordType[];
  mainTableColumns: TableProps<RecordType>['columns'];
  expandedRowRender: (record: RecordType) => React.ReactNode;
  onDaftarkanKelasClick: () => void;
  canDaftarkanKelas: boolean;
}

const KelasTab = <RecordType extends object>({ 
  tableData, 
  mainTableColumns,
  expandedRowRender,
  onDaftarkanKelasClick,
  canDaftarkanKelas
}: KelasTabProps<RecordType>) => {
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
        expandable={{ expandedRowRender }}
        showHeader={false}
        pagination={false}
        locale={{ emptyText: <Empty description="Belum ada kelas yang ditugaskan." /> }}
      />
    </>
  );
};

export default KelasTab;