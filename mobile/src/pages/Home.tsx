import React from 'react';
import { NavBar, Grid, GridItem, Button, Space, Card, Divider } from 'vant';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🎨',
      title: '智能生成',
      desc: '文本转图像',
      path: '/generate'
    },
    {
      icon: '📋',
      title: '精选模板',
      desc: '快速创作',
      path: '/templates'
    },
    {
      icon: '📚',
      title: '历史记录',
      desc: '作品管理',
      path: '/history'
    },
    {
      icon: '⚙️',
      title: '参数设置',
      desc: '个性定制',
      path: '/settings'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="home-page">
      {/* 顶部导航 */}
      <NavBar
        title="文生视界"
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      />

      {/* 主要内容 */}
      <div className="p-4 space-y-6">
        {/* 欢迎卡片 */}
        <Card className="welcome-card">
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎨</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              欢迎使用文生视界
            </h2>
            <p className="text-gray-600 text-sm">
              AI驱动的文本到图像生成工具
            </p>
          </div>
        </Card>

        {/* 功能网格 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            核心功能
          </h3>
          <Grid columns={2} gutter={12}>
            {features.map((feature, index) => (
              <GridItem key={index}>
                <Card 
                  className="feature-card touch-target cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </div>

        {/* 快速开始 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            快速开始
          </h3>
          <Space direction="vertical" size="large" className="w-full">
            <Button 
              type="primary" 
              size="large" 
              block
              className="touch-target bg-gradient-to-r from-blue-500 to-purple-600 border-none"
              onClick={() => navigate('/generate')}
            >
              开始创作
            </Button>
            <Button 
              size="large" 
              block
              className="touch-target"
              onClick={() => navigate('/templates')}
            >
              浏览模板
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 底部信息 */}
        <div className="text-center text-xs text-gray-500 pb-4">
          <p>移动端专用版本</p>
          <p className="mt-1">为触屏设备优化设计</p>
        </div>
      </div>
    </div>
  );
};

export default Home;