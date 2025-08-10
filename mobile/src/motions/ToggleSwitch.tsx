import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch = ({ isOn, onToggle, disabled = false, className = '' }: ToggleSwitchProps) => {
  return (
    <motion.button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 ${
        isOn ? 'bg-primary-500' : 'bg-gray-300'
      } ${className}`}
      onClick={onToggle}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        animate={{ x: isOn ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
};