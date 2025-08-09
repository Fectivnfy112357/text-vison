import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Smartphone, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    sound: true,
    vibration: true
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationItems = [
    {
      key: 'push' as const,
      title: '推送通知',
      description: '接收应用内消息提醒',
      icon: Smartphone
    },
    {
      key: 'email' as const,
      title: '邮件通知',
      description: '接收重要更新和提醒邮件',
      icon: Mail
    },
    {
      key: 'sms' as const,
      title: '短信通知',
      description: '接收关键操作的短信提醒',
      icon: Bell
    },
    {
      key: 'sound' as const,
      title: '声音提醒',
      description: '通知时播放提示音',
      icon: Smartphone
    },
    {
      key: 'vibration' as const,
      title: '振动提醒',
      description: '通知时设备振动',
      icon: Smartphone
    }
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
          <h1 className="text-lg font-semibold text-gray-800">通知设置</h1>
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
        <div className="space-y-4">
          {notificationItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-soft p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <item.icon size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.key] ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg">
          <div className="text-sm text-amber-800">
            <strong>提示：</strong>关闭某些通知可能会影响重要功能的正常使用。
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications