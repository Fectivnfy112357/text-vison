create table art_style
(
    id              bigint auto_increment comment '风格ID'
        primary key,
    name            varchar(50)                         not null comment '风格名称',
    description     varchar(200)                        not null comment '风格描述',
    applicable_type varchar(20)                         not null comment '适用类型：image-图片，video-视频，both-两者',
    sort_order      int       default 0                 null comment '排序权重',
    status          tinyint   default 1                 null comment '状态：0-禁用，1-启用',
    created_at      timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at      timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted         tinyint   default 0                 null comment '逻辑删除：0-未删除，1-已删除'
)
    comment '艺术风格表';

create table template_category
(
    id          bigint auto_increment comment '分类ID'
        primary key,
    name        varchar(50)                         not null comment '分类名称',
    description varchar(200)                        null comment '分类描述',
    icon        varchar(100)                        null comment '分类图标',
    sort_order  int       default 0                 null comment '排序权重',
    status      tinyint   default 1                 null comment '状态：0-禁用，1-启用',
    created_at  timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted     tinyint   default 0                 null comment '逻辑删除：0-未删除，1-已删除',
    constraint uk_name
        unique (name)
)
    comment '模板分类表';

create table template
(
    id           bigint auto_increment comment '模板ID'
        primary key,
    title        varchar(100)                        not null comment '模板标题',
    description  text                                null comment '模板描述',
    prompt       text                                not null comment '模板提示词',
    category     varchar(50)                         not null comment '模板分类',
    category_id  bigint                              null comment '分类ID',
    art_style_id bigint                              null comment '艺术风格ID',
    tags         json                                null comment '标签列表',
    image_url    varchar(500)                        null comment '模板预览图',
    type         varchar(20)                         not null comment '类型：image-图片，video-视频',
    usage_count  int       default 0                 null comment '使用次数',
    status       tinyint   default 1                 null comment '状态：0-禁用，1-启用',
    created_at   timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at   timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted      tinyint   default 0                 null comment '逻辑删除：0-未删除，1-已删除',
    constraint fk_template_category
        foreign key (category_id) references template_category (id)
            on delete set null
)
    comment '模板表';

create index idx_art_style_id
    on template (art_style_id);

create index idx_category_id
    on template (category_id);

create index idx_sort_order
    on template_category (sort_order);

create index idx_status
    on template_category (status);

create table user
(
    id         bigint auto_increment comment '用户ID'
        primary key,
    email      varchar(100)                        not null comment '邮箱',
    name       varchar(50)                         not null comment '用户名',
    password   varchar(255)                        not null comment '密码',
    avatar     varchar(500)                        null comment '头像URL',
    status     tinyint   default 1                 null comment '状态：0-禁用，1-启用',
    created_at timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted    tinyint   default 0                 null comment '逻辑删除：0-未删除，1-已删除',
    constraint email
        unique (email)
)
    comment '用户表';

create table generated_content
(
    id                bigint auto_increment comment '内容ID'
        primary key,
    user_id           bigint                                not null comment '用户ID',
    type              varchar(20)                           not null comment '类型：image-图片，video-视频',
    prompt            text                                  not null comment '生成提示词',
    url               longtext                              not null comment '生成内容URL',
    thumbnail         longtext                              null comment '缩略图URL',
    size              varchar(20)                           null comment '尺寸比例',
    style             varchar(50)                           null comment '艺术风格',
    processing_type   varchar(50)                           null comment '处理类型：outfit_change, character_change, weather_change, style_transfer',
    reference_image   longtext                              null comment '参考图片URL',
    template_id       bigint                                null comment '使用的模板ID',
    generation_params json                                  null comment '生成参数',
    status            varchar(20) default 'generating'      null comment '状态：generating-生成中，completed-完成，failed-失败',
    error_message     text                                  null comment '错误信息',
    created_at        timestamp   default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at        timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted           tinyint     default 0                 null comment '逻辑删除：0-未删除，1-已删除',
    urls              json                                  null comment '多个生成内容URL（用于多视频生成）',
    thumbnails        json                                  null comment '多个缩略图URL',
    constraint fk_generated_content_template
        foreign key (template_id) references template (id)
            on delete set null,
    constraint fk_generated_content_user
        foreign key (user_id) references user (id)
            on delete cascade
)
    comment '生成内容表';

create index idx_created_at
    on generated_content (created_at);

create index idx_processing_type
    on generated_content (processing_type);

create index idx_status
    on generated_content (status);

create index idx_type
    on generated_content (type);

create index idx_user_id
    on generated_content (user_id);

create table user_operation_log
(
    id            bigint auto_increment comment '日志ID'
        primary key,
    user_id       bigint                              null comment '用户ID',
    operation     varchar(50)                         not null comment '操作类型',
    resource_type varchar(50)                         null comment '资源类型',
    resource_id   bigint                              null comment '资源ID',
    details       json                                null comment '操作详情',
    ip_address    varchar(45)                         null comment 'IP地址',
    user_agent    varchar(500)                        null comment '用户代理',
    created_at    timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    constraint fk_user_operation_log_user
        foreign key (user_id) references user (id)
            on delete set null
)
    comment '用户操作日志表';

create index idx_created_at
    on user_operation_log (created_at);

create index idx_operation
    on user_operation_log (operation);

create index idx_user_id
    on user_operation_log (user_id);

INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (1, '动漫风格', '动漫风', 'both', 1, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (2, '油画风格', '油画风', 'both', 2, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (3, '水彩风格', '水彩风', 'both', 3, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (4, '素描风格', '素描风', 'image', 4, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (5, '写实风格', '写实风', 'both', 5, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (6, '卡通风格', '卡通风', 'both', 6, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (7, '科幻风格', '科幻风', 'both', 7, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);
INSERT INTO text_vision.art_style (id, name, description, applicable_type, sort_order, status, created_at, updated_at, deleted) VALUES (8, '古典风格', '古典风', 'both', 8, 1, '2025-08-01 09:16:21', '2025-08-01 09:16:21', 0);


INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (2, '风景', '自然风光、城市景观等风景类模板', 'mountain', 1, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (3, '人像', '人物肖像、艺术摄影等人像类模板', 'user', 2, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (4, '艺术', '抽象艺术、创意设计等艺术类模板', 'palette', 3, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (5, '视频', '动态视频、动画效果等视频类模板', 'video', 4, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (6, '商业', '产品展示、营销推广等商业类模板', 'briefcase', 5, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
INSERT INTO text_vision.template_category (id, name, description, icon, sort_order, status, created_at, updated_at, deleted) VALUES (7, '其他', '其他类型模板', 'more-horizontal', 99, 1, '2025-08-01 09:14:07', '2025-08-01 09:14:07', 0);
