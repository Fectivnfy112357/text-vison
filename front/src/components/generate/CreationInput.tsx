import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Upload } from 'lucide-react';
import { useArtStyleStore } from '@/store/useArtStyleStore';

interface CreationInputProps {
  prompt: string;
  type: 'image' | 'video';
  selectedStyleId: number | undefined;
  referenceImage: string | null;
  watermark: boolean;
  onPromptChange: (prompt: string) => void;
  onTypeChange: (type: 'image' | 'video') => void;
  onStyleChange: (styleId: number | undefined) => void;
  onReferenceImageChange: (image: string | null) => void;
  onWatermarkChange: (watermark: boolean) => void;
}

export default function CreationInput({
  prompt,
  type,
  selectedStyleId,
  referenceImage,
  watermark,
  onPromptChange,
  onTypeChange,
  onStyleChange,
  onReferenceImageChange,
  onWatermarkChange
}: CreationInputProps) {
  const { styles, getStylesByType } = useArtStyleStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onReferenceImageChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeReferenceImage = () => {
    onReferenceImageChange(null);
  };

  const availableStyles = getStylesByType(type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        描述您的创意
      </h2>

      {/* 文本输入区域 */}
      <div className="relative mb-6">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="请详细描述您想要生成的内容，例如：一只可爱的小猫坐在彩虹桥上，背景是梦幻的星空..."
          className="w-full h-40 p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all duration-300 text-gray-700 placeholder-gray-400 bg-gray-50/50 backdrop-blur-sm"
          maxLength={500}
        />
        <div className="absolute bottom-4 right-4 flex items-center space-x-3">
          <span className={`text-sm font-medium ${prompt.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
            {prompt.length}/500
          </span>
          {prompt.length > 0 && (
            <button
              onClick={() => onPromptChange('')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition-all"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 参考图片上传区域 - 增大尺寸 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">参考图片</label>
        {referenceImage ? (
          <div className="relative">
            <img
              src={referenceImage}
              alt="参考图片"
              className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
            />
            <button
              onClick={removeReferenceImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center h-48 ${isDragging
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:bg-purple-50 hover:border-purple-300'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-500'
              }`} />
            <p className={`text-lg font-medium transition-colors ${isDragging ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
              }`}>
              {isDragging ? '释放以上传图片' : '点击或拖拽上传参考图片'}
            </p>
            <p className="text-sm text-gray-400 mt-2">支持 JPG、PNG、GIF 格式，最大 10MB</p>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* 生成类型和艺术风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 生成类型 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">生成类型</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onTypeChange('image')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${type === 'image'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-purple-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>图片</span>
            </button>
            <button
              onClick={() => onTypeChange('video')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${type === 'video'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-purple-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>视频</span>
            </button>
          </div>
        </div>

        {/* 艺术风格 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">艺术风格</label>
          <select
            value={selectedStyleId || ''}
            onChange={(e) => onStyleChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          >
            <option value="">选择艺术风格（可选）</option>
            {availableStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 水印设置 */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              添加水印
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-4">在生成的内容上添加平台标识，保护您的创作</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => onWatermarkChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500 shadow-inner"></div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}