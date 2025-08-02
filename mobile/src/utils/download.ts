// 下载工具函数

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    // 移动端优先使用原生下载
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 备用方案：打开新窗口
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('下载失败:', error);
    throw new Error('下载失败，请稍后重试');
  }
};

/**
 * 分享内容
 * @param data 分享数据
 */
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<void> => {
  try {
    // 检查是否支持原生分享
    if (navigator.share) {
      await navigator.share(data);
    } else {
      // 备用方案：复制到剪贴板
      const shareText = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`;
      await navigator.clipboard.writeText(shareText);
      throw new Error('已复制到剪贴板');
    }
  } catch (error) {
    if (error instanceof Error && error.message === '已复制到剪贴板') {
      throw error;
    }
    console.error('分享失败:', error);
    throw new Error('分享失败，请稍后重试');
  }
};

/**
 * 获取文件名从URL
 * @param url 文件URL
 * @returns 文件名
 */
export const getFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'download';
    return filename;
  } catch {
    return 'download';
  }
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};