import React from 'react'
import { Loading, Skeleton } from 'react-vant'
import { clsx } from 'clsx'

// 全屏加载组件
interface FullScreenLoadingProps {
  visible: boolean
  text?: string
  type?: 'spinner' | 'circular'
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  visible,
  text = '加载中...',
  type = 'spinner'
}) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <Loading type={type} size="24px" />
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </div>
  )
}

// 内联加载组件
interface InlineLoadingProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  className?: string
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'medium',
  text,
  className
}) => {
  const sizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px'
  }

  return (
    <div className={clsx('flex items-center justify-center space-x-2 py-4', className)}>
      <Loading size={sizeMap[size]} />
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  )
}

// 按钮加载状态
interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'primary' | 'secondary' | 'danger'
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  disabled,
  className,
  type = 'primary'
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px]'
  
  const typeClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(baseClasses, typeClasses[type], className)}
    >
      {loading && <Loading size="16px" />}
      <span>{children}</span>
    </button>
  )
}

// 卡片骨架屏
interface CardSkeletonProps {
  rows?: number
  avatar?: boolean
  title?: boolean
  className?: string
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  rows = 3,
  avatar = false,
  title = true,
  className
}) => {
  return (
    <div className={clsx('p-4 bg-white rounded-lg', className)}>
      <div className="flex items-start space-x-3">
        {avatar && (
          <Skeleton.Avatar size="40px" />
        )}
        <div className="flex-1 space-y-2">
          {title && (
            <Skeleton.Title />
          )}
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton.Paragraph key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 列表骨架屏
interface ListSkeletonProps {
  count?: number
  avatar?: boolean
  title?: boolean
  rows?: number
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  avatar = true,
  title = true,
  rows = 2
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton
          key={index}
          avatar={avatar}
          title={title}
          rows={rows}
        />
      ))}
    </div>
  )
}

// 网格骨架屏
interface GridSkeletonProps {
  count?: number
  columns?: number
  aspectRatio?: 'square' | 'portrait' | 'landscape'
}

export const GridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 6,
  columns = 2,
  aspectRatio = 'square'
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className={clsx('w-full bg-gray-200 rounded-lg animate-pulse', aspectClasses[aspectRatio])} />
          <Skeleton.Title />
          <Skeleton.Paragraph />
        </div>
      ))}
    </div>
  )
}

// 图片加载骨架屏
interface ImageSkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width,
  height,
  className,
  aspectRatio = 'square'
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }

  const style = {
    width: width || undefined,
    height: height || undefined
  }

  return (
    <div 
      className={clsx(
        'bg-gray-200 rounded-lg animate-pulse',
        !width && !height && aspectClasses[aspectRatio],
        className
      )}
      style={style}
    />
  )
}

// 页面加载骨架屏
export const PageSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <Skeleton.Title />
        <Skeleton.Avatar size="32px" />
      </div>
      
      {/* 搜索栏 */}
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
      
      {/* 标签栏 */}
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      
      {/* 内容区域 */}
      <GridSkeleton count={6} columns={2} />
    </div>
  )
}