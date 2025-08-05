import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 移除加载动画
const removeLoading = () => {
  const loading = document.querySelector('.loading')
  if (loading) {
    loading.remove()
  }
}

// 延迟移除加载动画，确保应用完全加载
setTimeout(removeLoading, 500)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)