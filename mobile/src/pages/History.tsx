import React, { useState, useEffect, useMemo } from 'react';
import {
  NavBar,
  Search,
  Tabs,
  Tab,
  Card,
  Button,
  Image as VantImage,
  Tag,
  Loading,
  Empty,
  PullRefresh,
  SwipeCell,
  Dialog,
  Toast,
  ActionSheet,
  ActionSheetAction,
  Checkbox,
  Sticky
} from 'vant';
import { useNavigate } from 'react-router-dom';
import { useGenerationStore } from '../store/useGenerationStore';
import { useAuthStore } from '../store/useAuthStore';
import { contentAPI } from '../lib/api';

export default function History() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { history, loadHistory, refreshHistory, isLoadingHistory } = useGenerationStore();
  const { isAuthenticated } = useAuthStore();

  // 过滤历史记录
  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        const prompt = item.prompt || '';
        const type = item.type || '';
        
        const matchesSearch = !searchValue || 
          prompt.toLowerCase().includes(searchValue.toLowerCase());
        
        const matchesType = activeTab === 'all' || type === activeTab;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // 最新优先
      });
  }, [history, searchValue, activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    
    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      await loadHistory(1, 20, type);
    } catch (error) {
      Toast.fail('加载历史记录失败');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshHistory();
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'all' | 'image' | 'video');
    // 重新加载对应类型的数据
    setTimeout(() => {
      loadData();
    }, 100);
  };

  const handleItemClick = (item: any) => {
    if (isSelectionMode) {
      handleSelectItem(item.id);
    } else {
      setSelectedItem(item);
      setShowActionSheet(true);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      await Dialog.confirm({
        title: '确认删除',
        message: `确定要删除选中的 ${selectedItems.length} 个项目吗？此操作不可恢复。`
      });

      await contentAPI.batchDeleteContents(selectedItems);
      await refreshHistory();
      
      setSelectedItems([]);
      setIsSelectionMode(false);
      Toast.success(`已删除 ${selectedItems.length} 个项目`);
    } catch (error) {
      if (error !== 'cancel') {
        Toast.fail('删除失败，请稍后重试');
      }
    }
  };

  const handleDownload = (item: any) => {
    if (!item || !item.url) {
      Toast.fail('下载失败：无效的文件链接');
      return;
    }

    const link = document.createElement('a');
    link.href = item.url;
    const fileId = item.id || 'unknown';
    const fileType = item.type === 'video' ? 'mp4' : 'jpg';
    link.download = `textvision-${fileId}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.success('下载开始');
  };

  const handleShare = async (item: any) => {
    if (!item || !item.url) {
      Toast.fail('分享失败：无效的内容链接');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: '文生视界 - 创作分享',
          text: item.prompt || '精彩创作内容',
          url: item.url
        });
      } else {
        await navigator.clipboard.writeText(item.url);
        Toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(item.url);
        Toast.success('链接已复制到剪贴板');
      } catch (clipboardError) {
        Toast.fail('分享失败');
      }
    }
  };

  const handleDeleteSingle = async (item: any) => {
    try {
      await Dialog.confirm({
        title: '确认删除',
        message: '确定要删除这个项目吗？此操作不可恢复。'
      });

      await contentAPI.batchDeleteContents([item.id]);
      await refreshHistory();
      Toast.success('删除成功');
    } catch (error) {
      if (error !== 'cancel') {
        Toast.fail('删除失败');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const actionSheetActions: ActionSheetAction[] = [
    {
      name: '下载',
      callback: () => selectedItem && handleDownload(selectedItem)
    },
    {
      name: '分享',
      callback: () => selectedItem && handleShare(selectedItem)
    },
    {
      name: '删除',
      color: '#ee0a24',
      callback: () => selectedItem && handleDeleteSingle(selectedItem)
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Empty
            description="请先登录"
            className="mb-4"
          />
          <div className="text-gray-600 mb-6">
            登录后即可查看您的创作历史记录
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const renderHistoryItem = (item: any) => (
    <SwipeCell
      key={item.id}
      rightAction={
        <Button
          square
          type="danger"
          text="删除"
          onClick={() => handleDeleteSingle(item)}
          className="h-full"
        />
      }
    >
      <Card
        className="mb-3"
        onClick={() => handleItemClick(item)}
      >
        <div className="flex items-start space-x-3">
          {/* 选择框 */}
          {isSelectionMode && (
            <div className="pt-2">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
            </div>
          )}
          
          {/* 预览图 */}
          <div className="relative flex-shrink-0">
            {item.type === 'video' ? (
              <div className="relative">
                <VantImage
                  src={item.thumbnail || item.url}
                  width={80}
                  height={80}
                  fit="cover"
                  className="rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
            ) : (
              <VantImage
                src={item.url}
                width={80}
                height={80}
                fit="cover"
                className="rounded-lg"
              />
            )}
            
            {/* 类型标识 */}
            <div className="absolute top-1 left-1">
              <Tag
                type={item.type === 'video' ? 'danger' : 'primary'}
                size="mini"
              >
                {item.type === 'video' ? '视频' : '图片'}
              </Tag>
            </div>
          </div>
          
          {/* 内容信息 */}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 mb-1 line-clamp-2">
              {item.prompt || '无描述'}
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              {formatDate(item.createdAt)}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="mini"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
              >
                下载
              </Button>
              <Button
                size="mini"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(item);
                }}
              >
                分享
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </SwipeCell>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        title="创作历史"
        leftText="返回"
        rightText={isSelectionMode ? '取消' : '选择'}
        onClickLeft={() => {
          if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedItems([]);
          } else {
            navigate('/');
          }
        }}
        onClickRight={() => {
          setIsSelectionMode(!isSelectionMode);
          setSelectedItems([]);
        }}
        className="bg-white"
      />

      {/* 批量操作栏 */}
      {isSelectionMode && (
        <Sticky>
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < filteredHistory.length}
                  onChange={handleSelectAll}
                >
                  全选
                </Checkbox>
                <span className="text-sm text-gray-600">
                  已选择 {selectedItems.length} 项
                </span>
              </div>
              
              {selectedItems.length > 0 && (
                <Button
                  size="small"
                  type="danger"
                  onClick={handleDeleteSelected}
                >
                  删除选中
                </Button>
              )}
            </div>
          </div>
        </Sticky>
      )}

      <PullRefresh
        value={refreshing}
        onRefresh={handleRefresh}
      >
        <div className="p-4">
          {/* 搜索框 */}
          <div className="mb-4">
            <Search
              value={searchValue}
              onChange={setSearchValue}
              placeholder="搜索历史记录..."
              shape="round"
            />
          </div>

          {/* 类型筛选 */}
          <div className="mb-4">
            <Tabs
              active={activeTab}
              onChange={handleTabChange}
              className="bg-white rounded-lg"
            >
              <Tab title="全部" name="all" />
              <Tab title="图片" name="image" />
              <Tab title="视频" name="video" />
            </Tabs>
          </div>

          {/* 历史记录列表 */}
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loading size="24px">加载中...</Loading>
            </div>
          ) : filteredHistory.length === 0 ? (
            <Empty
              description={searchValue ? '未找到相关记录' : '暂无历史记录'}
              className="py-8"
            />
          ) : (
            <div className="space-y-3">
              {filteredHistory.map(renderHistoryItem)}
            </div>
          )}

          {/* 加载更多提示 */}
          {filteredHistory.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              已显示全部记录
            </div>
          )}
        </div>
      </PullRefresh>

      {/* 操作面板 */}
      <ActionSheet
        show={showActionSheet}
        actions={actionSheetActions}
        onCancel={() => setShowActionSheet(false)}
        title="选择操作"
      />
    </div>
  );
}