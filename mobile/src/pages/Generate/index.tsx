
import { NavBar } from 'react-vant'

const Generate = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="内容生成" className="mobile-header" />
      <div className="mobile-content">
        <div className="mobile-card">
          <h2 className="text-xl font-semibold mb-4">AI内容生成</h2>
          <p className="text-gray-600">生成功能正在开发中...</p>
        </div>
      </div>
    </div>
  )
}

export default Generate