import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { RegisterRequest } from '../lib/api'
import { JellyButton, Float } from '../motions'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    const success = await register(formData)
    if (success) {
      navigate('/', { replace: true })
    }
  }

  const isFormValid = 
    formData.username && 
    formData.email && 
    formData.password && 
    formData.confirmPassword &&
    formData.password === formData.confirmPassword

  const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-4 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
      </motion.div>

      {/* 主内容 */}
      <div className="flex-1 px-6 overflow-y-auto scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center pt-8"
        >
          <h1 className="text-3xl font-bold text-gradient mb-2">创建账户</h1>
          <p className="text-gray-600">加入文生视界，开启AI创作之旅</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 pb-8"
        >
          {/* 用户名输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="input-soft w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>

          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-soft w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500"
                placeholder="请输入邮箱地址"
                required
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="input-soft w-full pl-10 pr-12 py-3 text-gray-900 placeholder-gray-500"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* 确认密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`input-soft w-full pl-10 pr-12 py-3 text-gray-900 placeholder-gray-500 ${
                  passwordMismatch ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                }`}
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordMismatch && (
              <p className="mt-1 text-sm text-red-600">密码不匹配</p>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-3"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* 注册按钮 */}
          <JellyButton
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-semibold shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>注册中...</span>
              </div>
            ) : (
              '注册'
            )}
          </JellyButton>
        </motion.form>

        {/* 登录链接 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-8"
        >
          <p className="text-gray-600">
            已有账户？{' '}
            <Link 
              to="/login" 
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              立即登录
            </Link>
          </p>
        </motion.div>
      </div>

      {/* 装饰元素 */}
      <Float duration={6} delay={0}>
        <div className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-xl" />
      </Float>
      <Float duration={6} delay={2}>
        <div className="absolute bottom-40 left-10 w-16 h-16 bg-gradient-to-tr from-sky-200/30 to-mist-200/30 rounded-full blur-xl" />
      </Float>
    </div>
  )
}

export default Register