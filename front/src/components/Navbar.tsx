import { Link, useLocation } from 'react-router-dom';
import { User, Sparkles, History, Image, Home } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useRef } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const avatarErrorRef = useRef(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/generate', label: '创作', icon: Sparkles },
    { path: '/templates', label: '模板库', icon: Image },
    { path: '/history', label: '历史记录', icon: History },
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };



  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 z-50">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                文生视界TV
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user.avatar && !avatarErrorRef.current ? (
                      <img
                        src={user.avatar}
                        alt={user.username || '用户'}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={() => {
                          avatarErrorRef.current = true;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.username || '用户'}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    登录/注册
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>


      </nav>



      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </>
  );
}