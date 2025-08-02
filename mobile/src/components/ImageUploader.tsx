import React, { useState } from 'react';
import { Uploader, Toast } from 'vant';
import { UploaderFileListItem } from 'vant';

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
  const [fileList, setFileList] = useState<UploaderFileListItem[]>(
    value ? [{ url: value, isImage: true }] : []
  );

  const handleAfterRead = (file: UploaderFileListItem | UploaderFileListItem[]) => {
    const fileItem = Array.isArray(file) ? file[0] : file;
    
    if (fileItem.file) {
      // 检查文件大小
      if (fileItem.file.size > maxSize * 1024 * 1024) {
        Toast.fail(`图片大小不能超过${maxSize}MB`);
        return;
      }

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newFileList = [{ ...fileItem, url, isImage: true }];
        setFileList(newFileList);
        onChange?.(url);
      };
      reader.readAsDataURL(fileItem.file);
    }
  };

  const handleDelete = () => {
    setFileList([]);
    onChange?.('');
  };

  const handleBeforeRead = (file: File) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      Toast.fail('请选择图片文件');
      return false;
    }
    return true;
  };

  return (
    <div className="image-uploader">
      <Uploader
        fileList={fileList}
        onAfterRead={handleAfterRead}
        onDelete={handleDelete}
        beforeRead={handleBeforeRead}
        accept={accept}
        maxCount={1}
        previewSize={80}
        uploadText={placeholder}
        className="touch-target"
      />
      {fileList.length === 0 && (
        <div className="text-xs text-gray-500 mt-2">
          支持 JPG、PNG 格式，大小不超过 {maxSize}MB
        </div>
      )}
    </div>
  );
};

export default ImageUploader;