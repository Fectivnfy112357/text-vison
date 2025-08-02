#!/usr/bin/env node

/**
 * 移动端开发启动脚本
 * 提供局域网访问、二维码生成等功能
 */

import { spawn } from 'child_process'
import { networkInterfaces } from 'os'
import qrcode from 'qrcode-terminal'

// 获取本机IP地址
function getLocalIP() {
  const nets = networkInterfaces()
  const results = []
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 跳过非IPv4和内部地址
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address)
      }
    }
  }
  
  return results[0] || 'localhost'
}

// 启动开发服务器
function startDevServer() {
  const localIP = getLocalIP()
  const port = process.env.VITE_MOBILE_PORT || 5175
  const url = `http://${localIP}:${port}`
  
  console.log('\n🚀 启动移动端开发服务器...\n')
  console.log(`📱 本地访问: http://localhost:${port}`)
  console.log(`🌐 局域网访问: ${url}`)
  console.log('\n📱 手机扫码访问:')
  
  // 生成二维码
  qrcode.generate(url, { small: true })
  
  console.log('\n💡 提示:')
  console.log('- 确保手机和电脑在同一局域网内')
  console.log('- 如需HTTPS访问，请设置 VITE_ENABLE_HTTPS=true')
  console.log('- 开发调试可启用 VITE_ENABLE_VCONSOLE=true')
  console.log('\n⌨️  按 Ctrl+C 停止服务器\n')
  
  // 启动Vite开发服务器
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  })
  
  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n\n👋 正在停止开发服务器...')
    viteProcess.kill('SIGINT')
    process.exit(0)
  })
  
  viteProcess.on('error', (error) => {
    console.error('❌ 启动失败:', error.message)
    process.exit(1)
  })
}

// 检查依赖
function checkDependencies() {
  try {
    require.resolve('qrcode-terminal')
  } catch (error) {
    console.log('📦 安装缺失的依赖...')
    const installProcess = spawn('npm', ['install', 'qrcode-terminal', '--save-dev'], {
      stdio: 'inherit',
      shell: true
    })
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        startDevServer()
      } else {
        console.error('❌ 依赖安装失败')
        process.exit(1)
      }
    })
    
    return
  }
  
  startDevServer()
}

checkDependencies()