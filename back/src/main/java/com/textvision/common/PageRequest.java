package com.textvision.common;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * 分页查询请求类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class PageRequest {

    /**
     * 页码（从1开始）
     */
    @Min(value = 1, message = "页码不能小于1")
    private Integer page = 1;

    /**
     * 每页大小
     */
    @Min(value = 1, message = "每页大小不能小于1")
    @Max(value = 100, message = "每页大小不能超过100")
    private Integer size = 10;

    /**
     * 排序字段
     */
    private String sortBy = "createdAt";

    /**
     * 排序方向：asc-升序，desc-降序
     */
    private String sortDir = "desc";

    /**
     * 搜索关键词
     */
    private String keyword;

    /**
     * 获取偏移量
     */
    public long getOffset() {
        return (long) (page - 1) * size;
    }

    /**
     * 获取限制数量
     */
    public long getLimit() {
        return size;
    }

    /**
     * 是否升序排序
     */
    public boolean isAsc() {
        return "asc".equalsIgnoreCase(sortDir);
    }
}