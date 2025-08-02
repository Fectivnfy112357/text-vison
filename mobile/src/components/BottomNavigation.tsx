import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import { 
  HomeOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: <HomeOutlined />
    },
    {
      key: '/generate',
      title: 'AI创作工坊',
      icon: <PlusCircleOutlined />
    },
    {
      key: '/templates',
      title: '模板库',
      icon: <AppstoreOutlined />
    },
    {
      key: '/history',
      title: '历史记录',
      icon: <HistoryOutlined />
    }
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <TabBar
      activeKey={location.pathname}
      onChange={handleTabChange}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
    >
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};

export default BottomNavigation;