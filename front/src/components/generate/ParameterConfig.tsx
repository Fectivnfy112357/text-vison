import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, ChevronDown, ChevronUp } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

interface ParameterConfigProps {
  type: 'image' | 'video';
  imageParams: ImageGenerationParams;
  videoParams: VideoGenerationParams;
  onImageParamsChange: (params: ImageGenerationParams) => void;
  onVideoParamsChange: (params: VideoGenerationParams) => void;
}

export interface ImageGenerationParams {
  size: string;
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
}

export default function ParameterConfig({
  type,
  imageParams,
  videoParams,
  onImageParamsChange,
  onVideoParamsChange
}: ParameterConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);

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
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20"
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

      <AnimatePresence mode="wait">
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.12,
              ease: [0.25, 0.1, 0.25, 1],
              opacity: { duration: 0.08 }
            }}
            className="px-8 pb-8"
            style={{ contain: 'layout paint style' }}
          >
            <div className="border-t border-gray-100 pt-6">
              {type === 'image' ? (
                <ImageParameters
                  params={imageParams}
                  onParamChange={handleImageParamChange}
                />
              ) : (
                <VideoParameters
                  params={videoParams}
                  onParamChange={handleVideoParamChange}
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
}

function ImageParameters({ params, onParamChange }: ImageParametersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">图片尺寸</label>
        <CustomSelect
          value={params.size}
          onChange={(value) => onParamChange('size', value as string)}
          options={[
            { value: '1024x1024', label: '正方形 (1024x1024)' },
            { value: '1152x896', label: '横屏 (1152x896)' },
            { value: '896x1152', label: '竖屏 (896x1152)' },
            { value: '1216x832', label: '宽屏 (1216x832)' },
            { value: '832x1216', label: '长屏 (832x1216)' }
          ]}
          placeholder="选择图片尺寸"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">图片质量</label>
        <CustomSelect
          value={params.quality}
          onChange={(value) => onParamChange('quality', value as string)}
          options={[
            { value: 'standard', label: '标准质量' },
            { value: 'hd', label: '高清质量' }
          ]}
          placeholder="选择图片质量"
        />
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
  resolutionOptions: { value: string; label: string }[];
  ratioOptions: { value: string; label: string }[];
  durationOptions: { value: number; label: string }[];
}

function VideoParameters({ 
  params, 
  onParamChange, 
  resolutionOptions, 
  ratioOptions, 
  durationOptions 
}: VideoParametersProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">分辨率</label>
          <CustomSelect
            value={params.resolution}
            onChange={(value) => onParamChange('resolution', value as string)}
            options={resolutionOptions}
            placeholder="选择分辨率"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">时长</label>
          <CustomSelect
            value={params.duration}
            onChange={(value) => onParamChange('duration', Number(value))}
            options={durationOptions}
            placeholder="选择时长"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">画面比例</label>
          <CustomSelect
            value={params.ratio}
            onChange={(value) => onParamChange('ratio', value as string)}
            options={ratioOptions}
            placeholder="选择画面比例"
          />
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