import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, duration = 0.5 }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};