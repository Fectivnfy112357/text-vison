import { motion } from 'framer-motion';

export const SlideUp = ({ children, delay = 0, duration = 0.5, distance = 20 }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};