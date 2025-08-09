import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Sun, Moon, Monitor, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Appearance: React.FC = () => {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [animations, setAnimations] = useState(true)

  const themes = [
    {
      key: 'light' as const,
      name: '浅色模式',
      icon: Sun,
      description: '明亮的界面，适合日间使用',
      gradient: 'from-white to-gray-50'
    },
    {
      key: 'dark' as const,
      name: '深色模式',
      icon: Moon,
      description: '暗色界面，适合夜间使用',
      gradient: 'from-gray-800 to-gray-900'
    },
    {
      key: 'auto' as const,
      name: '跟随系统',
      icon: Monitor,
      description: '根据系统设置自动切换',
      gradient: 'from-gray-100 to-gray-200'
    }
  ]

  const fontSizes = [
    { key: 'small' as const, name: '小号', size: '14px' },
    { key: 'medium' as const, name: '中号', size: '16px' },
    { key: 'large' as const, name: '大号', size: '18px' }
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">外观设置</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* 主题选择 */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">主题模式</h2>
            <div className="space-y-3">
              {themes.map((t, index) => (
                <motion.button
                  key={t.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setTheme(t.key)}
                  className={`w-full p-4 card-soft flex items-center space-x-4 transition-all ${
                    theme === t.key ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${t.gradient}`}>
                    <t.icon size={24} className={t.key === 'dark' ? 'text-white' : 'text-gray-700'} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.description}</div>
                  </div>
                  {theme === t.key && (
                    <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">字体大小</h2>
            <div className="grid grid-cols-3 gap-3">
              {fontSizes.map((size, index) => (
                <motion.button
                  key={size.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setFontSize(size.key)}
                  className={`card-soft p-3 text-center transition-all ${
                    fontSize === size.key ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">Aa</div>
                  <div className="text-sm text-gray-900">{size.name}</div>
                  <div className="text-xs text-gray-500">{size.size}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 动画效果 */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">动画效果</h2>
            <div className="card-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">动画过渡</div>
                  <div className="text-sm text-gray-500">界面切换时的动画效果</div>
                </div>
                <button
                  onClick={() => setAnimations(!animations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    animations ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      animations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 预览区域 */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">预览效果</h2>
            <div className="card-soft p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">示例文本</div>
                <div className="text-gray-900" style={{ fontSize: fontSizes.find(f => f.key === fontSize)?.size }}>
                  这是一段示例文字，用于展示当前字体大小的效果。
                  您可以根据个人喜好调整字体大小，以获得最佳的阅读体验。
                </div>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>提示：</strong>部分设置可能需要重启应用才能完全生效。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appearance