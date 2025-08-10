import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useAnimationPerformance } from '../hooks/useAnimationPerformance';

interface JellyButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  initial?: any;
  animate?: any;
  transition?: any;
}

export const JellyButton = ({ children, className, onClick, disabled, type = 'button', initial, animate, transition }: JellyButtonProps) => {
  const { reducedMotion } = useAnimationPerformance();
  
  return (
    <motion.button
      className={`relative overflow-hidden rounded-2xl transform-gpu ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
      whileTap={{ scale: reducedMotion ? 1 : 0.95 }}
      initial={initial}
      animate={animate}
      transition={transition}
      style={{ 
        willChange: reducedMotion ? 'auto' : 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {/* 优化：使用 background-position 替代绝对定位动画 */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ backgroundPosition: '0% 0%' }}
          whileHover={{ backgroundPosition: '200% 0%' }}
          transition={{ 
            duration: 0.5,
            ease: 'linear'
          }}
          style={{
            backgroundSize: '200% 100%',
            willChange: 'background-position'
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};