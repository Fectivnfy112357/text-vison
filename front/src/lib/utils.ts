import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 通用工具函数

// 日期格式化工具
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return '刚刚';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} 小时前`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

// 文件下载工具
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 内容下载工具
export const downloadContent = (content: {
  id: string;
  url?: string;
  urls?: string[];
  type?: string;
}, specificUrl?: string, index?: number): void => {
  // 如果有具体的URL，直接下载
  if (specificUrl) {
    const isVideo = specificUrl.includes('.mp4') || specificUrl.includes('video');
    const fileType = isVideo ? 'mp4' : 'jpg';
    const fileId = content.id || Date.now().toString();
    const filename = `textvision-${fileId}${index !== undefined ? `-${index + 1}` : ''}.${fileType}`;
    downloadFile(specificUrl, filename);
    return;
  }

  if (!content || (!content.url && (!content.urls || content.urls.length === 0))) {
    throw new Error('下载失败：无效的文件链接');
  }

  const fileType = content.type === 'video' ? 'mp4' : 'jpg';
  const fileId = content.id || 'unknown';
  const urls = content.urls || (content.url ? [content.url] : []);

  if (urls.length === 1) {
    const filename = `textvision-${fileId}.${fileType}`;
    downloadFile(urls[0], filename);
  } else {
    urls.forEach((url, index) => {
      setTimeout(() => {
        const filename = `textvision-${fileId}-${index + 1}.${fileType}`;
        downloadFile(url, filename);
      }, index * 500);
    });
  }
};

// 内容分享工具
export const shareContent = async (content: {
  url?: string;
  prompt?: string;
}, specificUrl?: string): Promise<void> => {
  const shareUrl = specificUrl || content.url;
  if (!shareUrl) {
    throw new Error('分享失败：无效的内容链接');
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: '文生视界 - 我的创作',
        text: content.prompt || '精彩创作内容',
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  } catch (error) {
    // 降级到剪贴板复制
    await navigator.clipboard.writeText(shareUrl);
  }
};

// 内容格式化工具
export const formatGeneratedContent = (item: any): any => {
  return {
    id: item.id?.toString() || '',
    type: item.type || 'image',
    prompt: item.prompt || '',
    url: item.url || '',
    thumbnail: item.thumbnail || undefined,
    urls: item.urls || (item.url ? [item.url] : []),
    thumbnails: item.thumbnails || (item.thumbnail ? [item.thumbnail] : []),
    createdAt: new Date(item.createdAt || item.createTime || Date.now()),
    size: item.size || 'landscape_16_9',
    style: item.style || '默认风格',
    referenceImage: item.referenceImage || undefined,
    status: item.status || 'completed'
  };
};

// 错误处理工具
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '操作失败，请重试';
};

// 验证工具函数
export const validatePassword = (password: string, confirmPassword?: string): string | null => {
  if (!password || password.trim().length === 0) {
    return '请输入密码';
  }
  if (password.length < 6) {
    return '密码长度至少6位';
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return '两次输入的密码不一致';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return '请输入邮箱地址';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '请输入有效的邮箱地址';
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `请输入${fieldName}`;
  }
  return null;
};

// URL参数构建工具
export const buildUrlWithParams = (baseUrl: string, params: Record<string, any>): string => {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.pathname + url.search;
};
