import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useAnimationPerformance } from '../hooks/useAnimationPerformance';

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  disabled?: boolean;
}

export const HoverScale = ({ children, scale = 1.02, disabled = false }: HoverScaleProps) => {
  const { reducedMotion, transitionConfig } = useAnimationPerformance();
  
  if (disabled || reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      whileHover={{ scale }}
      transition={transitionConfig}
      className="transform-gpu"
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {children}
    </motion.div>
  );
};