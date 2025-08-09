import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, User, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Privacy: React.FC = () => {
  const navigate = useNavigate()
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    emailVisible: false,
    phoneVisible: false,
    activityVisible: true,
    allowDataCollection: true
  })

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const privacyItems = [
    {
      key: 'profileVisible' as const,
      title: '个人资料可见',
      description: '允许他人查看您的个人资料',
      icon: User
    },
    {
      key: 'emailVisible' as const,
      title: '邮箱可见',
      description: '允许他人查看您的邮箱地址',
      icon: Lock
    },
    {
      key: 'phoneVisible' as const,
      title: '手机号可见',
      description: '允许他人查看您的手机号',
      icon: Shield
    },
    {
      key: 'activityVisible' as const,
      title: '活动记录可见',
      description: '允许他人查看您的创作活动',
      icon: Eye
    },
    {
      key: 'allowDataCollection' as const,
      title: '数据收集',
      description: '允许收集使用情况以改善服务',
      icon: Shield
    }
  ]

  const handleDeleteAccount = () => {
    if (window.confirm('确定要删除账户吗？此操作无法撤销！')) {
      // 实际应用中这里会调用删除账户的API
      alert('账户删除功能需要联系客服处理')
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">隐私安全</h1>
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
          {/* 隐私设置 */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-700">隐私选项</h2>
            {privacyItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-soft p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <item.icon size={20} className="text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePrivacy(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy[item.key] ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 安全选项 */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-700">安全设置</h2>
            <div className="space-y-2">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate('/change-password')}
                className="w-full card-soft p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">修改密码</div>
                    <div className="text-sm text-gray-500">定期更换密码保障账户安全</div>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* 危险操作 */}
          <div className="space-y-4 mt-8">
            <h2 className="text-sm font-medium text-red-600">危险操作</h2>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleDeleteAccount}
              className="w-full card-soft p-4 flex items-center justify-between hover:bg-red-50 transition-colors text-red-600"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="font-medium">删除账户</div>
                  <div className="text-sm">永久删除账户和所有数据</div>
                </div>
              </div>
            </motion.button>
          </div>

          {/* 底部提示 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>安全提示：</strong>请定期检查隐私设置，确保个人信息安全。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy