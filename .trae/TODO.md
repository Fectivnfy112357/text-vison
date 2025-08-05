# TODO:

- [x] fix-template-store-popular: 修复useTemplateStore.ts中loadPopularTemplates方法，使用response?.data而不是response?.data?.data (priority: High)
- [x] fix-template-store-search: 修复useTemplateStore.ts中searchTemplates方法，使用response.data.records而不是response.data.list (priority: High)
- [x] fix-template-store-categories: 简化useTemplateStore.ts中loadCategories方法，直接使用response?.data移除复杂兼容逻辑 (priority: High)
- [x] fix-generation-store-history: 修复useGenerationStore.ts中loadHistory方法，使用response?.data?.records而不是response.contents (priority: High)
- [x] fix-art-style-store: 修复useArtStyleStore.ts中loadArtStyles方法，使用response?.data而不是直接使用artStyles (priority: High)
- [x] fix-api-types: 修复api.ts中API方法返回类型，确保返回统一的后端格式 (priority: Medium)
- [x] test-api-fixes: 运行npm run check测试所有API修复是否正确 (priority: Medium)
