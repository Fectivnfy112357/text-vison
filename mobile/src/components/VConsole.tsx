import React, { useEffect } from 'react'
import VConsole from 'vconsole'

const VConsoleComponent: React.FC = () => {
  useEffect(() => {
    // 只在移动端环境初始化
    if (
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      const vConsole = new VConsole()
      
      // 清理函数
      return () => {
        vConsole.destroy()
      }
    }
  }, [])

  return null
}

export default VConsoleComponent