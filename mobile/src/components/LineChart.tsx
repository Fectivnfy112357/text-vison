import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ChartData {
  date: string
  total: number
  completed: number
}

interface LineChartProps {
  data: ChartData[]
  height?: number
  width?: number
  className?: string
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  height = 200, 
  width = 400,
  className = '' 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parentWidth = svgRef.current.parentElement.clientWidth
        setDimensions({
          width: parentWidth,
          height
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    // 启动动画
    setTimeout(() => setIsAnimating(true), 100)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  // 计算图表的边距和绘图区域
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const chartWidth = dimensions.width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // 找到数据的最大值用于缩放
  const maxValue = Math.max(...data.map(d => Math.max(d.total, d.completed)))
  const paddedMax = Math.max(5, Math.ceil(maxValue * 1.1)) // 增加10%的padding，最小为5

  // 创建缩放函数
  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth
  const yScale = (value: number) => chartHeight - (value / paddedMax) * chartHeight

  // 生成平滑曲线路径
  const createSmoothPath = (values: number[], type: 'total' | 'completed') => {
    if (values.length < 2) return ''
    
    const points = values.map((value, index) => ({
      x: xScale(index) + margin.left,
      y: yScale(value) + margin.top
    }))

    // 使用贝塞尔曲线创建平滑路径
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const controlX = (current.x + next.x) / 2
      const controlY = (current.y + next.y) / 2
      
      path += ` Q ${current.x} ${current.y}, ${controlX} ${controlY}`
    }
    
    // 添加最后一个点
    const lastPoint = points[points.length - 1]
    path += ` T ${lastPoint.x} ${lastPoint.y}`
    
    return path
  }

  // 生成渐变定义
  const createGradients = () => (
    <defs>
      <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
        <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
      </linearGradient>
      <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
        <stop offset="100%" stopColor="rgba(34, 197, 94, 0.05)" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  )

  const totalPath = createSmoothPath(data.map(d => d.total), 'total')
  const completedPath = createSmoothPath(data.map(d => d.completed), 'completed')

  // 生成区域路径
  const createAreaPath = (linePath: string) => {
    if (!linePath) return ''
    const pathData = linePath.split(' ')
    const lastPoint = pathData[pathData.length - 1]
    const lastY = parseInt(lastPoint.split(',')[1])
    
    return `${linePath} L ${dimensions.width - margin.right} ${height - margin.bottom} L ${margin.left} ${height - margin.bottom} Z`
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={height}
        className="overflow-visible"
      >
        {createGradients()}
        
        {/* 背景网格线 */}
        <g className="opacity-30">
          {/* 水平网格线 */}
          {[0, 1, 2, 3, 4].map((step, i) => (
            <line
              key={`h-${i}`}
              x1={margin.left}
              y1={margin.top + (step / 4) * chartHeight}
              x2={dimensions.width - margin.right}
              y2={margin.top + (step / 4) * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* 垂直网格线 */}
          {data.map((_, i) => (
            <line
              key={`v-${i}`}
              x1={margin.left + xScale(i)}
              y1={margin.top}
              x2={margin.left + xScale(i)}
              y2={height - margin.bottom}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* 总创作数区域 */}
        {totalPath && (
          <motion.path
            d={createAreaPath(totalPath)}
            fill="url(#totalGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* 已完成数区域 */}
        {completedPath && (
          <motion.path
            d={createAreaPath(completedPath)}
            fill="url(#completedGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />
        )}

        {/* 总创作数线条 */}
        {totalPath && (
          <motion.path
            d={totalPath}
            fill="none"
            stroke="url(#totalGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* 已完成数线条 */}
        {completedPath && (
          <motion.path
            d={completedPath}
            fill="none"
            stroke="url(#completedGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimating ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />
        )}

    
        {/* Y轴标签 */}
        <g className="text-xs text-gray-500">
          {[0, 1, 2, 3, 4].map((step, i) => {
            // 生成简单的递减刻度值
            const value = paddedMax - step
            return (
              <text
                key={`label-${i}`}
                x={margin.left - 10}
                y={margin.top + (step / 4) * chartHeight + 4}
                textAnchor="end"
                className="fill-gray-500"
              >
                {value}
              </text>
            )
          })}
        </g>

        {/* X轴标签 */}
        <g className="text-xs text-gray-500">
          {data.map((point, index) => (
            <text
              key={`date-${index}`}
              x={margin.left + xScale(index)}
              y={height - margin.bottom + 20}
              textAnchor="middle"
              className="fill-gray-500"
            >
              {point.date}
            </text>
          ))}
        </g>
      </svg>

      </div>
  )
}

export default LineChart