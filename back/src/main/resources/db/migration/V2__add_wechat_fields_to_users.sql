-- WeChat login database migration script
-- Add WeChat related fields to users table

-- Modify existing fields
ALTER TABLE `user` CHANGE COLUMN `name` `username` VARCHAR(50) NULL COMMENT 'username';

-- Add new fields
ALTER TABLE `user` 
ADD COLUMN `nickname` VARCHAR(100) NULL COMMENT 'nickname' AFTER `username`,
ADD COLUMN `phone` VARCHAR(20) NULL COMMENT 'phone number' AFTER `nickname`,
ADD COLUMN `gender` TINYINT(1) DEFAULT 0 COMMENT 'gender: 0-unknown, 1-male, 2-female' AFTER `avatar`,
ADD COLUMN `country` VARCHAR(50) NULL COMMENT 'country' AFTER `gender`,
ADD COLUMN `province` VARCHAR(50) NULL COMMENT 'province' AFTER `country`,
ADD COLUMN `city` VARCHAR(50) NULL COMMENT 'city' AFTER `province`,
ADD COLUMN `wx_open_id` VARCHAR(100) NULL COMMENT 'WeChat openId' AFTER `city`,
ADD COLUMN `wx_union_id` VARCHAR(100) NULL COMMENT 'WeChat unionId' AFTER `wx_open_id`;

-- Add indexes
ALTER TABLE `user` ADD INDEX `idx_wx_open_id` (`wx_open_id`);
ALTER TABLE `user` ADD INDEX `idx_wx_union_id` (`wx_union_id`);
ALTER TABLE `user` ADD INDEX `idx_username` (`username`);
ALTER TABLE `user` ADD INDEX `idx_phone` (`phone`);

-- Add unique constraints
ALTER TABLE `user` ADD UNIQUE KEY `uk_wx_open_id` (`wx_open_id`);
ALTER TABLE `user` ADD UNIQUE KEY `uk_username` (`username`);
ALTER TABLE `user` ADD UNIQUE KEY `uk_phone` (`phone`);

-- Update table comment
ALTER TABLE `user` COMMENT = 'User table - supports WeChat login';