import React, { useState } from 'react';

interface HistoryItem {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  status: 'completed' | 'failed';
}

const History: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const historyItems: HistoryItem[] = [
    {
      id: 1,
      prompt: '一只可爱的橘色小猫，大眼睛，毛茸茸，卡通风格',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20cat%20cartoon&image_size=square',
      createdAt: '2024-01-15 14:30',
      status: 'completed'
    },
    {
      id: 2,
      prompt: '梦幻森林，紫色光芒，神秘氛围，高质量渲染',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20forest%20purple%20light&image_size=square',
      createdAt: '2024-01-15 13:45',
      status: 'completed'
    },
    {
      id: 3,
      prompt: '未来科幻城市，霓虹灯，高楼大厦，赛博朋克风格',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20future%20city%20neon&image_size=square',
      createdAt: '2024-01-15 12:20',
      status: 'completed'
    }
  ];

  const handleItemClick = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleRegenerate = (prompt: string) => {
    console.log('重新生成:', prompt);
    // 这里可以导航到生成页面并填入prompt
  };

  const handleDelete = (id: number) => {
    console.log('删除项目:', id);
    // 这里实现删除逻辑
  };

  return (
    <div className="history-page min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4">
        <h1 className="text-lg font-bold text-center">历史记录</h1>
      </div>

      <div className="p-4">
        {/* 统计信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{historyItems.length}</div>
              <div className="text-xs text-gray-600">总计</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {historyItems.filter(item => item.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">成功</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {historyItems.filter(item => item.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-600">失败</div>
            </div>
          </div>
        </div>

        {/* 历史记录列表 */}
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-3">
                <img
                  src={item.imageUrl}
                  alt="Generated"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2 mb-1">
                    {item.prompt}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.createdAt}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {item.status === 'completed' ? '成功' : '失败'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">还没有生成记录</p>
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg">
              开始创作
            </button>
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">详细信息</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <img
                src={selectedItem.imageUrl}
                alt="Generated"
                className="w-full rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">提示词</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                    {selectedItem.prompt}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">创建时间</label>
                  <p className="text-sm text-gray-600">{selectedItem.createdAt}</p>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleRegenerate(selectedItem.prompt)}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg text-sm"
                  >
                    重新生成
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;