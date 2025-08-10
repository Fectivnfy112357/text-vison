import { motion } from 'framer-motion';

export const Pulse = ({ children, delay = 0, duration = 2 }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) => {
  return (
    <motion.div
      animate={{
        opacity: [1, 0.8, 1],
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