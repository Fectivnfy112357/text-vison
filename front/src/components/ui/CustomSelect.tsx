import { useState, useRef, useEffect } from 'react';
 import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '请选择...',
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);



  // 获取当前选中的选项
  const selectedOption = options.find(option => option.value === value);

  // 更新下拉框位置 - 绝对位置，考虑页面滚动
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 简化的键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          updateDropdownPosition();
          setIsOpen(true);
        } else if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          updateDropdownPosition();
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDropdownPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      {/* 选择器按钮 */}
      <div
        onClick={handleToggle}
        className={`
          w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
          flex items-center justify-between
          bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm
          ${disabled 
            ? 'border-gray-200 cursor-not-allowed opacity-60' 
            : isOpen 
              ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg shadow-purple-500/10' 
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }
        `}
      >
        <span className={`text-sm ${
          selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'
        }`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 下拉选项 - 使用Portal渲染到body */}
      {isOpen && createPortal(
        <div
          className="absolute z-[99999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: '240px'
          }}
        >
          {/* 选项列表 */}
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                暂无选项
              </div>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value;
                const isFocused = index === focusedIndex;
                
                return (
                  <div
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors duration-150
                      flex items-center justify-between
                      ${isSelected 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                        : isFocused 
                          ? 'bg-purple-50 text-purple-900' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}