import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { shouldRedirectToMobile, getMobileUrl, setDevicePreference } from "@/utils/deviceDetection";
import Home from "@/pages/Home";
import Generate from "@/pages/Generate";
import History from "@/pages/History";
import Templates from "@/pages/Templates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function App() {
  const { checkAuth } = useAuthStore();
  const [showMobileSuggestion, setShowMobileSuggestion] = useState(false);

  // 应用启动时检查认证状态和设备类型
  useEffect(() => {
    checkAuth();
    
    // 检查是否应该跳转到移动端
    if (shouldRedirectToMobile()) {
      setShowMobileSuggestion(true);
    }
  }, [checkAuth]);

  const handleRedirectToMobile = () => {
    window.location.href = getMobileUrl();
  };

  const handleStayOnDesktop = () => {
    setDevicePreference('desktop');
    setShowMobileSuggestion(false);
  };

  const handleDismiss = () => {
    setShowMobileSuggestion(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        {/* 移动端建议提示 */}
        {showMobileSuggestion && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">检测到您正在使用移动设备</p>
                  <p className="text-sm text-blue-100">我们为移动设备优化了专门的界面，体验更佳</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRedirectToMobile}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  切换到移动版
                </button>
                <button
                  onClick={handleStayOnDesktop}
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  继续使用桌面版
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-blue-100 hover:text-white p-1 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <Navbar />
        <main>
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
          closeButton
          toastOptions={{
            style: {
              pointerEvents: 'auto',
              userSelect: 'none',
              cursor: 'default',
              touchAction: 'none',
              WebkitUserDrag: 'none',
              userDrag: 'none',
              WebkitTouchCallout: 'none',
              KhtmlUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              draggable: false
            },
            className: 'select-none pointer-events-auto'
          }}
        />
      </div>
    </Router>
  );
}
