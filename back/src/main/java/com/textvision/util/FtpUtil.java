package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * FTP工具类
 * 用于上传文件到FTP服务器
 */
@Slf4j
@Component
public class FtpUtil {

    private static final String FTP_HOST = "223.72.35.202";
    private static final int FTP_PORT = 21;
    private static final String FTP_USERNAME = "anonymous";
    private static final String FTP_PASSWORD = "";
    private static final int TIMEOUT = 30000;

    /**
     * 上传文件到FTP服务器
     *
     * @param fileName    文件名
     * @param inputStream 文件输入流
     * @return 上传后的文件URL
     */
    public String uploadFile(String fileName, InputStream inputStream) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(FTP_HOST, FTP_PORT);
            ftpClient.login(FTP_USERNAME, FTP_PASSWORD);
            ftpClient.setDataTimeout(TIMEOUT);
            ftpClient.setConnectTimeout(TIMEOUT);
            ftpClient.setDefaultTimeout(TIMEOUT);

            // 检查连接是否成功
            int reply = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(reply)) {
                log.error("FTP连接失败: {}", ftpClient.getReplyString());
                return null;
            }

            // 设置被动模式
            ftpClient.enterLocalPassiveMode();
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);

            // 切换到根目录
            ftpClient.changeWorkingDirectory("/");

            // 上传文件
            boolean success = ftpClient.storeFile(fileName, inputStream);
            if (success) {
                String fileUrl = String.format("ftp://%s:%d/%s", FTP_HOST, FTP_PORT, fileName);
                log.info("文件上传成功: {}", fileUrl);
                return fileUrl;
            } else {
                log.error("文件上传失败: {}", ftpClient.getReplyString());
                return null;
            }

        } catch (IOException e) {
            log.error("FTP上传文件异常", e);
            return null;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException e) {
                log.error("关闭FTP连接异常", e);
            }
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (IOException e) {
                log.error("关闭输入流异常", e);
            }
        }
    }

    /**
     * 上传字节数组到FTP服务器
     *
     * @param fileName 文件名
     * @param data     文件数据
     * @return 上传后的文件URL
     */
    public String uploadFile(String fileName, byte[] data) {
        return uploadFile(fileName, new ByteArrayInputStream(data));
    }
}