import { motion } from 'framer-motion';

export const ScaleIn = ({ children, delay = 0, duration = 0.3, initialScale = 0.8 }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};