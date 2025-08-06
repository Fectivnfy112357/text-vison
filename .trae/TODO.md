# TODO:

- [x] fix_create_params: 修正创作页参数以匹配GenerateContentRequest.java：添加缺失参数，移除不匹配参数，更新buildGenerateData方法 (priority: High)
- [x] fix_template_click: 修复模板点击接口调用：修正跳转参数名从templateId改为template_id (priority: High)
- [x] fix_history_login: 修复历史页登录检查：使用正确的存储key 'user_info'而不是'userInfo' (priority: High)
- [ ] remove_analytics: 删除所有analytics相关代码：删除utils/analytics.js，从api/index.js删除analytics导出，从所有页面删除analytics调用，删除后端AnalyticsController (**IN PROGRESS**) (priority: Medium)
