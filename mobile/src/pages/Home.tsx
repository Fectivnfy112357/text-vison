import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Video,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useAuthStore } from "../store/useAuthStore";
import { Template } from "../lib/api";
import { JellyButton, HoverScale } from "../motions";
import { useAnimationPerformance } from "../hooks/useAnimationPerformance";

// 定义动画 variants 以优化性能
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { popularTemplates, loadPopularTemplates } = useTemplateStore();
  const { isAuthenticated, user } = useAuthStore();
  const { reducedMotion } = useAnimationPerformance();
  const [animatedStats, setAnimatedStats] = useState({
    today: 0,
    total: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    loadPopularTemplates(4);

    // 优化的数字动画 - 使用 requestAnimationFrame
    if (isAuthenticated) {
      const duration = 1500;
      const startTime = performance.now();
      const todayTarget = 12;
      const totalTarget = 156;
      const satisfactionTarget = 89;

      let animationFrameId: number;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 2);

        setAnimatedStats({
          today: Math.floor(todayTarget * easeOut),
          total: Math.floor(totalTarget * easeOut),
          satisfaction: Math.floor(satisfactionTarget * easeOut),
        });

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setAnimatedStats({
            today: todayTarget,
            total: totalTarget,
            satisfaction: satisfactionTarget,
          });
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrameId);
    } else {
      // 未登录时重置为0
      setAnimatedStats({ today: 0, total: 0, satisfaction: 0 });
    }
  }, [isAuthenticated]);

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate("/create");
    }
  };

  const handleTemplateClick = (template: Template) => {
    if (isAuthenticated) {
      navigate("/create", { state: { template } });
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      {/* 静态背景元素 - 性能优化 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none contain-paint">
        <div className="absolute w-40 h-40 bg-gradient-to-br from-primary-100/10 to-secondary-100/10 rounded-full blur-2xl top-10 left-10 transform-gpu" />
        <div className="absolute w-32 h-32 bg-gradient-to-br from-primary-100/10 to-secondary-100/10 rounded-full blur-2xl bottom-20 right-10 transform-gpu" />
      </div>

      {/* 头部区域 - 使用 variants 优化 */}
      <motion.div
        className="relative px-6 pt-8 pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 问候语和统计 */}
        <motion.div className="mb-6" variants={itemVariants}>
          <motion.h1 className="text-2xl font-bold text-gradient mb-2">
            {isAuthenticated
              ? `你好，${user?.nickname || user?.username || "用户"}`
              : "欢迎来到文生视界"}
          </motion.h1>
          <motion.p className="text-gray-600 text-sm">
            {isAuthenticated ? "开始你的创意之旅吧" : "AI驱动的图文生成平台"}
          </motion.p>
        </motion.div>

        {/* 热门搜索词 */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          variants={itemVariants}
        >
          {["国风", "赛博朋克", "油画", "水墨", "像素"].map((tag) => (
            <HoverScale key={tag} scale={1.05}>
              <motion.button
                className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-700 border border-gray-200 transform-gpu"
                variants={itemVariants}
                whileTap={{ scale: reducedMotion ? 1 : 0.95 }}
                onClick={() => navigate("/create", { state: { prompt: tag } })}
                style={{
                  willChange: reducedMotion ? "auto" : "transform",
                }}
              >
                #{tag}
              </motion.button>
            </HoverScale>
          ))}
        </motion.div>

        {/* 用户统计卡片 */}
        {isAuthenticated && (
          <motion.div
            className="grid grid-cols-3 gap-3 mb-6"
            variants={itemVariants}
          >
            <motion.div
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow "
              whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
              style={{
                willChange: reducedMotion ? "auto" : "transform",
              }}
            >
              <div className="text-lg font-bold text-primary-600">
                {animatedStats.today}
              </div>
              <div className="text-xs text-gray-500">今日生成</div>
            </motion.div>
            <motion.div
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow "
              whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
              style={{
                willChange: reducedMotion ? "auto" : "transform",
              }}
            >
              <div className="text-lg font-bold text-secondary-600">
                {animatedStats.total}
              </div>
              <div className="text-xs text-gray-500">总作品</div>
            </motion.div>
            <motion.div
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow "
              whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
              style={{
                willChange: reducedMotion ? "auto" : "transform",
              }}
            >
              <div className="text-lg font-bold text-accent-600">
                {animatedStats.satisfaction}%
              </div>
              <div className="text-xs text-gray-500">满意度</div>
            </motion.div>
          </motion.div>
        )}

        {/* 快速创作按钮 */}
        <motion.div variants={itemVariants}>
          <JellyButton
            onClick={handleCreateClick}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl p-4 mb-6 shadow-glow transform-gpu"
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles size={20} />
              <span className="font-semibold">开始创作</span>
              <ArrowRight size={16} />
            </div>
          </JellyButton>
        </motion.div>
      </motion.div>

      {/* 功能卡片 - 使用 variants 优化 */}
      <motion.div
        className="px-6 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="relative p-8 rounded-2xl border-2 border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg overflow-hidden cursor-pointer flex flex-col justify-center"
            variants={itemVariants}
            whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
            whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
            onClick={() => navigate("/create", { state: { type: "image" } })}
            style={{
              willChange: reducedMotion ? "auto" : "transform",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-100" />
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-primary-500 text-white shadow-lg">
                <Image size={24} />
              </div>
              <h3 className="font-semibold mb-1 text-primary-700">图片生成</h3>
              <p className="text-xs text-primary-600">AI生成精美图片</p>
            </div>
          </motion.div>

          <motion.div
            className="relative p-8 rounded-2xl border-2 border-secondary-400 bg-gradient-to-br from-secondary-50 to-secondary-100 shadow-lg overflow-hidden cursor-pointer flex flex-col justify-center"
            variants={itemVariants}
            whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
            whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
            onClick={() => navigate("/create", { state: { type: "video" } })}
            style={{
              willChange: reducedMotion ? "auto" : "transform",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-primary-500/10 opacity-100" />
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-secondary-500 text-white shadow-lg">
                <Video size={24} />
              </div>
              <h3 className="font-semibold mb-1 text-secondary-700">
                视频生成
              </h3>
              <p className="text-xs text-secondary-600">AI创作动态视频</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 创作灵感 */}
      <motion.div
        className="px-6 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="card-soft p-4" variants={itemVariants}>
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="text-primary-600" size={20} />
            <h3 className="font-semibold text-gray-800">今日灵感</h3>
          </div>
          <div className="space-y-2">
            {[
              "梦幻星空下的城市夜景",
              "赛博朋克风格的街头艺术",
              "国风水墨山水画",
            ].map((inspiration) => (
              <motion.div
                key={inspiration}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors "
                variants={itemVariants}
                whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
                onClick={() =>
                  navigate("/create", { state: { prompt: inspiration } })
                }
                style={{
                  willChange: reducedMotion ? "auto" : "transform",
                }}
              >
                <p className="text-sm text-gray-700">{inspiration}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 热门模板 */}
      <motion.div
        className="px-6 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex items-center space-x-2 mb-4"
          variants={itemVariants}
        >
          <TrendingUp className="text-primary-600" size={20} />
          <h3 className="font-semibold text-gray-800">热门模板</h3>
        </motion.div>

        <div className="space-y-3">
          {popularTemplates?.map((template) => (
            <motion.div
              key={template.id}
              className="card-soft p-4 cursor-pointer hover:shadow-md transition-all "
              variants={itemVariants}
              whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: reducedMotion ? 1 : 0.98 }}
              onClick={() => handleTemplateClick(template)}
              style={{
                willChange: reducedMotion ? "auto" : "transform",
              }}
            >
              {/* 模板图片 */}
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={
                    template.imageUrl ||
                    template.thumbnail ||
                    template.previewImage ||
                    "/placeholder.png"
                  }
                  alt={template.title || template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.png";
                  }}
                />
              </div>

              {/* 模板信息 */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-800 text-base truncate flex-1 pr-2">
                    {template.title || template.name}
                  </h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span>{template.usageCount || 0}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}
                    >
                      <span className="ml-1">{template.category}</span>
                    </span>

                    {template.usageCount > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Zap size={10} />
                        <span className="ml-1">热门</span>
                      </span>
                    )}
                  </div>

                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {popularTemplates?.length === 0 && (
          <motion.div
            className="text-center py-8 text-gray-500"
            variants={itemVariants}
          >
            <Sparkles size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">暂无热门模板</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
