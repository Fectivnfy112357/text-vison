import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, MessageCircle, LifeBuoy, Book, Zap, Shield, CreditCard, Users, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Help: React.FC = () => {
      
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const faqData = [
    {
      id: 'getting-started',
      title: '开始使用',
      icon: Book,
      questions: [
        {
          question: '如何开始生成第一张图片？',
          answer: '进入「创作」页面，选择您喜欢的模板或直接使用文本描述，点击「开始生成」即可。系统会自动处理您的请求并在完成后通知您。'
        },
        {
          question: '支持哪些图片格式？',
          answer: '我们支持生成 JPG、PNG、WEBP 格式的图片，默认输出为高质量 JPG 格式。视频内容支持 MP4 格式输出。'
        },
        {
          question: '生成需要多长时间？',
          answer: '简单图片通常需要 10-30 秒，复杂场景可能需要 1-3 分钟。视频生成一般需要 2-5 分钟。具体时间取决于内容复杂度和服务器负载。'
        }
      ]
    },
    {
      id: 'account',
      title: '账户与会员',
      icon: Users,
      questions: [
        {
          question: '如何升级会员？',
          answer: '进入「个人中心」→「会员中心」，选择适合您的会员套餐进行升级。支持微信、支付宝等多种支付方式。'
        },
        {
          question: '会员有哪些特权？',
          answer: '会员享有：每日更多生成次数、高清画质输出、专属模板、优先处理通道、无广告体验等特权。'
        },
        {
          question: '忘记密码怎么办？',
          answer: '在登录页面点击「忘记密码」，通过绑定的邮箱或手机号重置密码。如遇到问题，请联系客服协助处理。'
        }
      ]
    },
    {
      id: 'payment',
      title: '支付与退款',
      icon: CreditCard,
      questions: [
        {
          question: '支持哪些支付方式？',
          answer: '目前支持微信支付、支付宝支付、银行卡支付。所有交易均通过安全加密的支付通道处理。'
        },
        {
          question: '如何申请退款？',
          answer: '购买后7天内，如未使用会员服务，可申请全额退款。联系客服并提供订单号，我们会在3个工作日内处理。'
        },
        {
          question: '会员到期后会怎样？',
          answer: '会员到期后将自动降级为免费用户，但仍可使用基础功能。您的历史创作内容将永久保留在账户中。'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: '常见问题',
      icon: Zap,
      questions: [
        {
          question: '生成失败怎么办？',
          answer: '首先检查网络连接，然后确认提示词是否包含违规内容。如问题持续，请尝试：1) 重新生成 2) 更换模板 3) 联系客服支持。'
        },
        {
          question: '图片质量不满意？',
          answer: '可以尝试：1) 使用更详细的描述 2) 调整高级参数 3) 选择更适合的模板 4) 升级到会员获取高清画质。'
        },
        {
          question: '如何保存生成的内容？',
          answer: '生成完成后，点击图片进入详情页，然后点击「下载」按钮即可保存到手机相册。会员支持批量下载功能。'
        }
      ]
    },
    {
      id: 'privacy',
      title: '隐私与安全',
      icon: Shield,
      questions: [
        {
          question: '我的数据安全吗？',
          answer: '我们采用银行级加密技术保护您的数据，所有创作内容仅您个人可见。除非您主动分享，否则不会泄露给第三方。'
        },
        {
          question: '会存储我的生成记录吗？',
          answer: '是的，为了方便您查看历史创作，我们会安全存储您的生成记录。您可在「历史」页面查看和管理，也可随时删除。'
        },
        {
          question: '如何删除账户数据？',
          answer: '进入「设置」→「隐私安全」→「删除账户」，按照指引操作即可永久删除账户及所有相关数据。此操作不可撤销。'
        }
      ]
    },
    {
      id: 'terms',
      title: '服务条款',
      icon: FileText,
      questions: [
        {
          question: '使用条款有哪些限制？',
          answer: '禁止生成违反法律法规、侵犯他人权益、包含暴力色情等内容。用户需对生成内容负责，违规将暂停服务。'
        },
        {
          question: '版权归属如何规定？',
          answer: '用户生成的内容版权归用户所有，可用于商业用途。但不得将平台服务用于违法活动或批量商业生产。'
        },
        {
          question: '服务中断怎么办？',
          answer: '如因维护需要暂停服务，我们会提前通知。会员用户的服务期将相应延长，确保您的权益不受影响。'
        }
      ]
    }
  ]

  const contactMethods = [
    {
      title: '在线客服',
      description: '工作日 9:00-18:00',
      icon: MessageCircle,
      action: '立即咨询',
      color: 'blue'
    },
    {
      title: '邮件支持',
      description: '24小时内回复',
      icon: LifeBuoy,
      action: '发送邮件',
      color: 'green'
    },
    {
      title: '使用指南',
      description: '完整操作教程',
      icon: Book,
      action: '查看指南',
      color: 'purple'
    }
  ]

  const filteredFaqData = faqData.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0)

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
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
          <h1 className="text-lg font-semibold text-gray-800">帮助中心</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 rotate-180" />
          </button>
        </div>
      </motion.div>

      {/* 搜索栏 */}
      <motion.div 
        className="px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* 快速联系 */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-gray-700 mb-3">联系我们</h2>
          <div className="grid grid-cols-1 gap-3">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`card-soft p-4 flex items-center space-x-3 cursor-pointer hover:shadow-md transition-all`}
              >
                <div className={`p-2 rounded-lg bg-${method.color}-100`}>
                  <method.icon size={20} className={`text-${method.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.title}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ列表 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-medium text-gray-700 mb-3">常见问题</h2>
          <div className="space-y-4">
            {(searchQuery ? filteredFaqData : faqData).map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + sectionIndex * 0.1 }}
                className="card-soft"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <section.icon size={20} className="text-primary-600" />
                    </div>
                    <div className="font-medium text-gray-900">{section.title}</div>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`text-gray-400 transition-transform ${
                      expandedSection === section.id ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 space-y-4">
                      {section.questions.map((item, index) => (
                        <div key={index} className="border-l-2 border-primary-200 pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 服务状态 */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-soft p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-sm text-gray-600">所有服务运行正常</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              最后更新: {new Date().toLocaleString('zh-CN')}
            </div>
          </div>
        </motion.div>

        {/* 版本信息 */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-xs text-gray-500">
            文生视界 v1.0.0
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Help