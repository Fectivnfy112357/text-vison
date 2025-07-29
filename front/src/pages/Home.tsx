import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Image, Video, Zap, Heart, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTemplateStore } from '@/store/useTemplateStore';
import TemplateCarousel from '@/components/TemplateCarousel';

export default function Home() {
  const { templates, fetchTemplates } = useTemplateStore();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Sparkles,
      title: 'AI智能生成',
      description: '先进的AI技术，将您的文字描述转化为精美的视觉作品'
    },
    {
      icon: Image,
      title: '高质量图片',
      description: '生成高分辨率、专业级别的图片，满足各种创作需求'
    },
    {
      icon: Video,
      title: '动态视频',
      description: '创造引人入胜的动态视频内容，让您的创意动起来'
    },
    {
      icon: Zap,
      title: '快速生成',
      description: '秒级响应，快速生成，让创意不再等待'
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-blue-100/50 to-pink-100/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                文生视界
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              让AI为您的创意插上翅膀，将文字转化为令人惊艳的视觉作品
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/generate"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                开始创作
              </Link>
              
              <Link
                to="/templates"
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                浏览模板
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              为什么选择文生视界？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们致力于为您提供最先进的AI创作工具，让每个人都能轻松创造出专业级的视觉内容
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`text-center p-6 rounded-2xl transition-all duration-300 ${
                    currentFeature === index
                      ? 'bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg scale-105'
                      : 'bg-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    currentFeature === index
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                      : 'bg-gradient-to-br from-purple-400 to-blue-400'
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              精选模板库
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              从我们精心策划的模板库中获取灵感，一键应用即可开始创作
            </p>
          </div>
          
          <TemplateCarousel templates={templates} />
          
          <div className="text-center mt-12">
            <Link
              to="/templates"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <span>查看更多模板</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">创作作品</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-lg opacity-90">活跃用户</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-lg opacity-90">用户满意度</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              准备好释放您的创造力了吗？
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              加入文生视界，开启您的AI创作之旅
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-5 h-5" />
              <span>立即开始创作</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}