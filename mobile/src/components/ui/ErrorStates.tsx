import React from 'react'
import { Empty, Button } from 'react-vant'
import { WifiOff, AlertCircle, RefreshCw, Home } from 'lucide-react'
import { clsx } from 'clsx'

// 网络错误组件
interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">网络连接失败</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        请检查您的网络连接，然后重试
      </p>
      {onRetry && (
        <Button
          type="primary"
          onClick={onRetry}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>重试</span>
        </Button>
      )}
    </div>
  )
}

// 服务器错误组件
interface ServerErrorProps {
  message?: string
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
}

export const ServerError: React.FC<ServerErrorProps> = ({
  message = '服务器暂时无法响应',
  onRetry,
  onGoHome,
  className
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">服务异常</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        {message}
      </p>
      <div className="flex space-x-3">
        {onRetry && (
          <Button
            type="primary"
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重试</span>
          </Button>
        )}
        {onGoHome && (
          <Button
            onClick={onGoHome}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </Button>
        )}
      </div>
    </div>
  )
}

// 空状态组件
interface EmptyStateProps {
  title?: string
  description?: string
  image?: string
  action?: {
    text: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description,
  image,
  action,
  className
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      {image ? (
        <img src={image} alt="Empty" className="w-32 h-32 mb-4 opacity-60" />
      ) : (
        <Empty className="mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button
          type="primary"
          onClick={action.onClick}
        >
          {action.text}
        </Button>
      )}
    </div>
  )
}

// 404错误组件
interface NotFoundProps {
  title?: string
  description?: string
  onGoHome?: () => void
  className?: string
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = '页面不存在',
  description = '您访问的页面可能已被删除或不存在',
  onGoHome,
  className
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        {description}
      </p>
      {onGoHome && (
        <Button
          type="primary"
          onClick={onGoHome}
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>返回首页</span>
        </Button>
      )}
    </div>
  )
}

// 权限错误组件
interface PermissionErrorProps {
  title?: string
  description?: string
  onLogin?: () => void
  onGoHome?: () => void
  className?: string
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  title = '访问受限',
  description = '您需要登录后才能访问此功能',
  onLogin,
  onGoHome,
  className
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-yellow-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        {description}
      </p>
      <div className="flex space-x-3">
        {onLogin && (
          <Button
            type="primary"
            onClick={onLogin}
          >
            立即登录
          </Button>
        )}
        {onGoHome && (
          <Button
            onClick={onGoHome}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </Button>
        )}
      </div>
    </div>
  )
}

// 通用错误边界组件
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">出现了一些问题</h2>
      <p className="text-gray-500 text-center mb-4 max-w-md">
        应用遇到了意外错误，请尝试刷新页面
      </p>
      <details className="mb-6 max-w-md">
        <summary className="text-sm text-gray-400 cursor-pointer mb-2">错误详情</summary>
        <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
      <div className="flex space-x-3">
        <Button
          type="primary"
          onClick={resetError}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>重试</span>
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>返回首页</span>
        </Button>
      </div>
    </div>
  )
}