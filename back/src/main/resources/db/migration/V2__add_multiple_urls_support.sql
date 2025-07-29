-- 添加多个URL和缩略图支持
ALTER TABLE generated_content 
ADD COLUMN urls JSON COMMENT '多个生成内容URL（用于多视频生成）',
ADD COLUMN thumbnails JSON COMMENT '多个缩略图URL';

-- 为现有数据迁移单个URL到urls数组
UPDATE generated_content 
SET urls = JSON_ARRAY(url), 
    thumbnails = CASE 
        WHEN thumbnail IS NOT NULL AND thumbnail != '' THEN JSON_ARRAY(thumbnail)
        ELSE NULL 
    END
WHERE url IS NOT NULL AND url != '';