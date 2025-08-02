import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Button,
  Card,
  TextArea,
  Radio,
  Switch,
  Picker,
  Popup,
  Image,
  Toast,
  Loading,
  Tag,
  Stepper,
  Space,
  Grid,
  List,
  Divider
} from 'antd-mobile';
import { useAuthStore } from '../store/useAuthStore';
import { useGenerationStore } from '../store/useGenerationStore';
import { useTemplateStore } from '../store/useTemplateStore';
import { useArtStyleStore } from '../store/useArtStyleStore';

// 参数接口定义
interface ImageGenerationParams {
  size: string;
  quality: string;
  responseFormat: string;
  seed?: number;
  guidanceScale?: number;
}

interface VideoGenerationParams {
  resolution: string;
  duration: number;
  ratio: string;
  fps: number;
  cameraFixed: boolean;
  cfgScale: number;
  count: number;
}

const Generate: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { generateContent, isGenerating, history, currentGeneration } = useGenerationStore();
  const { templates } = useTemplateStore();
  const { styles: artStyles } = useArtStyleStore();

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [watermark, setWatermark] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<number | undefined>(undefined);

  // 图片参数
  const [imageParams, setImageParams] = useState<ImageGenerationParams>({
    size: '1024x1024',
    quality: 'standard',
    responseFormat: 'url',
    seed: undefined,
    guidanceScale: undefined
  });

  // 视频参数
  const [videoParams, setVideoParams] = useState<VideoGenerationParams>({
    resolution: '720p',
    duration: 5,
    ratio: '16:9',
    fps: 24,
    cameraFixed: false,
    cfgScale: 7,
    count: 1
  });

  // UI状态
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showQualityPicker, setShowQualityPicker] = useState(false);
  const [showResolutionPicker, setShowResolutionPicker] = useState(false);
  const [showRatioPicker, setShowRatioPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // 选项数据
  const imageSizeOptions = [
    [{ label: '正方形 (1024x1024)', value: '1024x1024' }],
    [{ label: '横屏 (1152x896)', value: '1152x896' }],
    [{ label: '竖屏 (896x1152)', value: '896x1152' }],
    [{ label: '宽屏 (1216x832)', value: '1216x832' }],
    [{ label: '长屏 (832x1216)', value: '832x1216' }]
  ];

  const qualityOptions = [
    [{ label: '标准质量', value: 'standard' }],
    [{ label: '高清质量', value: 'hd' }]
  ];

  const resolutionOptions = [
    [{ label: '480p (标清)', value: '480p' }],
    [{ label: '720p (高清)', value: '720p' }],
    [{ label: '1080p (全高清)', value: '1080p' }]
  ];

  const ratioOptions = [
    [{ label: '正方形 (1:1)', value: '1:1' }],
    [{ label: '竖屏 (3:4)', value: '3:4' }],
    [{ label: '横屏 (4:3)', value: '4:3' }],
    [{ label: '宽屏 (16:9)', value: '16:9' }],
    [{ label: '竖屏 (9:16)', value: '9:16' }],
    [{ label: '超宽屏 (21:9)', value: '21:9' }]
  ];

  const durationOptions = [
    [{ label: '5秒', value: 5 }],
    [{ label: '10秒', value: 10 }]
  ];

  // 检查认证状态
  useEffect(() => {
    if (!isAuthenticated) {
      Toast.show('请先登录后再使用创作功能');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.show('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      Toast.show('请先登录');
      return;
    }

    try {
      const params: any = {
        watermark,
        referenceImage,
        styleId: selectedStyleId
      };

      if (type === 'image') {
        params.size = imageParams.size;
        params.quality = imageParams.quality;
        params.responseFormat = imageParams.responseFormat;
        if (imageParams.seed) params.seed = imageParams.seed;
        if (imageParams.guidanceScale) params.guidanceScale = imageParams.guidanceScale;
      } else {
        params.resolution = videoParams.resolution;
        params.duration = videoParams.duration;
        params.ratio = videoParams.ratio;
        params.fps = videoParams.fps;
        params.cameraFixed = videoParams.cameraFixed;
        params.cfgScale = videoParams.cfgScale;
        params.count = videoParams.count;
      }

      await generateContent(prompt, type, params);
      Toast.show('生成成功！');
    } catch (error) {
      console.error('生成失败:', error);
      Toast.show('生成失败，请重试');
    }
  };

  const handleDownload = (url: string) => {
    // 移动端下载逻辑
    const link = document.createElement('a');
    link.href = url;
    link.download = `textvision-${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '文生视界创作分享',
          text: prompt,
          url: url
        });
      } catch (error) {
        console.log('分享取消或失败');
      }
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(url);
      Toast.show('链接已复制到剪贴板');
    }
  };

  const getSelectedText = (options: any[][], value: any) => {
    for (const optionGroup of options) {
      const option = optionGroup.find((opt: any) => opt.value === value);
      if (option) return option.label;
    }
    return value;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="generate-page min-h-screen bg-gray-50 pb-16">
      <NavBar
        onBack={() => navigate('/')}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
      >
        AI创作工坊
      </NavBar>

      <div className="p-4 space-y-4">
        {/* 创作输入区域 */}
        <Card title="创作描述" className="mb-4">
          <TextArea
            value={prompt}
            onChange={setPrompt}
            placeholder="描述您想要创作的内容，例如：一只可爱的小猫坐在花园里，阳光明媚，卡通风格"
            rows={4}
            maxLength={500}
            showCount
          />
        </Card>

        {/* 内容类型选择 */}
        <Card title="内容类型">
          <Radio.Group value={type} onChange={(val) => setType(val as 'image' | 'video')}>
            <Space direction="vertical">
              <Radio value="image">
                <div className="flex items-center">
                  <span className="mr-2">🖼️</span>
                  <span>图片生成</span>
                </div>
              </Radio>
              <Radio value="video">
                <div className="flex items-center">
                  <span className="mr-2">🎬</span>
                  <span>视频生成</span>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </Card>

        {/* 艺术风格选择 */}
        <Card title="艺术风格">
          <List.Item 
            onClick={() => setShowStylePicker(true)}
            arrow
          >
            {selectedStyleId 
              ? artStyles.find(s => s.id === selectedStyleId)?.name || '选择风格'
              : '选择风格（可选）'
            }
          </List.Item>
        </Card>

        {/* 参数配置 */}
        <Card title={type === 'image' ? '图片参数' : '视频参数'}>
          {type === 'image' ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 图片尺寸 */}
              <List.Item 
                onClick={() => setShowSizePicker(true)}
                arrow
                extra={getSelectedText(imageSizeOptions, imageParams.size)}
              >
                图片尺寸
              </List.Item>

              {/* 图片质量 */}
              <List.Item 
                onClick={() => setShowQualityPicker(true)}
                arrow
                extra={getSelectedText(qualityOptions, imageParams.quality)}
              >
                图片质量
              </List.Item>

              {/* 高级参数 */}
              <List.Item 
                extra={
                  <Switch 
                    checked={showAdvancedParams} 
                    onChange={setShowAdvancedParams}
                  />
                }
              >
                显示高级参数
              </List.Item>

              {showAdvancedParams && (
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">随机种子</label>
                      <input
                        type="number"
                        value={imageParams.seed || ''}
                        onChange={(e) => setImageParams(prev => ({ 
                          ...prev, 
                          seed: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        placeholder="可选，用于复现结果"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">引导强度</label>
                      <input
                        type="number"
                        value={imageParams.guidanceScale || ''}
                        onChange={(e) => setImageParams(prev => ({ 
                          ...prev, 
                          guidanceScale: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        placeholder="1-20，默认7.5"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </Space>
              )}
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 分辨率 */}
              <List.Item 
                onClick={() => setShowResolutionPicker(true)}
                arrow
                extra={getSelectedText(resolutionOptions, videoParams.resolution)}
              >
                分辨率
              </List.Item>

              {/* 时长 */}
              <List.Item 
                onClick={() => setShowDurationPicker(true)}
                arrow
                extra={getSelectedText(durationOptions, videoParams.duration)}
              >
                时长
              </List.Item>

              {/* 画面比例 */}
              <List.Item 
                onClick={() => setShowRatioPicker(true)}
                arrow
                extra={getSelectedText(ratioOptions, videoParams.ratio)}
              >
                画面比例
              </List.Item>

              {/* 帧率 */}
              <List.Item 
                extra={
                  <Stepper
                    value={videoParams.fps}
                    onChange={(value) => setVideoParams(prev => ({ ...prev, fps: Number(value) }))}
                    min={12}
                    max={60}
                    step={1}
                  />
                }
              >
                帧率 (FPS)
              </List.Item>

              {/* 固定摄像头 */}
              <List.Item 
                extra={
                  <Switch 
                    checked={videoParams.cameraFixed} 
                    onChange={(checked) => setVideoParams(prev => ({ ...prev, cameraFixed: checked }))}
                  />
                }
                description="减少镜头运动，画面更稳定"
              >
                固定摄像头
              </List.Item>

              {/* 高级参数 */}
              <List.Item 
                extra={
                  <Switch 
                    checked={showAdvancedParams} 
                    onChange={setShowAdvancedParams}
                  />
                }
              >
                显示高级参数
              </List.Item>

              {showAdvancedParams && (
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }}>
                  <List.Item 
                    extra={
                      <Stepper
                        value={videoParams.cfgScale}
                        onChange={(value) => setVideoParams(prev => ({ ...prev, cfgScale: Number(value) }))}
                        min={1}
                        max={20}
                        step={0.5}
                      />
                    }
                  >
                    CFG Scale
                  </List.Item>
                  <List.Item 
                    extra={
                      <Stepper
                        value={videoParams.count}
                        onChange={(value) => setVideoParams(prev => ({ ...prev, count: Number(value) }))}
                        min={1}
                        max={4}
                        step={1}
                      />
                    }
                  >
                    生成数量
                  </List.Item>
                </Space>
              )}
            </Space>
          )}
        </Card>

        {/* 其他选项 */}
        <Card title="其他选项">
          <List.Item 
            extra={
              <Switch 
                checked={watermark} 
                onChange={setWatermark}
              />
            }
          >
            添加水印
          </List.Item>
        </Card>

        {/* 生成按钮 */}
        <div className="sticky bottom-20 z-10">
          <Button
            color="primary"
            size="large"
            block
            loading={isGenerating}
            disabled={!prompt.trim()}
            onClick={handleGenerate}
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
              border: 'none'
            }}
          >
            {isGenerating ? '生成中...' : '开始生成'}
          </Button>
        </div>

        {/* 生成结果 */}
        {currentGeneration && (
          <Card title="生成结果" className="mt-4">
            {currentGeneration.type === 'image' ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentGeneration.type === 'image' && currentGeneration.url && (
                  <div className="relative">
                    <Image
                      src={currentGeneration.url}
                      alt="Generated image"
                      style={{ width: '100%', borderRadius: '8px' }}
                      fit="cover"
                    />
                    <Space style={{ marginTop: '8px' }}>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => handleDownload(currentGeneration.url!)}
                      >
                        下载
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleShare(currentGeneration.url!)}
                      >
                        分享
                      </Button>
                    </Space>
                  </div>
                )}
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentGeneration.type === 'video' && currentGeneration.url && (
                  <div className="relative">
                    <video
                      src={currentGeneration.url}
                      controls
                      style={{ width: '100%', borderRadius: '8px' }}
                      poster={currentGeneration.thumbnails?.[0]}
                    />
                    <Space style={{ marginTop: '8px' }}>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => handleDownload(currentGeneration.url!)}
                      >
                        下载
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleShare(currentGeneration.url!)}
                      >
                        分享
                      </Button>
                    </Space>
                  </div>
                )}
              </Space>
            )}
          </Card>
        )}

        {/* 最近生成 */}
        {history.length > 0 && (
          <Card title="最近生成" className="mt-4">
            <Grid columns={2} gap={12}>
              {history.slice(0, 4).map((item) => (
                <Grid.Item key={item.id}>
                  <div className="relative">
                    <Image
                      src={item.type === 'image' ? item.url : item.thumbnails?.[0]}
                      alt={item.prompt}
                      style={{ width: '100%', height: '96px', borderRadius: '8px' }}
                      fit="cover"
                    />
                    <Tag 
                      color={item.type === 'video' ? 'primary' : 'success'}
                      style={{ position: 'absolute', top: '4px', left: '4px' }}
                    >
                      {item.type === 'video' ? '视频' : '图片'}
                    </Tag>
                  </div>
                </Grid.Item>
              ))}
            </Grid>
          </Card>
        )}
      </div>

      {/* 选择器弹窗 */}
      <Popup
        visible={showStylePicker}
        onMaskClick={() => setShowStylePicker(false)}
        position="bottom"
        bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">选择艺术风格</h3>
          <Grid columns={2} gap={12} style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <Grid.Item>
              <div 
                className={`p-3 border rounded-lg cursor-pointer ${
                  !selectedStyleId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedStyleId(undefined);
                  setShowStylePicker(false);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🎨</div>
                  <span className="text-sm">默认风格</span>
                </div>
              </div>
            </Grid.Item>
            {artStyles.map((style) => (
              <Grid.Item key={style.id}>
                <div
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedStyleId === style.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedStyleId(style.id);
                    setShowStylePicker(false);
                  }}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded flex items-center justify-center text-2xl mb-2">
                    🎨
                  </div>
                  <div className="text-xs font-medium text-center">{style.name}</div>
                   <div className="text-xs text-gray-500 text-center mt-1">{style.description}</div>
                </div>
              </Grid.Item>
            ))}
          </Grid>
        </div>
      </Popup>

      {/* 图片尺寸选择器 */}
      <Picker
        columns={imageSizeOptions}
        visible={showSizePicker}
        onClose={() => setShowSizePicker(false)}
        onConfirm={(values) => {
          setImageParams(prev => ({ ...prev, size: values[0] as string }));
          setShowSizePicker(false);
        }}
        title="选择图片尺寸"
      />

      {/* 图片质量选择器 */}
      <Picker
        columns={qualityOptions}
        visible={showQualityPicker}
        onClose={() => setShowQualityPicker(false)}
        onConfirm={(values) => {
          setImageParams(prev => ({ ...prev, quality: values[0] as string }));
          setShowQualityPicker(false);
        }}
        title="选择图片质量"
      />

      {/* 视频分辨率选择器 */}
      <Picker
        columns={resolutionOptions}
        visible={showResolutionPicker}
        onClose={() => setShowResolutionPicker(false)}
        onConfirm={(values) => {
          setVideoParams(prev => ({ ...prev, resolution: values[0] as string }));
          setShowResolutionPicker(false);
        }}
        title="选择分辨率"
      />

      {/* 画面比例选择器 */}
      <Picker
        columns={ratioOptions}
        visible={showRatioPicker}
        onClose={() => setShowRatioPicker(false)}
        onConfirm={(values) => {
          setVideoParams(prev => ({ ...prev, ratio: values[0] as string }));
          setShowRatioPicker(false);
        }}
        title="选择画面比例"
      />

      {/* 时长选择器 */}
      <Picker
        columns={durationOptions}
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        onConfirm={(values) => {
          setVideoParams(prev => ({ ...prev, duration: values[0] as number }));
          setShowDurationPicker(false);
        }}
        title="选择时长"
      />
    </div>
  );
};

export default Generate;