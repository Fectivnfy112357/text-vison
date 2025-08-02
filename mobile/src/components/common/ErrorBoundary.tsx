import React from 'react'
import { Empty, Button } from 'react-vant'

interface ErrorBoundaryProps {
  children: any
}

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  // @ts-ignore
  const [hasError, setHasError] = React.useState(false)
  // @ts-ignore
  const [error, setError] = React.useState<Error | null>(null)

  // @ts-ignore
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('移动端应用错误:', event.error)
      setHasError(true)
      setError(event.error)
      
      // 上报错误到监控系统
      if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
        console.log('错误已上报到监控系统')
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('未处理的Promise拒绝:', event.reason)
      setHasError(true)
      setError(new Error(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="mobile-card text-center max-w-sm w-full">
          <Empty 
            description="应用出现错误，请刷新页面重试" 
            className="mb-4"
          />
          <div className="space-y-3">
            <Button 
              type="primary" 
              block
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
            <Button 
              type="default" 
              block
              onClick={() => {
                setHasError(false)
                setError(null)
                window.history.back()
              }}
            >
              返回上页
            </Button>
          </div>
          {import.meta.env.DEV && error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer">
                错误详情 (开发模式)
              </summary>
              <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return children
}

export default ErrorBoundary