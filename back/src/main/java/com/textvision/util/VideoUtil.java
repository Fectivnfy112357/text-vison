package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;
import java.util.Random;

/**
 * 视频处理工具类
 * 用于从视频中提取帧作为缩略图
 * 使用简化版实现，不依赖FFmpeg
 */
@Slf4j
@Component
public class VideoUtil {

    /**
     * 从视频URL提取第一帧作为缩略图（简化版）
     * 注意：这是一个简化实现，实际使用FFmpeg效果更好
     *
     * @param videoUrl 视频URL
     * @return 缩略图的字节数组
     */
    public byte[] extractFirstFrame(String videoUrl) {
        try {
            log.info("开始处理视频URL: {}", videoUrl);
            
            // 由于无法直接使用FFmpeg，这里创建一个模拟的缩略图
            // 在实际生产环境中，应该：
            // 1. 调用FFmpeg命令行工具
            // 2. 或使用云服务API
            // 3. 或部署完整的JavaCV环境
            
            // 创建一个默认的缩略图（黑色背景加上文字提示）
            BufferedImage thumbnail = createDefaultThumbnail(videoUrl);
            
            // 转换为字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(thumbnail, "jpg", outputStream);
            
            log.info("生成默认缩略图成功: {}", videoUrl);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("生成视频缩略图异常: {}", videoUrl, e);
            return null;
        }
    }
    
    /**
     * 创建默认缩略图
     */
    private BufferedImage createDefaultThumbnail(String videoUrl) {
        // 创建320x180的缩略图
        int width = 320;
        int height = 180;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        
        // 获取绘图上下文
        Graphics2D g2d = image.createGraphics();
        
        // 设置抗锯齿
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        
        // 填充背景
        g2d.setColor(new Color(41, 128, 185)); // 蓝色背景
        g2d.fillRect(0, 0, width, height);
        
        // 设置文字颜色和字体
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("Arial", Font.BOLD, 16));
        
        // 绘制文字
        String text = "Video Thumbnail";
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(text);
        int textHeight = fm.getHeight();
        
        g2d.drawString(text, (width - textWidth) / 2, (height - textHeight) / 2 + fm.getAscent());
        
        // 绘制视频URL（简化版）
        g2d.setFont(new Font("Arial", Font.PLAIN, 10));
        String urlText = videoUrl.length() > 40 ? videoUrl.substring(0, 37) + "..." : videoUrl;
        g2d.drawString(urlText, 5, height - 10);
        
        // 绘制播放图标
        drawPlayIcon(g2d, width / 2 - 15, height / 2 - 15, 30);
        
        g2d.dispose();
        
        return image;
    }
    
    /**
     * 绘制播放图标
     */
    private void drawPlayIcon(Graphics2D g2d, int x, int y, int size) {
        // 绘制圆形背景
        g2d.setColor(new Color(255, 255, 255, 180));
        g2d.fillOval(x, y, size, size);
        
        // 绘制三角形播放按钮
        g2d.setColor(new Color(41, 128, 185));
        int[] xPoints = {x + size/3, x + size*2/3, x + size/3};
        int[] yPoints = {y + size/3, y + size/2, y + size*2/3};
        g2d.fillPolygon(xPoints, yPoints, 3);
    }
    
    /**
     * 生成缩略图文件名
     *
     * @param originalVideoUrl 原始视频URL
     * @return 缩略图文件名
     */
    public String generateThumbnailFileName(String originalVideoUrl) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return String.format("thumbnail_%s.jpg", uuid);
    }
    
    /**
     * 检查是否为视频URL
     */
    public boolean isVideoUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        return lowerUrl.contains(".mp4") || 
               lowerUrl.contains(".avi") || 
               lowerUrl.contains(".mov") || 
               lowerUrl.contains(".wmv") || 
               lowerUrl.contains(".flv") || 
               lowerUrl.contains(".mkv") ||
               lowerUrl.contains(".webm");
    }
    
    /**
     * 调用外部FFmpeg命令提取视频帧（如果系统安装了FFmpeg）
     */
    public byte[] extractFirstFrameWithFFmpeg(String videoUrl) {
        try {
            // 这里需要系统安装了FFmpeg
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoUrl,
                "-vframes", "1",
                "-f", "image2pipe",
                "-vcodec", "mjpeg",
                "-"
            );
            
            Process process = pb.start();
            
            // 读取输出
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int bytesRead;
            
            try (java.io.InputStream is = process.getInputStream()) {
                while ((bytesRead = is.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0 && outputStream.size() > 0) {
                log.info("FFmpeg提取视频帧成功: {}", videoUrl);
                return outputStream.toByteArray();
            } else {
                log.error("FFmpeg执行失败，退出码: {}", exitCode);
                return null;
            }
            
        } catch (Exception e) {
            log.error("使用FFmpeg提取视频帧异常: {}", videoUrl, e);
            return null;
        }
    }
}