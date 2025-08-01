import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { useArtStyleStore } from '@/store/useArtStyleStore';

interface ParameterConfigProps {
  type: 'image' | 'video';
  imageParams: ImageGenerationParams;
  videoParams: VideoGenerationParams;
  onImageParamsChange: (params: ImageGenerationParams) => void;
  onVideoParamsChange: (params: VideoGenerationParams) => void;
}

export interface ImageGenerationParams {
  size: string;
  styleId?: number;
  quality: string;
  responseFormat: string;
  seed?: number;
  guidanceScale?: number;
}

export interface VideoGenerationParams {
  resolution: string;
  duration: number;
  ratio: string;
  fps: number;
  cameraFixed: boolean;
  cfgScale: number;
  count: number;
  styleId?: number;
}

export default function ParameterConfig({
  type,
  imageParams,
  videoParams,
  onImageParamsChange,
  onVideoParamsChange
}: ParameterConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const { styles, getStylesByType } = useArtStyleStore();

  // 视频参数选项
  const resolutionOptions = [
    { value: '480p', label: '480p (标清)' },
    { value: '720p', label: '720p (高清)' },
    { value: '1080p', label: '1080p (全高清)' }
  ];

  const ratioOptions = [
    { value: '1:1', label: '正方形 (1:1)' },
    { value: '3:4', label: '竖屏 (3:4)' },
    { value: '4:3', label: '横屏 (4:3)' },
    { value: '16:9', label: '宽屏 (16:9)' },
    { value: '9:16', label: '竖屏 (9:16)' },
    { value: '21:9', label: '超宽屏 (21:9)' }
  ];

  const durationOptions = [
    { value: 5, label: '5秒' },
    { value: 10, label: '10秒' }
  ];

  const handleImageParamChange = <K extends keyof ImageGenerationParams>(
    key: K,
    value: ImageGenerationParams[K]
  ) => {
    onImageParamsChange({ ...imageParams, [key]: value });
  };

  const handleVideoParamChange = <K extends keyof VideoGenerationParams>(
    key: K,
    value: VideoGenerationParams[K]
  ) => {
    onVideoParamsChange({ ...videoParams, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
    >
      <div 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="p-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
              {type === 'image' ? <ImageIcon className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </div>
            {type === 'image' ? '图片参数' : '视频参数'}
          </h2>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-8 pb-8"
          >
            <div className="border-t border-gray-100 pt-6">
              {type === 'image' ? (
                <ImageParameters
                  params={imageParams}
                  onParamChange={handleImageParamChange}
                  styles={getStylesByType('image')}
                />
              ) : (
                <VideoParameters
                  params={videoParams}
                  onParamChange={handleVideoParamChange}
                  styles={getStylesByType('video')}
                  resolutionOptions={resolutionOptions}
                  ratioOptions={ratioOptions}
                  durationOptions={durationOptions}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ImageParametersProps {
  params: ImageGenerationParams;
  onParamChange: <K extends keyof ImageGenerationParams>(key: K, value: ImageGenerationParams[K]) => void;
  styles: any[];
}

function ImageParameters({ params, onParamChange, styles }: ImageParametersProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">图片尺寸</label>
        <select
          value={params.size}
          onChange={(e) => onParamChange('size', e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
        >
          <option value="1024x1024">正方形 (1024x1024)</option>
          <option value="1152x896">横屏 (1152x896)</option>
          <option value="896x1152">竖屏 (896x1152)</option>
          <option value="1216x832">宽屏 (1216x832)</option>
          <option value="832x1216">长屏 (832x1216)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">图片质量</label>
        <select
          value={params.quality}
          onChange={(e) => onParamChange('quality', e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
        >
          <option value="standard">标准质量</option>
          <option value="hd">高清质量</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">艺术风格</label>
        <select
          value={params.styleId || ''}
          onChange={(e) => {
            const selectedId = e.target.value ? Number(e.target.value) : undefined;
            onParamChange('styleId', selectedId);
          }}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
        >
          <option value="">选择艺术风格（可选）</option>
          {styles.map((artStyle) => (
            <option key={artStyle.id} value={artStyle.id}>
              {artStyle.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">随机种子</label>
        <input
          type="number"
          value={params.seed || ''}
          onChange={(e) => onParamChange('seed', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="可选，用于复现结果"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
        />
      </div>
    </div>
  );
}

interface VideoParametersProps {
  params: VideoGenerationParams;
  onParamChange: <K extends keyof VideoGenerationParams>(key: K, value: VideoGenerationParams[K]) => void;
  styles: any[];
  resolutionOptions: { value: string; label: string }[];
  ratioOptions: { value: string; label: string }[];
  durationOptions: { value: number; label: string }[];
}

function VideoParameters({ 
  params, 
  onParamChange, 
  styles, 
  resolutionOptions, 
  ratioOptions, 
  durationOptions 
}: VideoParametersProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">分辨率</label>
          <select
            value={params.resolution}
            onChange={(e) => onParamChange('resolution', e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          >
            {resolutionOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">时长</label>
          <select
            value={params.duration}
            onChange={(e) => onParamChange('duration', Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">画面比例</label>
          <select
            value={params.ratio}
            onChange={(e) => onParamChange('ratio', e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          >
            {ratioOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">帧率</label>
          <input
            type="number"
            value={params.fps}
            onChange={(e) => onParamChange('fps', Number(e.target.value))}
            min="12"
            max="60"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">艺术风格</label>
          <select
            value={params.styleId || ''}
            onChange={(e) => {
              const selectedId = e.target.value ? Number(e.target.value) : undefined;
              onParamChange('styleId', selectedId);
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
          >
            <option value="">选择艺术风格（可选）</option>
            {styles.map((artStyle) => (
              <option key={artStyle.id} value={artStyle.id}>
                {artStyle.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="cameraFixed" className="text-sm font-semibold text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              固定摄像头
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-4">减少镜头运动，画面更稳定</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="cameraFixed"
              checked={params.cameraFixed}
              onChange={(e) => onParamChange('cameraFixed', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 shadow-inner"></div>
          </label>
        </div>
      </div>
    </div>
  );
}