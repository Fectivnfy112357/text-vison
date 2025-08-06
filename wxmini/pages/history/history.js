// 文生视界微信小程序 - 历史记录页面
const api = require('../../api/index');
const utils = require('../../utils/utils');

Page({
  data: {
    // 页面状态
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 筛选相关
    filterOptions: [
      { key: 'all', name: '全部' },
      { key: 'image', name: '图片' },
      { key: 'video', name: '视频' },
      { key: 'transform', name: '转换' }
    ],
    selectedFilter: 'all',
    showFilterPicker: false,
    
    // 排序相关
    sortOptions: [
      { key: 'time', name: '时间' },
      { key: 'type', name: '类型' },
      { key: 'status', name: '状态' }
    ],
    selectedSort: 'time',
    showSortPicker: false,
    
    // 历史记录数据
    historyList: [],
    
    // 分页参数
    page: 1,
    pageSize: 20,
    
    // 选择模式
    selectionMode: false,
    selectedItems: [],
    
    // 用户信息
    userInfo: null,
    isLoggedIn: false,
    
    // 统计信息
    statistics: {
      total: 0,
      image: 0,
      video: 0,
      transform: 0
    }
  },

  onLoad(options) {
    console.log('History page loaded with options:', options);
    
    // 获取用户信息
    this.checkUserLogin();
    
    // 处理页面参数
    if (options.filter) {
      this.setData({
        selectedFilter: options.filter
      });
    }
    
    // 加载数据
    this.loadHistoryData();
    this.loadStatistics();
    
    // 数据分析
    this.trackPageView();
  },

  onShow() {
    // 检查登录状态变化
    this.checkUserLogin();
    
    // 刷新数据（可能有新的生成记录）
    if (this.data.isLoggedIn) {
      this.refreshData();
    }
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreHistory();
    }
  },

  onShareAppMessage() {
    return {
      title: '我的AI创作历史',
      path: '/pages/history/history',
      imageUrl: '/images/share/history.png'
    };
  },

  // 检查用户登录状态
  checkUserLogin() {
    const userInfo = utils.getStorageSync('userInfo');
    const isLoggedIn = !!userInfo && !!userInfo.openid;
    
    this.setData({
      userInfo,
      isLoggedIn
    });
    
    if (!isLoggedIn) {
      // 未登录，显示登录提示
      this.setData({
        loading: false,
        historyList: []
      });
    }
  },

  // 加载历史记录数据
  async loadHistoryData() {
    if (!this.data.isLoggedIn) {
      this.setData({ loading: false });
      return;
    }
    
    try {
      this.setData({ loading: true });
      
      const params = {
        page: 1,
        pageSize: this.data.pageSize,
        type: this.data.selectedFilter === 'all' ? '' : this.data.selectedFilter,
        sort: this.data.selectedSort
      };
      
      const response = await api.getGenerationHistory(params);
      
      if (response.success) {
        const historyList = response.data.list || [];
        const hasMore = historyList.length >= this.data.pageSize;
        
        this.setData({
          historyList,
          hasMore,
          page: 1,
          loading: false
        });
      } else {
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('Load history error:', error);
      utils.showToast('加载历史记录失败');
      this.setData({ loading: false });
    }
  },

  // 加载更多历史记录
  async loadMoreHistory() {
    if (this.data.loadingMore || !this.data.hasMore || !this.data.isLoggedIn) return;
    
    try {
      this.setData({ loadingMore: true });
      
      const nextPage = this.data.page + 1;
      const params = {
        page: nextPage,
        pageSize: this.data.pageSize,
        type: this.data.selectedFilter === 'all' ? '' : this.data.selectedFilter,
        sort: this.data.selectedSort
      };
      
      const response = await api.getGenerationHistory(params);
      
      if (response.success) {
        const newHistory = response.data.list || [];
        const hasMore = newHistory.length >= this.data.pageSize;
        
        this.setData({
          historyList: [...this.data.historyList, ...newHistory],
          hasMore,
          page: nextPage,
          loadingMore: false
        });
      } else {
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('Load more history error:', error);
      utils.showToast('加载更多失败');
      this.setData({ loadingMore: false });
    }
  },

  // 加载统计信息
  async loadStatistics() {
    if (!this.data.isLoggedIn) return;
    
    try {
      const response = await api.getGenerationStatistics();
      
      if (response.success) {
        this.setData({
          statistics: response.data
        });
      }
    } catch (error) {
      console.error('Load statistics error:', error);
    }
  },

  // 刷新数据
  async refreshData() {
    try {
      this.setData({ refreshing: true });
      await Promise.all([
        this.loadHistoryData(),
        this.loadStatistics()
      ]);
      utils.showToast('刷新成功');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  // 筛选选择
  onFilterTap() {
    this.setData({
      showFilterPicker: true
    });
  },

  onFilterPickerChange(e) {
    const index = e.detail.value;
    const selectedFilter = this.data.filterOptions[index].key;
    
    this.setData({
      selectedFilter,
      showFilterPicker: false
    });
    
    this.loadHistoryData();
    
    // 数据分析
    this.trackFilterSelect(selectedFilter);
  },

  onFilterPickerCancel() {
    this.setData({
      showFilterPicker: false
    });
  },

  // 排序选择
  onSortTap() {
    this.setData({
      showSortPicker: true
    });
  },

  onSortPickerChange(e) {
    const index = e.detail.value;
    const selectedSort = this.data.sortOptions[index].key;
    
    this.setData({
      selectedSort,
      showSortPicker: false
    });
    
    this.loadHistoryData();
  },

  onSortPickerCancel() {
    this.setData({
      showSortPicker: false
    });
  },

  // 历史记录项点击
  onHistoryItemTap(e) {
    const item = e.currentTarget.dataset.item;
    
    if (this.data.selectionMode) {
      this.toggleItemSelection(item.id);
      return;
    }
    
    // 跳转到详情页面
    wx.navigateTo({
      url: `/pages/detail/detail?id=${item.id}&type=${item.type}`
    });
    
    // 数据分析
    this.trackHistoryItemClick(item);
  },

  // 长按进入选择模式
  onHistoryItemLongPress(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      selectionMode: true,
      selectedItems: [item.id]
    });
    
    wx.vibrateShort();
  },

  // 切换选择模式
  toggleSelectionMode() {
    this.setData({
      selectionMode: !this.data.selectionMode,
      selectedItems: []
    });
  },

  // 切换项目选择状态
  toggleItemSelection(itemId) {
    const selectedItems = [...this.data.selectedItems];
    const index = selectedItems.indexOf(itemId);
    
    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(itemId);
    }
    
    this.setData({ selectedItems });
  },

  // 全选/取消全选
  toggleSelectAll() {
    const allSelected = this.data.selectedItems.length === this.data.historyList.length;
    
    if (allSelected) {
      this.setData({ selectedItems: [] });
    } else {
      const allIds = this.data.historyList.map(item => item.id);
      this.setData({ selectedItems: allIds });
    }
  },

  // 批量删除
  async batchDelete() {
    if (this.data.selectedItems.length === 0) {
      utils.showToast('请选择要删除的记录');
      return;
    }
    
    const count = this.data.selectedItems.length;
    
    utils.showConfirm({
      title: '确认删除',
      content: `确定要删除选中的${count}条记录吗？删除后无法恢复。`,
      success: async (res) => {
        if (res.confirm) {
          await this.performBatchDelete();
        }
      }
    });
  },

  // 执行批量删除
  async performBatchDelete() {
    try {
      utils.showLoading('删除中...');
      
      const response = await api.deleteGenerationHistory({
        ids: this.data.selectedItems
      });
      
      if (response.success) {
        // 从列表中移除已删除的项目
        const historyList = this.data.historyList.filter(
          item => !this.data.selectedItems.includes(item.id)
        );
        
        this.setData({
          historyList,
          selectedItems: [],
          selectionMode: false
        });
        
        utils.showToast('删除成功');
        
        // 重新加载统计信息
        this.loadStatistics();
        
        // 数据分析
        this.trackBatchDelete(this.data.selectedItems.length);
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('Batch delete error:', error);
      utils.showToast('删除失败');
    } finally {
      utils.hideLoading();
    }
  },

  // 单个删除
  async deleteHistoryItem(e) {
    e.stopPropagation();
    
    const item = e.currentTarget.dataset.item;
    
    utils.showConfirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          await this.performSingleDelete(item);
        }
      }
    });
  },

  // 执行单个删除
  async performSingleDelete(item) {
    try {
      utils.showLoading('删除中...');
      
      const response = await api.deleteGenerationHistory({
        ids: [item.id]
      });
      
      if (response.success) {
        // 从列表中移除该项目
        const historyList = this.data.historyList.filter(
          historyItem => historyItem.id !== item.id
        );
        
        this.setData({ historyList });
        
        utils.showToast('删除成功');
        
        // 重新加载统计信息
        this.loadStatistics();
        
        // 数据分析
        this.trackSingleDelete(item);
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('Single delete error:', error);
      utils.showToast('删除失败');
    } finally {
      utils.hideLoading();
    }
  },

  // 重新生成
  onRegenerate(e) {
    e.stopPropagation();
    
    const item = e.currentTarget.dataset.item;
    
    // 跳转到创作页面，带上原始参数
    const params = {
      prompt: item.prompt,
      type: item.type
    };
    
    if (item.template_id) {
      params.templateId = item.template_id;
    }
    
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    wx.navigateTo({
      url: `/pages/create/create?${queryString}`
    });
    
    // 数据分析
    this.trackRegenerate(item);
  },

  // 分享记录
  onShareHistory(e) {
    e.stopPropagation();
    
    const item = e.currentTarget.dataset.item;
    
    // 数据分析
    this.trackShareHistory(item);
    
    return {
      title: `我用AI生成了这个${item.type === 'image' ? '图片' : '视频'}`,
      path: `/pages/detail/detail?id=${item.id}&type=${item.type}`,
      imageUrl: item.result_url || '/images/share/default.png'
    };
  },

  // 跳转到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 数据分析 - 页面访问
  trackPageView() {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('page_view', {
        page_name: 'history',
        filter: this.data.selectedFilter,
        sort: this.data.selectedSort
      });
    }
  },

  // 数据分析 - 筛选选择
  trackFilterSelect(filter) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_filter', {
        filter,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 历史记录点击
  trackHistoryItemClick(item) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_item_click', {
        item_id: item.id,
        item_type: item.type,
        status: item.status,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 批量删除
  trackBatchDelete(count) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_batch_delete', {
        count,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 单个删除
  trackSingleDelete(item) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_single_delete', {
        item_id: item.id,
        item_type: item.type,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 重新生成
  trackRegenerate(item) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_regenerate', {
        item_id: item.id,
        item_type: item.type,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 分享历史
  trackShareHistory(item) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('history_share', {
        item_id: item.id,
        item_type: item.type,
        timestamp: Date.now()
      });
    }
  }
});