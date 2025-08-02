import React, { useEffect } from 'react';
import { shouldRedirectToDesktop, getDesktopUrl, setDevicePreference } from '@/utils/deviceDetection';

function App() {
  useEffect(() => {
    if (shouldRedirectToDesktop()) {
      const confirmed = window.confirm('检测到您正在使用桌面设备，是否切换到桌面版本以获得更好的体验？');
      if (confirmed) {
        window.location.href = getDesktopUrl();
      } else {
        setDevicePreference('mobile');
      }
    }
  }, []);

  return (
    <div className="app min-h-screen bg-gray-50 pb-16">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">移动端应用</h1>
        <p className="text-center text-gray-600">设备检测和跳转功能已实现</p>
        <div className="mt-8 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">功能说明：</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>PC端访问时会提示切换到移动版</li>
            <li>移动端访问时会提示切换到桌面版</li>
            <li>支持手动切换版本偏好设置</li>
            <li>防止无限重定向循环</li>
          </ul>
        </div>
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <button 
            onClick={() => {
              const confirmed = window.confirm('确定要切换到桌面版本吗？');
              if (confirmed) {
                window.location.href = getDesktopUrl();
              }
            }}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            手动切换到桌面版
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
