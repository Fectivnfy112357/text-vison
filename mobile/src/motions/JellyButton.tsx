import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface JellyButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  initial?: any;
  animate?: any;
  transition?: any;
}

export const JellyButton = ({ children, className, onClick, disabled, type = 'button', initial, animate, transition }: JellyButtonProps) => {
  return (
    <motion.button
      className={`relative overflow-hidden rounded-2xl ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};