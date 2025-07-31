-- 模板分类功能数据库迁移脚本
-- 执行顺序：先创建分类表，再迁移数据，最后修改模板表结构

USE text_vision;

-- 1. 创建模板分类表
CREATE TABLE IF NOT EXISTS `template_category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(200) COMMENT '分类描述',
  `icon` VARCHAR(100) COMMENT '分类图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  UNIQUE KEY `uk_name` (`name`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板分类表';

-- 2. 插入默认分类数据
INSERT INTO `template_category` (`name`, `description`, `icon`, `sort_order`) VALUES
('全部', '所有模板分类', 'grid', 0),
('风景', '自然风光、城市景观等风景类模板', 'mountain', 1),
('人像', '人物肖像、艺术摄影等人像类模板', 'user', 2),
('艺术', '抽象艺术、创意设计等艺术类模板', 'palette', 3),
('视频', '动态视频、动画效果等视频类模板', 'video', 4),
('商业', '产品展示、营销推广等商业类模板', 'briefcase', 5),
('其他', '其他类型模板', 'more-horizontal', 99);

-- 3. 为模板表添加分类ID字段
ALTER TABLE `template` ADD COLUMN `category_id` BIGINT COMMENT '分类ID' AFTER `category`;

-- 4. 数据迁移：根据现有category字段匹配分类ID
UPDATE `template` t 
SET t.category_id = (
    SELECT tc.id 
    FROM `template_category` tc 
    WHERE tc.name = t.category
    LIMIT 1
)
WHERE t.category IS NOT NULL;

-- 5. 将未匹配到分类的模板设置为"其他"分类
UPDATE `template` t 
SET t.category_id = (
    SELECT tc.id 
    FROM `template_category` tc 
    WHERE tc.name = '其他'
    LIMIT 1
)
WHERE t.category_id IS NULL;

-- 6. 添加外键约束和索引
ALTER TABLE `template` ADD INDEX `idx_category_id` (`category_id`);
ALTER TABLE `template` ADD CONSTRAINT `fk_template_category` 
    FOREIGN KEY (`category_id`) REFERENCES `template_category` (`id`) ON DELETE SET NULL;

-- 7. 验证数据迁移结果
SELECT 
    tc.name as category_name,
    COUNT(t.id) as template_count
FROM `template_category` tc
LEFT JOIN `template` t ON tc.id = t.category_id AND t.deleted = 0
WHERE tc.deleted = 0
GROUP BY tc.id, tc.name
ORDER BY tc.sort_order;

-- 注意：暂时保留原category字段，待验证无误后可手动删除
-- ALTER TABLE `template` DROP COLUMN `category`;