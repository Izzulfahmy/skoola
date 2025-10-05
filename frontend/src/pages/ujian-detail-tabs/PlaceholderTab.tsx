import { Empty } from 'antd';

interface PlaceholderTabProps {
  title: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <div style={{ paddingTop: '24px' }}>
      <Empty description={`Fitur untuk mengelola ${title} akan segera tersedia.`} />
    </div>
  )
};

export default PlaceholderTab;