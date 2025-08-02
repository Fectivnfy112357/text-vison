import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    imageQuality: 'high',
    autoSave: true,
    notifications: true,
    darkMode: false,
    language: 'zh-CN'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const settingSections = [
    {
      title: '生成设置',
      items: [
        {
          key: 'imageQuality',
          label: '图像质量',
          type: 'select',
          options: [
            { value: 'low', label: '低质量 (快速)' },
            { value: 'medium', label: '中等质量' },
            { value: 'high', label: '高质量 (推荐)' },
            { value: 'ultra', label: '超高质量 (慢速)' }
          ]
        }
      ]
    },
    {
      title: '应用设置',
      items: [
        {
          key: 'autoSave',
          label: '自动保存生成的图像',
          type: 'toggle'
        },
        {
          key: 'notifications',
          label: '推送通知',
          type: 'toggle'
        },
        {
          key: 'darkMode',
          label: '深色模式',
          type: 'toggle'
        },
        {
          key: 'language',
          label: '语言',
          type: 'select',
          options: [
            { value: 'zh-CN', label: '简体中文' },
            { value: 'en-US', label: 'English' }
          ]
        }
      ]
    }
  ];

  const handleClearCache = () => {
    console.log('清除缓存');
    // 实现清除缓存逻辑
  };

  const handleExportData = () => {
    console.log('导出数据');
    // 实现数据导出逻辑
  };

  const handleResetSettings = () => {
    if (confirm('确定要重置所有设置吗？')) {
      setSettings({
        imageQuality: 'high',
        autoSave: true,
        notifications: true,
        darkMode: false,
        language: 'zh-CN'
      });
    }
  };

  return (
    <div className="settings-page min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4">
        <h1 className="text-lg font-bold text-center">设置</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              U
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">用户</h3>
              <p className="text-sm text-gray-600">免费版用户</p>
            </div>
          </div>
        </div>

        {/* 设置选项 */}
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="p-4 flex justify-between items-center">
                  <label className="text-gray-700">{item.label}</label>
                  
                  {item.type === 'toggle' && (
                    <button
                      onClick={() => handleSettingChange(item.key, !settings[item.key as keyof typeof settings])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[item.key as keyof typeof settings]
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[item.key as keyof typeof settings]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                  
                  {item.type === 'select' && (
                    <select
                      value={settings[item.key as keyof typeof settings] as string}
                      onChange={(e) => handleSettingChange(item.key, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {item.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 数据管理 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">数据管理</h3>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium text-gray-800">清除缓存</div>
              <div className="text-sm text-gray-600">清除应用缓存数据</div>
            </button>
            
            <button
              onClick={handleExportData}
              className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium text-gray-800">导出数据</div>
              <div className="text-sm text-gray-600">导出历史记录和设置</div>
            </button>
            
            <button
              onClick={handleResetSettings}
              className="w-full text-left p-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
            >
              <div className="font-medium">重置设置</div>
              <div className="text-sm text-red-500">恢复所有设置到默认值</div>
            </button>
          </div>
        </div>

        {/* 关于信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">关于</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>应用版本</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>构建版本</span>
              <span>2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span>开发者</span>
              <span>文生视界团队</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;