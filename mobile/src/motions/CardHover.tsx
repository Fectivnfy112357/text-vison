import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useAnimationPerformance } from '../hooks/useAnimationPerformance';

interface CardHoverProps {
  children: ReactNode;
  lift?: boolean;
  scale?: boolean;
  shadow?: boolean;
}

export const CardHover = ({ children, lift = true, scale = true, shadow = true }: CardHoverProps) => {
  const { reducedMotion, transitionConfig } = useAnimationPerformance();
  
  return (
    <motion.div
      whileHover={{
        y: reducedMotion ? 0 : (lift ? -4 : 0),
        scale: reducedMotion ? 1 : (scale ? 1.02 : 1),
      }}
      transition={transitionConfig}
      className="relative transform-gpu"
      style={{ 
        willChange: reducedMotion ? 'auto' : 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {children}
      {shadow && !reducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
          whileHover={{
            opacity: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          transition={transitionConfig}
          style={{ 
            willChange: 'opacity, box-shadow'
          }}
        />
      )}
    </motion.div>
  );
};