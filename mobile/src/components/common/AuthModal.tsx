import * as React from 'react'
import { Popup, Form, Field, Button, Toast, Radio, RadioGroup } from 'react-vant'
import { useUserStore } from '../../store'

interface AuthModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const AuthModal = ({ visible, onClose, onSuccess }: AuthModalProps) => {
  // @ts-ignore
  const [activeTab, setActiveTab] = React.useState<'login' | 'register'>('login')
  // @ts-ignore
  const [loading, setLoading] = React.useState(false)
  // @ts-ignore
  const [registerType, setRegisterType] = React.useState<'email' | 'phone'>('email')
  const { login, register } = useUserStore()

  // 登录表单数据
  // @ts-ignore
  const [loginForm, setLoginForm] = React.useState({
    email: '',
    password: ''
  })

  // 注册表单数据
  // @ts-ignore
  const [registerForm, setRegisterForm] = React.useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    verificationCode: ''
  })

  // 表单验证规则
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateName = (name: string) => {
    return name.length >= 2 && name.length <= 20
  }

  // 处理登录
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Toast.fail('请填写完整信息')
      return
    }

    if (!validateEmail(loginForm.email)) {
      Toast.fail('请输入正确的邮箱格式')
      return
    }

    if (!validatePassword(loginForm.password)) {
      Toast.fail('密码长度至少6位')
      return
    }

    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      Toast.success('登录成功！')
      onSuccess()
      // 重置表单
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      console.error('登录失败:', error)
      Toast.fail(error instanceof Error ? error.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理注册
  const handleRegister = async () => {
    // 基础字段验证
    if (!registerForm.name || !registerForm.password || !registerForm.confirmPassword) {
      Toast.fail('请填写完整信息')
      return
    }

    // 根据注册类型验证邮箱或手机号
    if (registerType === 'email') {
      if (!registerForm.email) {
        Toast.fail('请输入邮箱地址')
        return
      }
      if (!validateEmail(registerForm.email)) {
        Toast.fail('请输入正确的邮箱格式')
        return
      }
    } else {
      if (!registerForm.phone) {
        Toast.fail('请输入手机号码')
        return
      }
      if (!validatePhone(registerForm.phone)) {
        Toast.fail('请输入正确的手机号码格式')
        return
      }
      if (!registerForm.verificationCode) {
        Toast.fail('请输入验证码')
        return
      }
    }

    if (!validateName(registerForm.name)) {
      Toast.fail('用户名长度应在2-20个字符之间')
      return
    }

    if (!validatePassword(registerForm.password)) {
      Toast.fail('密码长度至少6位')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Toast.fail('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      // 根据注册类型调用不同的注册方法
      const identifier = registerType === 'email' ? registerForm.email : registerForm.phone
      await register(identifier, registerForm.password, registerForm.name, registerForm.confirmPassword)
      Toast.success('注册成功！')
      onSuccess()
      // 重置表单
      setRegisterForm({ 
        email: '', 
        phone: '', 
        password: '', 
        confirmPassword: '', 
        name: '',
        verificationCode: ''
      })
    } catch (error) {
      console.error('注册失败:', error)
      Toast.fail(error instanceof Error ? error.message : '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  // @ts-ignore
  const [codeSending, setCodeSending] = React.useState(false)
  // @ts-ignore
  const [countdown, setCountdown] = React.useState(0)

  const sendVerificationCode = async () => {
    if (!registerForm.phone) {
      Toast.fail('请先输入手机号码')
      return
    }

    if (!validatePhone(registerForm.phone)) {
      Toast.fail('请输入正确的手机号码格式')
      return
    }

    setCodeSending(true)
    try {
      const { authAPI } = await import('../../lib/api')
      await authAPI.sendVerificationCode(registerForm.phone)
      Toast.success('验证码已发送')
      
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败:', error)
      Toast.fail(error instanceof Error ? error.message : '发送验证码失败，请重试')
    } finally {
      setCodeSending(false)
    }
  }

  // 处理弹窗关闭
  const handleClose = () => {
    if (loading) return
    onClose()
    // 延迟重置表单，避免关闭动画时看到表单重置
    setTimeout(() => {
      setLoginForm({ email: '', password: '' })
      setRegisterForm({ 
        email: '', 
        phone: '', 
        password: '', 
        confirmPassword: '', 
        name: '',
        verificationCode: ''
      })
      setActiveTab('login')
      setRegisterType('email')
      setCountdown(0)
    }, 300)
  }

  return (
    <Popup
      visible={visible}
      onClose={handleClose}
      position="bottom"
      round
      closeable
      closeIcon="close"
      className="auth-modal backdrop-blur-md"
    >
      <div className="p-6 pb-8 bg-gradient-to-br from-white/95 to-mist-50/95 backdrop-blur-md">
        {/* 标题 - 果冻感设计 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mist-400 to-sky-400 rounded-full mb-4 shadow-lg shadow-mist-200/50">
            <span className="text-2xl animate-bounce-soft">
              {activeTab === 'login' ? '🎨' : '✨'}
            </span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mist-600 to-sky-600 bg-clip-text text-transparent mb-2">
            {activeTab === 'login' ? '欢迎回来' : '加入我们'}
          </h2>
          <p className="text-mist-600">
            {activeTab === 'login' ? '登录您的账户继续创作' : '创建账户开始您的AI创作之旅'}
          </p>
        </div>

        {/* 标签切换 - 果冻感设计 */}
        <div className="mb-6">
          <div className="flex bg-white/60 border border-mist-200/50 rounded-xl p-1 mb-4 backdrop-blur-sm shadow-lg shadow-mist-100/50">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-mist-400 to-sky-400 text-white shadow-lg shadow-mist-200/50 transform scale-105'
                  : 'text-mist-600 hover:text-mist-800 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('login')}
            >
              <span className="flex items-center justify-center">
                <span className="mr-1">🔑</span>
                登录
              </span>
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-mist-400 to-sky-400 text-white shadow-lg shadow-mist-200/50 transform scale-105'
                  : 'text-mist-600 hover:text-mist-800 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('register')}
            >
              <span className="flex items-center justify-center">
                <span className="mr-1">🌟</span>
                注册
              </span>
            </button>
          </div>

          {activeTab === 'login' ? (
            <div className="pt-4">
              <Form>
                <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    name="email"
                    label="邮箱"
                    placeholder="请输入邮箱地址"
                    value={loginForm.email}
                    onChange={(value) => setLoginForm({ ...loginForm, email: value })}
                    type="email"
                    clearable
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <div className="mb-6 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    value={loginForm.password}
                    onChange={(value) => setLoginForm({ ...loginForm, password: value })}
                    type="password"
                    clearable
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleLogin}
                  className="h-12 text-lg font-semibold bg-gradient-to-r from-mist-500 to-sky-500 border-none shadow-lg shadow-mist-200/50 hover:shadow-xl hover:shadow-mist-300/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    登录
                  </span>
                </Button>
              </Form>
            </div>
          ) : (
            <div className="pt-4">
              <Form>
                {/* 注册方式选择 - 果冻感设计 */}
                <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <div className="text-sm font-medium text-mist-700 mb-3">注册方式</div>
                  <RadioGroup 
                    value={registerType} 
                    onChange={(value) => setRegisterType(value as 'email' | 'phone')}
                    direction="horizontal"
                    className="space-x-4"
                  >
                    <Radio name="email" className="text-mist-600">
                      <span className="flex items-center">
                        <span className="mr-1">📧</span>
                        邮箱注册
                      </span>
                    </Radio>
                    <Radio name="phone" className="text-mist-600">
                      <span className="flex items-center">
                        <span className="mr-1">📱</span>
                        手机注册
                      </span>
                    </Radio>
                  </RadioGroup>
                </div>

                <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    name="name"
                    label="用户名"
                    placeholder="请输入用户名（2-20个字符）"
                    value={registerForm.name}
                    onChange={(value: string) => setRegisterForm({ ...registerForm, name: value })}
                    clearable
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>

                {registerType === 'email' ? (
                  <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                    <Field
                      name="email"
                      label="邮箱"
                      placeholder="请输入邮箱地址"
                      value={registerForm.email}
                      onChange={(value: string) => setRegisterForm({ ...registerForm, email: value })}
                      type="email"
                      clearable
                      required
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(177, 151, 252, 0.2)',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                      <Field
                        name="phone"
                        label="手机号"
                        placeholder="请输入手机号码"
                        value={registerForm.phone}
                        onChange={(value: string) => setRegisterForm({ ...registerForm, phone: value })}
                        type="tel"
                        clearable
                        required
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(177, 151, 252, 0.2)',
                          borderRadius: '12px'
                        }}
                      />
                    </div>
                    <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                      <Field
                        name="verificationCode"
                        label="验证码"
                        placeholder="请输入验证码"
                        value={registerForm.verificationCode}
                        onChange={(value: string) => setRegisterForm({ ...registerForm, verificationCode: value })}
                        clearable
                        required
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(177, 151, 252, 0.2)',
                          borderRadius: '12px'
                        }}
                        rightIcon={
                          <Button
                            size="small"
                            type={countdown > 0 ? 'default' : 'primary'}
                            loading={codeSending}
                            disabled={countdown > 0}
                            onClick={sendVerificationCode}
                            className="text-xs bg-gradient-to-r from-mist-400 to-sky-400 border-none text-white"
                          >
                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                          </Button>
                        }
                      />
                    </div>
                  </>
                )}

                <div className="mb-4 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    name="password"
                    label="密码"
                    placeholder="请输入密码（至少6位）"
                    value={registerForm.password}
                    onChange={(value: string) => setRegisterForm({ ...registerForm, password: value })}
                    type="password"
                    clearable
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <div className="mb-6 p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    name="confirmPassword"
                    label="确认密码"
                    placeholder="请再次输入密码"
                    value={registerForm.confirmPassword}
                    onChange={(value: string) => setRegisterForm({ ...registerForm, confirmPassword: value })}
                    type="password"
                    clearable
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleRegister}
                  className="h-12 text-lg font-semibold bg-gradient-to-r from-mist-500 to-sky-500 border-none shadow-lg shadow-mist-200/50 hover:shadow-xl hover:shadow-mist-300/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">✨</span>
                    注册
                  </span>
                </Button>
              </Form>
            </div>
          )}
        </div>

        {/* 底部提示 - 果冻感设计 */}
        <div className="text-center text-sm text-mist-500 mt-6">
          <div className="p-3 bg-white/40 border border-mist-200/30 rounded-lg backdrop-blur-sm">
            <p>
              {activeTab === 'login' ? '还没有账户？' : '已有账户？'}
              <button
                className="text-mist-600 font-medium ml-1 hover:text-mist-800 transition-colors duration-200"
                onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
              >
                {activeTab === 'login' ? '立即注册 →' : '立即登录 →'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Popup>
  )
}

export default AuthModal