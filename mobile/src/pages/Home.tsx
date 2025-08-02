import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Grid, Image, Tag, Toast } from 'antd-mobile';
import { useAuthStore } from '../store/useAuthStore';

interface Template {
  id: string;
  title: string;
  description: string;
  preview: string;
  category: string;
  tags: string[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const featuredTemplates: Template[] = [
    {
      id: '1',
      title: '科幻风景',
      description: '未来主义风格的科幻场景',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20sci-fi%20landscape%20with%20neon%20lights&image_size=square',
      category: '风景',
      tags: ['科幻', '未来']
    },
    {
      id: '2',
      title: '动漫人物',
      description: '精美的动漫角色设计',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20anime%20character%20portrait&image_size=square',
      category: '人物',
      tags: ['动漫', '人物']
    },
    {
      id: '3',
      title: '抽象艺术',
      description: '现代抽象艺术作品',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20abstract%20art%20colorful&image_size=square',
      category: '艺术',
      tags: ['抽象', '艺术']
    }
  ];

  const handleStartCreation = () => {
    if (!isAuthenticated) {
      Toast.show({
        content: '请先登录后再开始创作',
        position: 'center'
      });
      navigate('/login');
      return;
    }
    navigate('/generate');
  };

  const handleExploreTemplates = () => {
    navigate('/templates');
  };

  const handleTemplateClick = (template: Template) => {
    if (!isAuthenticated) {
      Toast.show({
        content: '请先登录后再使用模板',
        position: 'center'
      });
      navigate('/login');
      return;
    }
    navigate('/generate', { state: { template } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative px-4 pt-12 pb-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            文生视界
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            AI驱动的创意内容生成平台
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            通过先进的人工智能技术，将您的文字描述转化为精美的图像和视频内容
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            color="primary" 
            size="large" 
            block
            onClick={handleStartCreation}
            className="bg-gradient-to-r from-purple-600 to-blue-600 border-0"
          >
            开始创作
          </Button>
          <Button 
            color="default" 
            size="large" 
            block
            onClick={handleExploreTemplates}
          >
            浏览模板
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">核心功能</h2>
        <Grid columns={2} gap={12}>
          <Grid.Item>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-medium text-gray-900 mb-1">AI图像生成</h3>
              <p className="text-xs text-gray-600">文字转图像，创意无限</p>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">🎬</div>
              <h3 className="font-medium text-gray-900 mb-1">AI视频生成</h3>
              <p className="text-xs text-gray-600">文字转视频，动态呈现</p>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900 mb-1">丰富模板</h3>
              <p className="text-xs text-gray-600">精选模板，快速上手</p>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-medium text-gray-900 mb-1">高效处理</h3>
              <p className="text-xs text-gray-600">快速生成，即时预览</p>
            </Card>
          </Grid.Item>
        </Grid>
      </div>

      {/* Template Showcase */}
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">精选模板</h2>
          <Button 
            size="small" 
            fill="none" 
            onClick={handleExploreTemplates}
          >
            查看更多
          </Button>
        </div>
        
        <div className="space-y-3">
          {featuredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="p-0 overflow-hidden"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex">
                <div className="w-20 h-20 flex-shrink-0">
                  <Image
                    src={template.preview}
                    alt={template.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">{template.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Tag key={index} color="primary" fill="outline" className="text-xs">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="px-4 py-6 bg-white mx-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">平台数据</h2>
        <Grid columns={3} gap={12}>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">10K+</div>
              <div className="text-xs text-gray-600">用户数量</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">50K+</div>
              <div className="text-xs text-gray-600">生成作品</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">100+</div>
              <div className="text-xs text-gray-600">精选模板</div>
            </div>
          </Grid.Item>
        </Grid>
      </div>

      {/* Call to Action */}
      <div className="px-4 pb-20">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">开启您的创意之旅</h2>
          <p className="text-sm opacity-90 mb-4">
            加入我们，体验AI创作的无限可能
          </p>
          <Button 
            color="default" 
            size="large" 
            onClick={handleStartCreation}
            className="bg-white text-purple-600 border-0"
          >
            立即开始
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Home;