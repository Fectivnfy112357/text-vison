import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string | number
  label: string
  description?: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  value: string | number
  onChange: (value: string | number) => void
  options: Option[]
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  icon?: React.ReactNode
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择',
  className = '',
  disabled = false,
  label,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
      )}
      
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-3 rounded-xl border text-left transition-all duration-300
          bg-white/80 backdrop-blur-sm
          hover:shadow-md focus:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen 
            ? 'border-primary-300 ring-2 ring-primary-100 bg-white' 
            : 'border-gray-200 hover:border-primary-300'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {selectedOption?.icon && (
              <div className="flex-shrink-0">
                {selectedOption.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {selectedOption?.label || placeholder}
              </div>
              {selectedOption?.description && (
                <div className="text-xs text-gray-500 truncate">
                  {selectedOption.description}
                </div>
              )}
            </div>
          </div>
          <ChevronDown 
            size={18} 
            className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* 下拉选项 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute z-50 w-full mt-1 rounded-xl border bg-white/95 backdrop-blur-sm
              shadow-xl max-h-60 overflow-hidden
              ${isOpen ? 'border-primary-200' : 'border-gray-200'}
            `}
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full p-3 text-left transition-all duration-200
                    border-b border-gray-100 last:border-b-0
                    hover:bg-primary-50 focus:bg-primary-50
                    ${value === option.value 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'hover:border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {option.icon && (
                      <div className="flex-shrink-0">
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={`font-medium truncate ${
                          value === option.value ? 'text-primary-700' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </div>
                        {value === option.value && (
                          <Check size={16} className="text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                      {option.description && (
                        <div className={`text-xs mt-1 truncate ${
                          value === option.value ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomSelect