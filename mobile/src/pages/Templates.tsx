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
  List,
  Cell,
  Toast,
  ActionSheet,
  ActionSheetAction
} from 'vant';
import { useNavigate } from 'react-router-dom';
import { useTemplateStore } from '../store/useTemplateStore';

export default function Templates() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const {
    templates,
    categories,
    searchQuery,
    selectedCategory,
    isLoading,
    fetchTemplates,
    setSelectedCategory,
    setSearchQuery,
    loadCategories,
    useTemplate
  } = useTemplateStore();

  // 过滤模板
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (!template || typeof template !== 'object') return false;
      
      const matchesSearch = !searchValue || 
        template.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesCategory = activeTab === 'all' || template.categoryId === activeTab;
      
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchValue, activeTab]);

  // 热门模板
  const popularTemplates = useMemo(() => 
    templates.filter(t => t && t.isPopular).slice(0, 6),
    [templates]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadCategories();
      await fetchTemplates();
    } catch (error) {
      Toast.fail('加载数据失败，请重试');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSearchQuery(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveTab(categoryId);
    setSelectedCategory(categoryId === 'all' ? '' : categoryId);
  };

  const handleTemplateClick = (template: any) => {
    setSelectedTemplate(template);
    setShowActionSheet(true);
  };

  const handleUseTemplate = async (template: any) => {
    try {
      await useTemplate(template.id);
      Toast.success(`已应用模板：${template.title}`);
      navigate(`/generate?template=${template.id}`);
    } catch (error) {
      Toast.fail('使用模板失败');
    }
  };

  const handlePreviewTemplate = (template: any) => {
    // 这里可以实现模板预览功能
    Toast('预览功能开发中');
  };

  const actionSheetActions: ActionSheetAction[] = [
    {
      name: '使用模板',
      callback: () => selectedTemplate && handleUseTemplate(selectedTemplate)
    },
    {
      name: '预览模板',
      callback: () => selectedTemplate && handlePreviewTemplate(selectedTemplate)
    }
  ];

  const renderTemplateCard = (template: any) => (
    <Card
      key={template.id}
      className="mb-3"
      onClick={() => handleTemplateClick(template)}
    >
      <div className="relative">
        <VantImage
          src={template.preview || '/placeholder-template.png'}
          width="100%"
          height={120}
          fit="cover"
          className="rounded-lg"
          errorIcon="photo-fail"
        />
        
        {/* 类型标识 */}
        <div className="absolute top-2 left-2">
          <Tag
            type={template.type === 'video' ? 'danger' : 'primary'}
            size="mini"
          >
            {template.type === 'video' ? '视频' : '图片'}
          </Tag>
        </div>
        
        {/* 热门标识 */}
        {template.isPopular && (
          <div className="absolute top-2 right-2">
            <Tag type="warning" size="mini">热门</Tag>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {template.title || '未命名模板'}
        </div>
        <div className="text-sm text-gray-600 mb-2 line-clamp-2">
          {template.description || '暂无描述'}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag size="mini" plain>
              {template.categoryId || '其他'}
            </Tag>
            <span className="text-xs text-gray-500">
              {template.views || 0} 次使用
            </span>
          </div>
          
          <Button
            size="mini"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleUseTemplate(template);
            }}
          >
            使用
          </Button>
        </div>
        
        {/* 标签 */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 3).map((tag: string, index: number) => (
              <Tag key={index} size="mini" plain>
                {tag}
              </Tag>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        title="模板库"
        leftText="返回"
        onClickLeft={() => navigate('/')}
        className="bg-white"
      />

      <PullRefresh
        value={refreshing}
        onRefresh={handleRefresh}
      >
        <div className="p-4">
          {/* 搜索框 */}
          <div className="mb-4">
            <Search
              value={searchValue}
              onChange={handleSearch}
              placeholder="搜索模板..."
              shape="round"
            />
          </div>

          {/* 热门模板 */}
          {popularTemplates.length > 0 && !searchValue && (
            <div className="mb-6">
              <div className="text-lg font-semibold mb-3">🔥 热门模板</div>
              <div className="grid grid-cols-2 gap-3">
                {popularTemplates.map(template => (
                  <div key={template.id} className="relative">
                    <VantImage
                      src={template.preview || '/placeholder-template.png'}
                      width="100%"
                      height={100}
                      fit="cover"
                      className="rounded-lg"
                      onClick={() => handleTemplateClick(template)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                      <div className="text-white text-sm font-medium line-clamp-1">
                        {template.title}
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Tag
                        type={template.type === 'video' ? 'danger' : 'primary'}
                        size="mini"
                      >
                        {template.type === 'video' ? '视频' : '图片'}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分类标签 */}
          <div className="mb-4">
            <Tabs
              active={activeTab}
              onChange={handleCategoryChange}
              scrollable
              className="bg-white rounded-lg"
            >
              <Tab title="全部" name="all" />
              {categories.map(category => (
                <Tab
                  key={category.id}
                  title={category.name}
                  name={category.id}
                />
              ))}
            </Tabs>
          </div>

          {/* 模板列表 */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loading size="24px">加载中...</Loading>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Empty
              description={searchValue ? '未找到相关模板' : '暂无模板'}
              className="py-8"
            />
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          )}

          {/* 加载更多提示 */}
          {filteredTemplates.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              已显示全部模板
            </div>
          )}
        </div>
      </PullRefresh>

      {/* 操作面板 */}
      <ActionSheet
        show={showActionSheet}
        actions={actionSheetActions}
        onCancel={() => setShowActionSheet(false)}
        title={selectedTemplate?.title || '模板操作'}
        description={selectedTemplate?.description}
      />
    </div>
  );
}