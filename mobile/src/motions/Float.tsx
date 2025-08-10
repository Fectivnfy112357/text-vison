import { motion } from 'framer-motion';

export const Float = ({ children, delay = 0, duration = 6, distance = 10 }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
}) => {
  return (
    <motion.div
      animate={{
        y: [-distance, 0, -distance],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};