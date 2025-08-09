import React from 'react'
import { Check } from 'lucide-react'

interface ButtonOption {
  value: string | number
  label: string
  description?: string
  icon?: React.ReactNode
}

interface ButtonSelectProps {
  value: string | number
  onChange: (value: string | number) => void
  options: ButtonOption[]
  className?: string
  disabled?: boolean
  label?: string
  icon?: React.ReactNode
  columns?: 2 | 3 | 4
}

const ButtonSelect: React.FC<ButtonSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  disabled = false,
  label,
  icon,
  columns = 3
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }

  return (
    <div className={className}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
      )}
      
      {/* 按钮选项 */}
      <div className={`grid ${gridCols[columns]} gap-2`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative p-3 rounded-xl border text-center transition-all duration-300
              overflow-hidden group
              disabled:opacity-50 disabled:cursor-not-allowed
              hover-scale-102 active-scale-98
              ${value === option.value
                ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                : 'border-gray-200 bg-white/50 hover:border-primary-300 hover:shadow-md'
              }
            `}
          >
            {/* 背景装饰 */}
            <div className={`
              absolute inset-0 bg-gradient-to-br transition-opacity duration-300
              ${value === option.value
                ? 'from-primary-500/10 to-secondary-500/10 opacity-100'
                : 'from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-50'
              }
            `} />
            
            {/* 内容 */}
            <div className="relative z-10">
              {option.icon && (
                <div className={`mb-2 transition-colors duration-300 ${
                  value === option.value ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                }`}>
                  {option.icon}
                </div>
              )}
              <div className={`font-medium text-sm transition-colors duration-300 ${
                value === option.value ? 'text-primary-700' : 'text-gray-700 group-hover:text-primary-600'
              }`}>
                {option.label}
              </div>
              {option.description && (
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  value === option.value ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-500'
                }`}>
                  {option.description}
                </div>
              )}
              
              {/* 选中指示器 */}
              {value === option.value && (
                <div className="absolute top-2 right-2">
                  <Check size={14} className="text-primary-600" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ButtonSelect