import React from 'react';
import { Tabbar } from 'vant';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: 'home-o',
    },
    {
      key: '/generate',
      title: '生成',
      icon: 'photo-o',
    },
    {
      key: '/templates',
      title: '模板',
      icon: 'apps-o',
    },
    {
      key: '/history',
      title: '历史',
      icon: 'clock-o',
    },
    {
      key: '/settings',
      title: '设置',
      icon: 'setting-o',
    },
  ];

  const handleTabChange = (key: string | number) => {
    navigate(key as string);
  };

  return (
    <Tabbar
      value={location.pathname}
      onChange={handleTabChange}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      safeAreaInsetBottom
    >
      {tabs.map((tab) => (
        <Tabbar.Item
          key={tab.key}
          name={tab.key}
          icon={tab.icon}
        >
          {tab.title}
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
};

export default BottomNavigation;