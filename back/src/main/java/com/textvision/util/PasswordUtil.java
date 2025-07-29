package com.textvision.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * 密码工具类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Component
public class PasswordUtil {

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 密码强度正则表达式
     * 至少包含一个字母和一个数字，长度6-20位
     */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{6,20}$"
    );

    /**
     * 加密密码
     * 
     * @param rawPassword 原始密码
     * @return 加密后的密码
     */
    public static String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * 验证密码
     * 
     * @param rawPassword 原始密码
     * @param encodedPassword 加密后的密码
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 验证密码强度
     * 
     * @param password 密码
     * @return 是否符合强度要求
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }

    /**
     * 生成随机密码
     * 
     * @param length 密码长度
     * @return 随机密码
     */
    public static String generateRandomPassword(int length) {
        if (length < 6) {
            length = 6;
        }
        if (length > 20) {
            length = 20;
        }

        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
        StringBuilder password = new StringBuilder();
        
        // 确保至少包含一个字母和一个数字
        password.append((char) ('A' + Math.random() * 26)); // 大写字母
        password.append((char) ('0' + Math.random() * 10)); // 数字
        
        // 填充剩余字符
        for (int i = 2; i < length; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        
        // 打乱字符顺序
        return shuffleString(password.toString());
    }

    /**
     * 打乱字符串
     * 
     * @param str 原字符串
     * @return 打乱后的字符串
     */
    private static String shuffleString(String str) {
        char[] chars = str.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = (int) (Math.random() * (i + 1));
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }

    /**
     * 获取密码强度等级
     * 
     * @param password 密码
     * @return 强度等级：1-弱，2-中，3-强
     */
    public static int getPasswordStrength(String password) {
        if (password == null || password.length() < 6) {
            return 0; // 无效密码
        }

        int score = 0;
        
        // 长度评分
        if (password.length() >= 8) score++;
        if (password.length() >= 12) score++;
        
        // 字符类型评分
        if (password.matches(".*[a-z].*")) score++; // 小写字母
        if (password.matches(".*[A-Z].*")) score++; // 大写字母
        if (password.matches(".*\\d.*")) score++; // 数字
        if (password.matches(".*[@$!%*?&].*")) score++; // 特殊字符
        
        // 返回强度等级
        if (score <= 2) return 1; // 弱
        if (score <= 4) return 2; // 中
        return 3; // 强
    }
}