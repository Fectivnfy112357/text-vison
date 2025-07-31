-- 手动执行的分类表初始化脚本
-- 请在MySQL中手动执行此脚本

USE textvision;

-- 创建模板分类表
CREATE TABLE IF NOT EXISTS `template_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` varchar(200) DEFAULT NULL COMMENT '分类描述',
  `icon` varchar(100) DEFAULT NULL COMMENT '分类图标',
  `sort_order` int DEFAULT 0 COMMENT '排序权重，数值越小越靠前',
  `status` tinyint DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板分类表';

-- 插入默认分类数据
INSERT INTO `template_category` (`name`, `description`, `icon`, `sort_order`, `status`) VALUES
('全部', '显示所有模板', 'grid-3x3', 0, 1),
('风景', '自然风光、城市景观等风景类模板', 'mountain', 1, 1),
('人像', '人物肖像、写真等人像类模板', 'user', 2, 1),
('艺术', '艺术创作、抽象设计等艺术类模板', 'palette', 3, 1),
('视频', '视频生成相关模板', 'video', 4, 1),
('其他', '其他类型模板', 'more-horizontal', 99, 1);

-- 为模板表添加分类ID字段
ALTER TABLE `template` ADD COLUMN `category_id` bigint DEFAULT NULL COMMENT '分类ID' AFTER `category`;

-- 创建外键索引
ALTER TABLE `template` ADD INDEX `idx_category_id` (`category_id`);

-- 数据迁移：将现有模板的分类名称映射到分类ID
UPDATE `template` t 
SET t.`category_id` = (
    SELECT tc.`id` 
    FROM `template_category` tc 
    WHERE tc.`name` = t.`category` 
    AND tc.`deleted` = 0
    LIMIT 1
)
WHERE t.`category` IS NOT NULL AND t.`category` != '';

-- 将没有匹配分类的模板设置为"其他"分类
UPDATE `template` t 
SET t.`category_id` = (
    SELECT tc.`id` 
    FROM `template_category` tc 
    WHERE tc.`name` = '其他' 
    AND tc.`deleted` = 0
    LIMIT 1
)
WHERE t.`category_id` IS NULL;

-- 添加外键约束（可选，根据需要决定是否添加）
-- ALTER TABLE `template` ADD CONSTRAINT `fk_template_category` 
-- FOREIGN KEY (`category_id`) REFERENCES `template_category` (`id`) ON DELETE SET NULL;

SELECT '分类表初始化完成！' AS message;