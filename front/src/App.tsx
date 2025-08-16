import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { isMobileDevice } from "@/utils/deviceDetection";
import Home from "@/pages/Home";
import Generate from "@/pages/Generate";
import History from "@/pages/History";
import Templates from "@/pages/Templates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function App() {
  const { checkAuth } = useAuthStore();

  // 应用启动时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 设备检测和跳转逻辑
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkDeviceAndRedirect = () => {
      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 防抖：延迟检测，避免频繁触发
      timeoutId = setTimeout(() => {
        if (isMobileDevice()) {
           window.location.href = 'https://www.textvision.top:666/mobile';
         }
      }, 300);
    };
    
    // 初始检测
    checkDeviceAndRedirect();
    
    // 监听窗口大小变化
    const handleResize = () => {
      checkDeviceAndRedirect();
    };
    
    // 监听设备方向变化
    const handleOrientationChange = () => {
      // 延迟一点时间等待屏幕尺寸更新
      setTimeout(checkDeviceAndRedirect, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 清理函数
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/history" element={<History />} />
              <Route path="/templates" element={<Templates />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  cursor: 'default'
                },
                className: 'select-none pointer-events-auto'
              }}
          />
        </div>
      </Router>
  );
}
