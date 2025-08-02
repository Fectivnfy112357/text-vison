import React from 'react';
import { NavBar, Cell, CellGroup, Dialog, Toast } from 'vant';
import { useNavigate } from 'react-router-dom';
import { getDesktopUrl } from '../utils/deviceDetection';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleSwitchToDesktop = () => {
    Dialog.confirm({
      title: '切换到桌面版',
      message: '桌面版提供了更丰富的功能和更好的体验，是否立即切换？',
      confirmButtonText: '立即切换',
      cancelButtonText: '取消',
    })
      .then(() => {
        window.location.href = getDesktopUrl();
      })
      .catch(() => {
        // 用户取消
      });
  };

  const handleAbout = () => {
    Toast('文生视界 v1.0.0');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        title="设置"
        leftText="返回"
        leftArrow
        onClickLeft={() => navigate(-1)}
        className="bg-white"
      />
      
      <div className="p-4 space-y-4">
        <CellGroup>
          <Cell
            title="切换到桌面版"
            label="获得更丰富的功能体验"
            isLink
            onClick={handleSwitchToDesktop}
          />
        </CellGroup>
        
        <CellGroup>
          <Cell
            title="关于应用"
            label="查看版本信息"
            isLink
            onClick={handleAbout}
          />
        </CellGroup>
      </div>
    </div>
  );
};

export default Settings;