// 文生视界微信小程序 - 模板页面
const api = require('../../api/index');
const utils = require('../../utils/utils');

Page({
  data: {
    // 页面状态
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 搜索相关
    searchKeyword: '',
    showSearchResult: false,
    searchHistory: [],
    hotKeywords: ['科幻', '动漫', '写实', '抽象', '风景', '人物'],
    
    // 分类相关
    categories: [
      { id: 'all', name: '全部', icon: '/images/icons/all.png' },
      { id: 'character', name: '人物', icon: '/images/icons/character.png' },
      { id: 'landscape', name: '风景', icon: '/images/icons/landscape.png' },
      { id: 'anime', name: '动漫', icon: '/images/icons/anime.png' },
      { id: 'sci-fi', name: '科幻', icon: '/images/icons/sci-fi.png' },
      { id: 'abstract', name: '抽象', icon: '/images/icons/abstract.png' },
      { id: 'art', name: '艺术', icon: '/images/icons/art.png' }
    ],
    selectedCategory: 'all',
    
    // 排序相关
    sortOptions: [
      { key: 'hot', name: '热门' },
      { key: 'new', name: '最新' },
      { key: 'rating', name: '评分' }
    ],
    selectedSort: 'hot',
    showSortPicker: false,
    
    // 模板数据
    templates: [],
    searchResults: [],
    
    // 分页参数
    page: 1,
    pageSize: 20,
    
    // 用户信息
    userInfo: null,
    isLoggedIn: false
  },

  onLoad(options) {
    console.log('Templates page loaded with options:', options);
    
    // 获取用户信息
    this.checkUserLogin();
    
    // 加载搜索历史
    this.loadSearchHistory();
    
    // 处理页面参数
    if (options.category) {
      this.setData({
        selectedCategory: options.category
      });
    }
    
    if (options.keyword) {
      this.setData({
        searchKeyword: options.keyword,
        showSearchResult: true
      });
    }
    
    // 加载数据
    this.loadTemplates();
    
    // 数据分析
    this.trackPageView();
  },

  onShow() {
    // 检查登录状态变化
    this.checkUserLogin();
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreTemplates();
    }
  },

  onShareAppMessage() {
    return {
      title: '发现更多AI创作模板',
      path: '/pages/templates/templates',
      imageUrl: '/images/share/templates.png'
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
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = utils.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory: history.slice(0, 10) // 最多显示10条
    });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    if (!keyword || keyword.trim() === '') return;
    
    let history = utils.getStorageSync('searchHistory') || [];
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 限制数量
    history = history.slice(0, 20);
    
    utils.setStorageSync('searchHistory', history);
    this.setData({
      searchHistory: history.slice(0, 10)
    });
  },

  // 加载模板数据
  async loadTemplates() {
    try {
      this.setData({ loading: true });
      
      const params = {
        page: 1,
        pageSize: this.data.pageSize,
        category: this.data.selectedCategory === 'all' ? '' : this.data.selectedCategory,
        sort: this.data.selectedSort,
        keyword: this.data.showSearchResult ? this.data.searchKeyword : ''
      };
      
      const response = await api.getTemplates(params);
      
      if (response.success) {
        const templates = response.data.list || [];
        const hasMore = templates.length >= this.data.pageSize;
        
        this.setData({
          templates,
          hasMore,
          page: 1,
          loading: false
        });
        
        if (this.data.showSearchResult) {
          this.setData({
            searchResults: templates
          });
        }
      } else {
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('Load templates error:', error);
      utils.showToast('加载模板失败');
      this.setData({ loading: false });
    }
  },

  // 加载更多模板
  async loadMoreTemplates() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    try {
      this.setData({ loadingMore: true });
      
      const nextPage = this.data.page + 1;
      const params = {
        page: nextPage,
        pageSize: this.data.pageSize,
        category: this.data.selectedCategory === 'all' ? '' : this.data.selectedCategory,
        sort: this.data.selectedSort,
        keyword: this.data.showSearchResult ? this.data.searchKeyword : ''
      };
      
      const response = await api.getTemplates(params);
      
      if (response.success) {
        const newTemplates = response.data.list || [];
        const hasMore = newTemplates.length >= this.data.pageSize;
        
        this.setData({
          templates: [...this.data.templates, ...newTemplates],
          hasMore,
          page: nextPage,
          loadingMore: false
        });
        
        if (this.data.showSearchResult) {
          this.setData({
            searchResults: [...this.data.searchResults, ...newTemplates]
          });
        }
      } else {
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('Load more templates error:', error);
      utils.showToast('加载更多失败');
      this.setData({ loadingMore: false });
    }
  },

  // 刷新数据
  async refreshData() {
    try {
      this.setData({ refreshing: true });
      await this.loadTemplates();
      utils.showToast('刷新成功');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
  },

  // 搜索确认
  onSearchConfirm() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      utils.showToast('请输入搜索关键词');
      return;
    }
    
    this.performSearch(keyword);
  },

  // 执行搜索
  performSearch(keyword) {
    this.setData({
      searchKeyword: keyword,
      showSearchResult: true,
      selectedCategory: 'all'
    });
    
    this.saveSearchHistory(keyword);
    this.loadTemplates();
    
    // 数据分析
    this.trackSearch(keyword);
  },

  // 清空搜索
  onClearSearch() {
    this.setData({
      searchKeyword: '',
      showSearchResult: false,
      searchResults: []
    });
    
    this.loadTemplates();
  },

  // 热门关键词点击
  onHotKeywordTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.performSearch(keyword);
  },

  // 搜索历史点击
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.performSearch(keyword);
  },

  // 清空搜索历史
  onClearHistory() {
    utils.showConfirm({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          utils.removeStorageSync('searchHistory');
          this.setData({
            searchHistory: []
          });
          utils.showToast('已清空');
        }
      }
    });
  },

  // 分类选择
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    if (category === this.data.selectedCategory) return;
    
    this.setData({
      selectedCategory: category,
      showSearchResult: false,
      searchKeyword: ''
    });
    
    this.loadTemplates();
    
    // 数据分析
    this.trackCategorySelect(category);
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
    
    this.loadTemplates();
  },

  onSortPickerCancel() {
    this.setData({
      showSortPicker: false
    });
  },

  // 模板点击
  onTemplateTap(e) {
    const template = e.currentTarget.dataset.template;
    
    // 数据分析
    this.trackTemplateClick(template);
    
    // 跳转到创作页面
    wx.navigateTo({
      url: `/pages/create/create?templateId=${template.id}&type=${template.type}`
    });
  },

  // 模板收藏
  async onTemplateFavorite(e) {
    e.stopPropagation();
    
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    
    const index = e.currentTarget.dataset.index;
    const template = this.data.templates[index];
    
    try {
      const action = template.is_favorited ? 'unfavorite' : 'favorite';
      const response = await api.favoriteTemplate({
        template_id: template.id,
        action
      });
      
      if (response.success) {
        const updateKey = this.data.showSearchResult ? 'searchResults' : 'templates';
        const updateData = {};
        updateData[`${updateKey}[${index}].is_favorited`] = !template.is_favorited;
        updateData[`${updateKey}[${index}].favorite_count`] = template.favorite_count + (template.is_favorited ? -1 : 1);
        
        this.setData(updateData);
        
        utils.showToast(template.is_favorited ? '已取消收藏' : '已收藏');
        
        // 数据分析
        this.trackTemplateFavorite(template, !template.is_favorited);
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('Favorite template error:', error);
      utils.showToast('操作失败');
    }
  },

  // 显示登录提示
  showLoginPrompt() {
    utils.showConfirm({
      title: '登录提示',
      content: '请先登录后再进行此操作',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 数据分析 - 页面访问
  trackPageView() {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('page_view', {
        page_name: 'templates',
        category: this.data.selectedCategory,
        sort: this.data.selectedSort
      });
    }
  },

  // 数据分析 - 搜索
  trackSearch(keyword) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('template_search', {
        keyword,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 分类选择
  trackCategorySelect(category) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('category_select', {
        category,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 模板点击
  trackTemplateClick(template) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('template_click', {
        template_id: template.id,
        template_name: template.name,
        category: template.category,
        timestamp: Date.now()
      });
    }
  },

  // 数据分析 - 模板收藏
  trackTemplateFavorite(template, favorited) {
    if (typeof wx.reportAnalytics === 'function') {
      wx.reportAnalytics('template_favorite', {
        template_id: template.id,
        template_name: template.name,
        action: favorited ? 'favorite' : 'unfavorite',
        timestamp: Date.now()
      });
    }
  }
});