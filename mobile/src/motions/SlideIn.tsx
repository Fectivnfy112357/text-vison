import { motion } from 'framer-motion';

export const SlideIn = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 0.5,
  distance = 20 
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
}) => {
  const initialOffset = {
    left: { x: -distance },
    right: { x: distance },
    up: { y: -distance },
    down: { y: distance }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};