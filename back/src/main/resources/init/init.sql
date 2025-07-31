-- 创建数据库
CREATE DATABASE IF NOT EXISTS text_vision DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE text_vision;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
                                      `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
                                      `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
                                      `name` VARCHAR(50) NOT NULL COMMENT '用户名',
                                      `password` VARCHAR(255) NOT NULL COMMENT '密码',
                                      `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
                                      `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
                                      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                      `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 模板表
CREATE TABLE IF NOT EXISTS `template` (
                                          `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
                                          `title` VARCHAR(100) NOT NULL COMMENT '模板标题',
                                          `description` TEXT COMMENT '模板描述',
                                          `prompt` TEXT NOT NULL COMMENT '模板提示词',
                                          `category` VARCHAR(50) NOT NULL COMMENT '模板分类',
                                          `tags` JSON COMMENT '标签列表',
                                          `image_url` longtext COMMENT '模板预览图',
                                          `type` VARCHAR(20) NOT NULL COMMENT '类型：image-图片，video-视频',
                                          `usage_count` INT DEFAULT 0 COMMENT '使用次数',
                                          `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
                                          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                          `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板表';

-- 生成内容表
CREATE TABLE IF NOT EXISTS `generated_content` (
                                                   `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '内容ID',
                                                   `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                                   `type` VARCHAR(20) NOT NULL COMMENT '类型：image-图片，video-视频',
                                                   `prompt` TEXT NOT NULL COMMENT '生成提示词',
                                                   `url` longtext NOT NULL COMMENT '生成内容URL',
                                                   `thumbnail` longtext COMMENT '缩略图URL',
                                                   `size` VARCHAR(20) COMMENT '尺寸比例',
                                                   `style` VARCHAR(50) COMMENT '艺术风格',
                                                   `reference_image` longtext COMMENT '参考图片URL',
                                                   `template_id` BIGINT COMMENT '使用的模板ID',
                                                   `generation_params` JSON COMMENT '生成参数',
                                                   `status` VARCHAR(20) DEFAULT 'generating' COMMENT '状态：generating-生成中，completed-完成，failed-失败',
                                                   `error_message` TEXT COMMENT '错误信息',
                                                   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                                   `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
                                                   INDEX `idx_user_id` (`user_id`),
                                                   INDEX `idx_type` (`type`),
                                                   INDEX `idx_status` (`status`),
                                                   INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生成内容表';

-- 用户操作日志表
CREATE TABLE IF NOT EXISTS `user_operation_log` (
                                                    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
                                                    `user_id` BIGINT COMMENT '用户ID',
                                                    `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
                                                    `resource_type` VARCHAR(50) COMMENT '资源类型',
                                                    `resource_id` BIGINT COMMENT '资源ID',
                                                    `details` JSON COMMENT '操作详情',
                                                    `ip_address` VARCHAR(45) COMMENT 'IP地址',
                                                    `user_agent` VARCHAR(500) COMMENT '用户代理',
                                                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                    INDEX `idx_user_id` (`user_id`),
                                                    INDEX `idx_operation` (`operation`),
                                                    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户操作日志表';

-- 插入初始化数据

-- 插入测试用户
INSERT INTO `user` (`email`, `name`, `password`, `avatar`) VALUES
                                                               ('admin@textvision.com', '管理员', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLO.EvzJNjjS', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait&image_size=square'),
                                                               ('user@textvision.com', '测试用户', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLO.EvzJNjjS', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar&image_size=square');

-- 插入模板数据
INSERT INTO `template` (`title`, `description`, `prompt`, `category`, `tags`, `image_url`, `type`) VALUES
                                                                                                       ('科幻风景', '创造未来感十足的科幻风景画面', '未来科技城市，霓虹灯闪烁，飞行汽车穿梭，高楼大厦直插云霄，科幻风格，高清画质', '风景', '["科幻", "未来", "城市"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20sci-fi%20cityscape%20with%20neon%20lights&image_size=landscape_16_9', 'image'),
                                                                                                       ('梦幻人像', '生成唯美梦幻的人物肖像', '美丽女性肖像，梦幻光效，柔和色调，艺术摄影风格，高清细节', '人像', '["人像", "梦幻", "艺术"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dreamy%20portrait%20photography%20with%20soft%20lighting&image_size=portrait_4_3', 'image'),
                                                                                                       ('抽象艺术', '创作现代抽象艺术作品', '抽象几何图形，鲜艳色彩搭配，现代艺术风格，创意构图', '艺术', '["抽象", "现代", "几何"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20abstract%20geometric%20art%20with%20vibrant%20colors&image_size=square_hd', 'image'),
                                                                                                       ('自然风光', '展现大自然的壮美景色', '壮丽山川，清澈湖水，蓝天白云，自然摄影风格，风光大片', '风景', '["自然", "山川", "风光"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=majestic%20natural%20landscape%20with%20mountains%20and%20lake&image_size=landscape_16_9', 'image'),
                                                                                                       ('动态视频', '创建引人入胜的动态视频内容', '流畅的镜头运动，丰富的视觉效果，专业的剪辑风格', '视频', '["动态", "视频", "创意"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dynamic%20video%20production%20concept&image_size=landscape_16_9', 'video');

-- 插入示例生成内容
INSERT INTO `generated_content` (`user_id`, `type`, `prompt`, `url`, `thumbnail`, `size`, `style`, `status`) VALUES
                                                                                                                 (1, 'image', '美丽的日落风景', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20sunset%20landscape&image_size=landscape_16_9', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20sunset%20landscape%20thumbnail&image_size=square', '16:9', '自然风格', 'completed'),
                                                                                                                 (1, 'image', '现代建筑设计', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20architecture%20design&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20architecture%20thumbnail&image_size=square', '4:3', '建筑风格', 'completed'),
                                                                                                                 (2, 'video', '城市夜景延时摄影', 'https://example.com/video/city-timelapse.mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=city%20night%20timelapse%20thumbnail&image_size=landscape_16_9', '16:9', '延时摄影', 'completed');

-- 艺术风格表
CREATE TABLE IF NOT EXISTS `art_style` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '风格ID',
    `name` VARCHAR(50) NOT NULL COMMENT '风格名称',
    `description` VARCHAR(200) NOT NULL COMMENT '风格描述',
    `applicable_type` VARCHAR(20) NOT NULL COMMENT '适用类型：image-图片，video-视频，both-两者',
    `sort_order` INT DEFAULT 0 COMMENT '排序权重',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='艺术风格表';

-- 插入艺术风格初始数据
INSERT INTO `art_style` (`name`, `description`, `applicable_type`, `sort_order`) VALUES
('动漫风格', '动漫风', 'both', 1),
('油画风格', '油画风', 'both', 2),
('水彩风格', '水彩风', 'both', 3),
('素描风格', '素描风', 'image', 4),
('写实风格', '写实风', 'both', 5),
('卡通风格', '卡通风', 'both', 6),
('科幻风格', '科幻风', 'both', 7),
('古典风格', '古典风', 'both', 8);

-- 添加外键约束
ALTER TABLE `generated_content` ADD CONSTRAINT `fk_generated_content_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
ALTER TABLE `generated_content` ADD CONSTRAINT `fk_generated_content_template` FOREIGN KEY (`template_id`) REFERENCES `template` (`id`) ON DELETE SET NULL;
ALTER TABLE `user_operation_log` ADD CONSTRAINT `fk_user_operation_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL;