import React from 'react';
import { Heart, Github, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-100 pb-4">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/static/home4.jpg')",
          backgroundPosition: 'top'
        }}
      />
      {/* 淡色蒙版 */}
      <div className="absolute inset-0 bg-white/40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              文生视界
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              让创意无界,让想象成真。
              通过AI技术,将您的文字描述转化为精美的视觉作品

            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                aria-label="邮箱"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                aria-label="电话"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-gray-900 mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  首页
                </a>
              </li>
              <li>
                <a href="/generate" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  AI创作
                </a>
              </li>
              <li>
                <a href="/templates" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  模板库
                </a>
              </li>
              <li>
                <a href="/history" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  历史记录
                </a>
              </li>
            </ul>
          </div>

          {/* 帮助支持 */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-gray-900 mb-4">帮助支持</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  使用指南
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  常见问题
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  联系我们
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  意见反馈
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 分割线 */}
        <div className="border-t border-purple-100 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 文生视界. 保留所有权利.
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500" />
              <span>by 文生视界团队</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;