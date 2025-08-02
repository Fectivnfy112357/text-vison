
import { NavBar } from 'react-vant'

const Templates = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="模板库" className="mobile-header" />
      <div className="mobile-content">
        <div className="mobile-card">
          <h2 className="text-xl font-semibold mb-4">模板库</h2>
          <p className="text-gray-600">模板功能正在开发中...</p>
        </div>
      </div>
    </div>
  )
}

export default Templates