import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const TextVisionSVG = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // TEXT VISION 正确的SVG路径 - 同一行显示，统一间距
  const textPaths = {
    // T
    t: "M 20 50 L 60 50 M 40 50 L 40 90",
    // E (缩短与T的间距)
    e: "M 75 50 L 75 90 M 75 50 L 105 50 M 75 70 L 100 70 M 75 90 L 105 90",
    // X (再缩短间距，左移)
    x: "M 120 50 L 150 90 M 150 50 L 120 90",
    // T (调整间距为15px)
    t2: "M 165 50 L 205 50 M 185 50 L 185 90",
    // 空格
    
    // V (右移确保与T字母20px间距)
    v: "M 240 50 L 255 90 M 270 50 L 255 90",
    // I (直接使用line元素，不需要path)
    // S (绘制成2的形状)
    s: "M 325 50 L 345 50 M 345 50 L 345 70 M 345 70 L 325 70 M 325 70 L 325 90 M 325 90 L 345 90",
    // I (在S和O之间，增加间距)
    i2: "M 370 50 L 380 50 M 375 50 L 375 90 M 370 90 L 380 90",
    // O (调整位置确保统一间距)
    o: "M 400 50 L 420 50 L 420 90 L 400 90 L 400 50",
    // N (调整位置确保统一间距)
    n: "M 440 50 L 440 90 M 440 50 L 465 90 M 465 50 L 465 90"
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimating) {
          setIsAnimating(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      <svg
        viewBox="0 0 485 120"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* TEXT - 每个字母分别动画 */}
        <motion.path
          d={textPaths.t}
          fill="none"
          stroke="url(#textGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        
        <motion.path
          d={textPaths.e}
          fill="none"
          stroke="url(#textGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 0.7
          }}
        />
        
        <motion.path
          d={textPaths.x}
          fill="none"
          stroke="url(#textGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 1.1
          }}
        />
        
        <motion.path
          d={textPaths.t2}
          fill="none"
          stroke="url(#textGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        

        
        {/* VISION - 每个字母分别动画 */}
        <motion.path
          d={textPaths.v}
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        
        {/* I 字母 - 完整结构：上横线 + 竖线 + 下横线 */}
        <motion.path
          d="M 290 50 L 300 50 M 295 50 L 295 90 M 290 90 L 300 90"
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 0.7
          }}
        />
        
        <motion.path
          d={textPaths.s}
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0, rotate: 0, scaleX: 1 }}
          animate={{ 
            pathLength: isAnimating ? 1 : 0, 
            opacity: isAnimating ? 1 : 0,
            rotate: isAnimating ? 180 : 0,
            scaleX: isAnimating ? -1 : 1
          }}
          transition={{ 
            pathLength: { duration: 0.3, ease: "easeInOut", delay: 1.9 },
            opacity: { duration: 0.3, ease: "easeInOut", delay: 1.9 },
            rotate: { duration: 0.4, ease: "easeInOut", delay: 2.2 },
            scaleX: { duration: 0.4, ease: "easeInOut", delay: 2.6 }
          }}
          style={{ transformOrigin: "340px 70px" }}
        />
        
        {/* I 字母 - 在S和O之间 */}
        <motion.path
          d={textPaths.i2}
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 1.3
          }}
        />
        
                
        <motion.path
          d={textPaths.o}
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 1.1
          }}
        />
        
        <motion.path
          d={textPaths.n}
          fill="none"
          stroke="url(#visionGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isAnimating ? 1 : 0, opacity: isAnimating ? 1 : 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: 2.3
          }}
        />

        {/* 颜色定义 */}
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#d8b4fe" />
          </linearGradient>
          <linearGradient id="visionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          

          {/* 发光效果 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default TextVisionSVG;