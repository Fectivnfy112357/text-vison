/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 奶白色系 - 主要背景色
        cream: {
          50: '#fefefe',
          100: '#fdfcfc',
          200: '#fbf9f9',
          300: '#f8f5f5',
          400: '#f5f0f0',
          500: '#f2ebeb',
          600: '#ede5e5',
          700: '#e6dddd',
          800: '#ddd2d2',
          900: '#d0c3c3',
        },
        // 雾紫色系 - 主要强调色
        mist: {
          50: '#faf8ff',
          100: '#f4f0ff',
          200: '#ebe4ff',
          300: '#ddd1ff',
          400: '#c9b6ff',
          500: '#b197fc',
          600: '#9775fa',
          700: '#845ef7',
          800: '#7048e8',
          900: '#5f3dc4',
        },
        // 淡蓝色系 - 辅助色
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 柔和渐变色
        gradient: {
          primary: 'linear-gradient(135deg, #f2ebeb 0%, #ebe4ff 50%, #e0f2fe 100%)',
          soft: 'linear-gradient(135deg, #faf8ff 0%, #f0f9ff 100%)',
          warm: 'linear-gradient(135deg, #fefefe 0%, #f4f0ff 100%)',
        },
        // 保留原有颜色以兼容现有组件
        primary: {
          50: '#faf8ff',
          100: '#f4f0ff',
          200: '#ebe4ff',
          300: '#ddd1ff',
          400: '#c9b6ff',
          500: '#b197fc',
          600: '#9775fa',
          700: '#845ef7',
          800: '#7048e8',
          900: '#5f3dc4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'blob': '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'jelly': '0 8px 32px rgba(183, 151, 252, 0.15)',
        'cream': '0 4px 20px rgba(242, 235, 235, 0.3)',
        'mist': '0 4px 20px rgba(177, 151, 252, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce-soft 1s infinite',
        'jelly': 'jelly 0.6s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        jelly: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.05)' },
          '40%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '65%': { transform: 'scale(0.98)' },
          '75%': { transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

