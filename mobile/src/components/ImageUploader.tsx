import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  maxSize?: number; // MB
  accept?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  maxSize = 5,
  accept = 'image/*',
  placeholder = '点击上传图片'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`图片大小不能超过${maxSize}MB`);
      return;
    }

    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setPreviewUrl('');
    setError('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <div className="text-2xl mb-1">📷</div>
          <div className="text-xs text-center leading-tight">
            {placeholder}
          </div>
        </button>
      )}
      
      {error && (
        <div className="text-xs text-red-500 mt-1">
          {error}
        </div>
      )}
      
      {!previewUrl && !error && (
        <div className="text-xs text-gray-500 mt-2">
          支持 JPG、PNG 格式，大小不超过 {maxSize}MB
        </div>
      )}
    </div>
  );
};

export default ImageUploader;