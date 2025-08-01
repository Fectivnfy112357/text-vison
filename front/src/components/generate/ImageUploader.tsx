import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  label?: string;
  maxSize?: number;
  accept?: string;
  className?: string;
  aspectRatio?: 'square' | 'rectangle';
}

export default function ImageUploader({
  image,
  onImageChange,
  label = "参考图片",
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = "image/*",
  className = "",
  aspectRatio = "rectangle"
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        const sizeInMB = maxSize / (1024 * 1024);
        toast.error(`图片大小不能超过${sizeInMB}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        toast.success(`${label}上传成功`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClasses = aspectRatio === 'square' 
    ? 'aspect-square' 
    : 'h-20';

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      
      {image ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <img
            src={image}
            alt={label}
            className={`w-full object-cover rounded-xl shadow-md ${aspectClasses}`}
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 transition-all duration-300 flex flex-col justify-center group ${aspectClasses}`}
        >
          <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-500 mx-auto mb-1 transition-colors" />
          <p className="text-gray-500 group-hover:text-purple-600 text-xs font-medium transition-colors">上传图片</p>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}

// 批量图片上传组件
interface BatchImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number;
  label?: string;
}

export function BatchImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxSize = 30 * 1024 * 1024,
  label = "上传图片"
}: BatchImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.size <= maxSize);
    
    if (validFiles.length !== files.length) {
      const sizeInMB = maxSize / (1024 * 1024);
      toast.error(`部分图片超过${sizeInMB}MB限制`);
    }

    if (images.length + validFiles.length > maxImages) {
      toast.error(`最多只能上传${maxImages}张图片`);
      return;
    }

    const newImages: string[] = [];
    let processedCount = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) newImages.push(result);
        
        processedCount++;
        if (processedCount === validFiles.length) {
          onImagesChange([...images, ...newImages]);
          toast.success(`成功上传${newImages.length}张图片`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">{label} ({images.length}/{maxImages})</label>
      
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group aspect-square"
          >
            <img
              src={image}
              alt={`${label} ${index + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-sm"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2" />
            </button>
          </motion.div>
        ))}
        
        {images.length < maxImages && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
          >
            <Upload className="w-4 h-4 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">添加</p>
          </motion.div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImagesUpload}
        className="hidden"
      />
    </div>
  );
}