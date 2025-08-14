/**
 * 解析宽高比字符串 (如 "16:9") 并返回宽度与高度的比值
 * @param aspectRatio 格式为 "width:height" 的字符串
 * @returns 宽高比数值 (width/height)
 */
export function parseAspectRatio(aspectRatio: string): number {
  if (!aspectRatio) {
    return 1; // 默认正方形
  }

  const parts = aspectRatio.split(':');
  if (parts.length !== 2) {
    return 1; // 格式错误时返回默认值
  }

  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);

  if (isNaN(width) || isNaN(height) || height === 0) {
    return 1; // 数值无效时返回默认值
  }

  return width / height;
}

/**
 * 根据宽高比计算高度
 * @param width 宽度
 * @param aspectRatio 宽高比字符串 (如 "16:9")
 * @returns 计算出的高度
 */
export function calculateHeight(width: number, aspectRatio: string): number {
  const ratio = parseAspectRatio(aspectRatio);
  return width / ratio;
}

/**
 * 根据宽高比计算宽度
 * @param height 高度
 * @param aspectRatio 宽高比字符串 (如 "16:9")
 * @returns 计算出的宽度
 */
export function calculateWidth(height: number, aspectRatio: string): number {
  const ratio = parseAspectRatio(aspectRatio);
  return height * ratio;
}