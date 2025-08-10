import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardHoverProps {
  children: ReactNode;
  lift?: boolean;
  scale?: boolean;
  shadow?: boolean;
}

export const CardHover = ({ children, lift = true, scale = true, shadow = true }: CardHoverProps) => {
  return (
    <motion.div
      whileHover={{
        y: lift ? -4 : 0,
        scale: scale ? 1.02 : 1,
      }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {children}
      {shadow && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
          whileHover={{
            opacity: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};