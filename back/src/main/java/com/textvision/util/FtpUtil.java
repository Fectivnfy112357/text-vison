package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * 文件上传工具类
 * 支持FTP和HTTP协议上传
 */
@Slf4j
@Component
public class FtpUtil {

    @Value("${file.upload.protocol:ftp}")
    private String uploadProtocol;

    @Value("${file.ftp.host:223.72.35.202}")
    private String ftpHost;

    @Value("${file.ftp.port:21}")
    private int ftpPort;

    @Value("${file.ftp.username:anonymous}")
    private String ftpUsername;

    @Value("${file.ftp.password:}")
    private String ftpPassword;

    @Value("${file.ftp.uploadApiUrl:}")
    private String uploadApiUrl;

    private static final int TIMEOUT = 30000;

    /**
     * 上传文件
     *
     * @param fileName    文件名
     * @param inputStream 文件输入流
     * @return 上传后的文件URL
     */
    public String uploadFile(String fileName, InputStream inputStream) {
        return uploadToFtpServer(fileName, inputStream);
    }

    /**
     * 上传到FTP服务器
     */
    private String uploadToFtpServer(String fileName, InputStream inputStream) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
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
                // 返回HTTP下载接口URL而不是FTP URL
                String fileUrl = String.format(uploadApiUrl, fileName);
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
     * 上传字节数组
     *
     * @param fileName 文件名
     * @param data     文件数据
     * @return 上传后的文件URL
     */
    public String uploadFile(String fileName, byte[] data) {
        return uploadFile(fileName, new ByteArrayInputStream(data));
    }

    /**
     * 从FTP服务器下载文件
     *
     * @param fileName 文件名
     * @return 文件内容的字节数组
     */
    public byte[] downloadFile(String fileName) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
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

            // 检查文件是否存在
            FTPFile[] files = ftpClient.listFiles(fileName);
            if (files == null || files.length == 0) {
                log.error("文件不存在: {}", fileName);
                return null;
            }

            // 下载文件
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            boolean success = ftpClient.retrieveFile(fileName, outputStream);

            if (success) {
                log.info("文件下载成功: {}", fileName);
                return outputStream.toByteArray();
            } else {
                log.error("文件下载失败: {}", ftpClient.getReplyString());
                return null;
            }

        } catch (IOException e) {
            log.error("FTP下载文件异常: {}", fileName, e);
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
        }
    }

    /**
     * 从FTP服务器下载文件并保存到本地
     *
     * @param fileName  FTP上的文件名
     * @param localPath 本地保存路径
     * @return 是否下载成功
     */
    public boolean downloadFile(String fileName, String localPath) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
            ftpClient.setDataTimeout(TIMEOUT);
            ftpClient.setConnectTimeout(TIMEOUT);
            ftpClient.setDefaultTimeout(TIMEOUT);

            // 检查连接是否成功
            int reply = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(reply)) {
                log.error("FTP连接失败: {}", ftpClient.getReplyString());
                return false;
            }

            // 设置被动模式
            ftpClient.enterLocalPassiveMode();
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);

            // 切换到根目录
            ftpClient.changeWorkingDirectory("/");

            // 检查文件是否存在
            FTPFile[] files = ftpClient.listFiles(fileName);
            if (files == null || files.length == 0) {
                log.error("文件不存在: {}", fileName);
                return false;
            }

            // 下载文件到本地
            try (FileOutputStream fos = new FileOutputStream(localPath)) {
                boolean success = ftpClient.retrieveFile(fileName, fos);
                if (success) {
                    log.info("文件下载成功: {} -> {}", fileName, localPath);
                    return true;
                } else {
                    log.error("文件下载失败: {}", ftpClient.getReplyString());
                    return false;
                }
            }

        } catch (IOException e) {
            log.error("FTP下载文件异常: {}", fileName, e);
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException e) {
                log.error("关闭FTP连接异常", e);
            }
        }
    }

    /**
     * 列出FTP服务器上的文件
     *
     * @param path 路径
     * @return 文件列表
     */
    public String[] listFiles(String path) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
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

            // 切换到指定目录
            if (!ftpClient.changeWorkingDirectory(path)) {
                log.error("切换目录失败: {}", path);
                return null;
            }

            // 获取文件列表
            String[] files = ftpClient.listNames();
            log.info("获取文件列表成功: {}, 文件数量: {}", path, files != null ? files.length : 0);
            return files;

        } catch (IOException e) {
            log.error("FTP列出文件异常: {}", path, e);
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
        }
    }

    /**
     * 删除FTP服务器上的文件
     *
     * @param fileName 文件名
     * @return 是否删除成功
     */
    public boolean deleteFile(String fileName) {
        FTPClient ftpClient = new FTPClient();
        try {
            // 连接FTP服务器
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
            ftpClient.setDataTimeout(TIMEOUT);
            ftpClient.setConnectTimeout(TIMEOUT);
            ftpClient.setDefaultTimeout(TIMEOUT);

            // 检查连接是否成功
            int reply = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(reply)) {
                log.error("FTP连接失败: {}", ftpClient.getReplyString());
                return false;
            }

            // 删除文件
            boolean success = ftpClient.deleteFile(fileName);
            if (success) {
                log.info("文件删除成功: {}", fileName);
                return true;
            } else {
                log.error("文件删除失败: {}", ftpClient.getReplyString());
                return false;
            }

        } catch (IOException e) {
            log.error("FTP删除文件异常: {}", fileName, e);
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException e) {
                log.error("关闭FTP连接异常", e);
            }
        }
    }
}