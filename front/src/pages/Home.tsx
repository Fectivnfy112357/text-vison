import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Image, Video, Zap, Heart, Star, ArrowRight,
  Users, TrendingUp, Award, Play, Pause, RotateCcw,
  Palette, Wand2, Download, Share2, Lightbulb, Rocket
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTemplateStore } from '@/store/useTemplateStore';
import TemplateCarousel from '@/components/TemplateCarousel';
import TextVisionSVG from '@/components/TextVisionSVG';

// 优雅的背景装饰组件
const ElegantBackground = () => {
  return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 几何装饰元素 */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />

        {/* 精致的线条装饰 */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-30" />
      </div>
  );
};

// 高级特性展示组件
const PremiumFeatureShowcase = () => {
  const features = [
    {
      icon: Wand2,
      title: "智能创作",
      description: "AI驱动的创意生成，让想象力变为现实"
    },
    {
      icon: Palette,
      title: "多样风格",
      description: "从写实到抽象，覆盖各种艺术风格"
    },
    {
      icon: Zap,
      title: "极速生成",
      description: "秒级响应，实时预览创作效果"
    },
    {
      icon: Download,
      title: "高清输出",
      description: "4K超清画质，专业级输出标准"
    }
  ];

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
        ))}
      </div>
  );
};

// 创作流程展示组件
const CreativeProcess = () => {
  const steps = [
    { number: "01", title: "创意构思", description: "描述您的想法和需求" },
    { number: "02", title: "AI分析", description: "智能理解创作意图" },
    { number: "03", title: "内容生成", description: "快速生成视觉作品" },
    { number: "04", title: "优化调整", description: "精细调整达到完美" }
  ];

  return (
      <div className="relative">
        {/* 连接线 */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-pink-200 hidden lg:block" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
              <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative text-center"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-2 border-purple-100 flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {step.number}
              </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
          ))}
        </div>
      </div>
  );
};

// 精美数据展示组件
const StatsDisplay = () => {
  const stats = [
    { value: "10K+", label: "创作作品", icon: TrendingUp },
    { value: "5K+", label: "活跃用户", icon: Users },
    { value: "99%", label: "满意度", icon: Award },
    { value: "24/7", label: "在线服务", icon: Sparkles }
  ];

  return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </motion.div>
        ))}
      </div>
  );
};

export default function Home() {
  const { templates, fetchTemplates } = useTemplateStore();
  const heroRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        {/* 精致的Hero区域 */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <ElegantBackground />

          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="space-y-8"
            >
              {/* 优雅的标题 */}
              <div className="space-y-8">
                {/* SVG文字动画 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8"
                >
                  <TextVisionSVG />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium"
                >
                  让AI为您的创意插上翅膀，将文字转化为令人惊艳的视觉作品
                </motion.p>
              </div>

              {/* 高端按钮组 */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
              >
                <Link
                    to="/generate"
                    className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>开始创作</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    to="/templates"
                    className="group w-full sm:w-auto bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>浏览模板</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* 优雅的滚动指示器 */}
          <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center opacity-60">
              <div className="w-1 h-3 bg-purple-400 rounded-full mt-2" />
            </div>
          </motion.div>
        </section>

        {/* 核心特性展示 */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                强大的AI创作能力
              </motion.h2>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                专业级AI技术，让每个人都能成为创作者
              </motion.p>
            </div>

            <PremiumFeatureShowcase />
          </div>
        </section>

        {/* 创作流程展示 */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                简单的创作流程
              </motion.h2>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                四步完成从想法到作品的转化
              </motion.p>
            </div>

            <CreativeProcess />
          </div>
        </section>

        {/* 精选模板库 */}
        <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                精选模板库
              </motion.h2>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                双向滚动展示，发现更多创作灵感
              </motion.p>
            </div>

            <TemplateCarousel templates={templates} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center mt-16"
            >
              <Link
                  to="/templates"
                  className="group inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>探索所有模板</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 数据统计展示 */}
        <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                创造无限可能
              </motion.h2>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-white/90 max-w-3xl mx-auto"
              >
                与全球创作者一起探索AI艺术的边界
              </motion.p>
            </div>

            <StatsDisplay />
          </div>
        </section>

        {/* 行动召唤 */}
        <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="bg-white rounded-3xl p-12 lg:p-16 shadow-2xl border border-gray-100"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    准备好释放您的创造力了吗？
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                    加入文生视界，体验AI创作的无限魅力
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
                  <Link
                      to="/generate"
                      className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>立即开始</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                      to="/templates"
                      className="group flex items-center justify-center space-x-3 bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Star className="w-5 h-5" />
                    <span>浏览作品</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  );
}