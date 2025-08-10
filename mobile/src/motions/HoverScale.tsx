import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  disabled?: boolean;
}

export const HoverScale = ({ children, scale = 1.02, disabled = false }: HoverScaleProps) => {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};