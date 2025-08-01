import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
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

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Navbar />
        <main className="pb-20 lg:pb-0">
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
