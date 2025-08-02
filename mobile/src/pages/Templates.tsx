import React, { useState } from 'react';

interface Template {
  id: number;
  title: string;
  description: string;
  prompt: string;
  category: string;
  imageUrl: string;
}

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '动物', '风景', '人物', '科幻', '艺术'];

  const templates: Template[] = [
    {
      id: 1,
      title: '可爱小猫',
      description: '萌萌的小猫咪',
      prompt: '一只可爱的橘色小猫，大眼睛，毛茸茸，卡通风格',
      category: '动物',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20cat%20cartoon&image_size=square'
    },
    {
      id: 2,
      title: '梦幻森林',
      description: '神秘的魔法森林',
      prompt: '梦幻森林，紫色光芒，神秘氛围，高质量渲染',
      category: '风景',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20forest%20purple%20light&image_size=square'
    },
    {
      id: 3,
      title: '未来城市',
      description: '科幻未来都市',
      prompt: '未来科幻城市，霓虹灯，高楼大厦，赛博朋克风格',
      category: '科幻',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20future%20city%20neon&image_size=square'
    }
  ];

  const filteredTemplates = selectedCategory === '全部' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template: Template) => {
    // 这里可以导航到生成页面并填入模板的prompt
    console.log('使用模板:', template.prompt);
  };

  return (
    <div className="templates-page min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4">
        <h1 className="text-lg font-bold text-center">精选模板</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 分类筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">分类</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={template.imageUrl}
                alt={template.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{template.title}</h4>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 mb-3">
                  <strong>提示词：</strong>{template.prompt}
                </div>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium"
                >
                  使用此模板
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">该分类下暂无模板</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;