/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 优化：移除开发模式警告，启用生产优化
  purge: {
    enabled: import.meta.env?.MODE === 'production',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // 预定义常用类，避免被 purged
        'bg-gradient-to-br',
        'from-cream-50',
        'via-mist-50',
        'to-sky-50',
        'backdrop-blur-sm',
        'backdrop-blur-md',
        'blur-xl',
        'blur-2xl',
        'blur-3xl',
      ]
    }
  },
  theme: {
    extend: {
      colors: {
        // 奶白色系
        cream: {
          50: '#fefefe',
          100: '#fdfcfc',
          200: '#fbf8f8',
          300: '#f8f4f4',
          400: '#f5f0f0',
          500: '#f2ecec',
          600: '#e8dede',
          700: '#d4c4c4',
          800: '#b8a4a4',
          900: '#9a8484'
        },
        // 雾紫色系
        mist: {
          50: '#faf9fc',
          100: '#f5f3f9',
          200: '#ebe7f3',
          300: '#ddd6ea',
          400: '#c9bedd',
          500: '#b3a0ce',
          600: '#9b82bd',
          700: '#8268a8',
          800: '#6b5589',
          900: '#574670'
        },
        // 淡蓝色系
        sky: {
          50: '#f8fbff',
          100: '#f1f7fe',
          200: '#e3effd',
          300: '#d1e4fb',
          400: '#b8d4f8',
          500: '#9bc1f4',
          600: '#7aa8ee',
          700: '#5a8de6',
          800: '#4272d9',
          900: '#3559c7'
        },
        // 主色调
        primary: {
          50: '#faf9fc',
          100: '#f5f3f9',
          200: '#ebe7f3',
          300: '#ddd6ea',
          400: '#c9bedd',
          500: '#b3a0ce',
          600: '#9b82bd',
          700: '#8268a8',
          800: '#6b5589',
          900: '#574670'
        },
        // 辅助色
        secondary: {
          50: '#f8fbff',
          100: '#f1f7fe',
          200: '#e3effd',
          300: '#d1e4fb',
          400: '#b8d4f8',
          500: '#9bc1f4',
          600: '#7aa8ee',
          700: '#5a8de6',
          800: '#4272d9',
          900: '#3559c7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(179, 160, 206, 0.3)',
        'glow-blue': '0 0 20px rgba(155, 193, 244, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  // 性能优化配置
  future: {
    hoverOnlyWhenSupported: true,
  },
  variants: {
    extend: {
      // 性能优化：减少变体数量
      opacity: ['responsive', 'hover', 'focus', 'disabled'],
      transform: ['responsive', 'hover', 'focus', 'disabled'],
    },
  },
  plugins: [],
}