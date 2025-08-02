import React, { useState, useEffect } from 'react';
import {
  NavBar,
  Field,
  Button,
  Radio,
  RadioGroup,
  Switch,
  Cell,
  CellGroup,
  Uploader,
  Popup,
  Slider,
  Stepper,
  Toast,
  Loading,
  Image as VantImage,
  ActionSheet,
  ActionSheetAction
} from 'vant';
import { useNavigate } from 'react-router-dom';
import { useGenerationStore } from '../store/useGenerationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useArtStyleStore } from '../store/useArtStyleStore';

interface ImageParams {
  size: string;
  quality: string;
  seed?: number;
  guidanceScale?: number;
}

interface VideoParams {
  resolution: string;
  duration: number;
  ratio: string;
  fps: number;
  cameraFixed: boolean;
  cfgScale: number;
  count: number;
}

export default function Generate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [watermark, setWatermark] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<number | undefined>(undefined);
  const [showParams, setShowParams] = useState(false);
  const [showStyleSheet, setShowStyleSheet] = useState(false);

  // 参数配置
  const [imageParams, setImageParams] = useState<ImageParams>({
    size: '1024x1024',
    quality: 'standard',
    seed: undefined,
    guidanceScale: undefined
  });

  const [videoParams, setVideoParams] = useState<VideoParams>({
    resolution: '720p',
    duration: 5,
    ratio: '16:9',
    fps: 24,
    cameraFixed: false,
    cfgScale: 7,
    count: 1
  });

  const { generateContent, isGenerating, currentGeneration, history, loadHistory } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();
  const { styles, fetchStyles, getStylesByType } = useArtStyleStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
    fetchStyles();
  }, [isAuthenticated, loadHistory, fetchStyles]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.fail('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      Toast.fail('请先登录后再进行创作');
      return;
    }

    try {
      const params: any = {
        watermark,
        referenceImage
      };

      if (selectedStyleId) {
        params.styleId = selectedStyleId;
      }

      if (type === 'image') {
        params.size = imageParams.size;
        params.quality = imageParams.quality;
        if (imageParams.seed !== undefined && imageParams.seed >= -1 && imageParams.seed <= 2147483647) {
          params.seed = imageParams.seed;
        }
        if (imageParams.guidanceScale !== undefined && imageParams.guidanceScale >= 1 && imageParams.guidanceScale <= 10) {
          params.guidanceScale = imageParams.guidanceScale;
        }
      }

      if (type === 'video') {
        params.resolution = videoParams.resolution;
        params.duration = videoParams.duration;
        params.ratio = videoParams.ratio;
        params.fps = videoParams.fps;
        params.cameraFixed = videoParams.cameraFixed;
        params.cfgScale = videoParams.cfgScale;
        params.count = videoParams.count;
      }

      await generateContent(prompt, type, params);
      Toast.success('生成成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      Toast.fail(errorMessage);
    }
  };

  const handleImageUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImage(e.target?.result as string);
    };
    reader.readAsDataURL(file.file);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `textvision-${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.success('下载开始');
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '文生视界 - 我的创作',
          text: prompt || '精彩创作内容',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        Toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(url);
        Toast.success('链接已复制到剪贴板');
      } catch (clipboardError) {
        Toast.fail('分享失败');
      }
    }
  };

  const availableStyles = getStylesByType(type);
  const styleActions: ActionSheetAction[] = [
    { name: '默认风格', value: undefined },
    ...availableStyles.map(style => ({
      name: style.name,
      value: style.id
    }))
  ];

  const selectedStyleName = selectedStyleId 
    ? availableStyles.find(s => s.id === selectedStyleId)?.name || '默认风格'
    : '默认风格';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        title="AI创作工坊"
        leftText="返回"
        onClickLeft={() => navigate('/')}
        className="bg-white"
      />

      <div className="p-4 space-y-4">
        {/* 文本输入 */}
        <CellGroup>
          <Field
            value={prompt}
            onChange={setPrompt}
            label="创作描述"
            type="textarea"
            placeholder="请描述您想要创作的内容..."
            rows={4}
            maxlength={500}
            showWordLimit
          />
        </CellGroup>

        {/* 类型选择 */}
        <CellGroup title="创作类型">
          <RadioGroup value={type} onChange={setType}>
            <Cell title="图片" clickable>
              <Radio name="image" />
            </Cell>
            <Cell title="视频" clickable>
              <Radio name="video" />
            </Cell>
          </RadioGroup>
        </CellGroup>

        {/* 艺术风格选择 */}
        <CellGroup title="艺术风格">
          <Cell
            title="选择风格"
            value={selectedStyleName}
            isLink
            onClick={() => setShowStyleSheet(true)}
          />
        </CellGroup>

        {/* 参考图片上传 */}
        <CellGroup title="参考图片（可选）">
          <Cell>
            <Uploader
              accept="image/*"
              maxCount={1}
              afterRead={handleImageUpload}
              onDelete={() => setReferenceImage(null)}
            >
              {referenceImage ? (
                <VantImage src={referenceImage} width={80} height={80} fit="cover" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  上传图片
                </div>
              )}
            </Uploader>
          </Cell>
        </CellGroup>

        {/* 其他设置 */}
        <CellGroup title="其他设置">
          <Cell title="添加水印">
            <Switch checked={watermark} onChange={setWatermark} />
          </Cell>
          <Cell
            title="高级参数"
            isLink
            onClick={() => setShowParams(true)}
          />
        </CellGroup>

        {/* 生成按钮 */}
        <div className="px-4 py-6">
          <Button
            type="primary"
            size="large"
            block
            loading={isGenerating}
            disabled={!prompt.trim()}
            onClick={handleGenerate}
            className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
          >
            {isGenerating ? '生成中...' : '开始生成'}
          </Button>
        </div>

        {/* 生成结果 */}
        {currentGeneration && (
          <CellGroup title="生成结果">
            <div className="p-4">
              {currentGeneration.type === 'video' ? (
                <video
                  src={currentGeneration.url}
                  controls
                  className="w-full rounded-lg"
                  poster={currentGeneration.thumbnail}
                />
              ) : (
                <VantImage
                  src={currentGeneration.url}
                  width="100%"
                  fit="contain"
                  className="rounded-lg"
                />
              )}
              
              <div className="flex space-x-2 mt-4">
                <Button
                  size="small"
                  type="primary"
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
              </div>
            </div>
          </CellGroup>
        )}

        {/* 最近生成 */}
        {history.length > 0 && (
          <CellGroup title="最近生成">
            <div className="grid grid-cols-2 gap-2 p-4">
              {history.slice(0, 6).map((item, index) => (
                <div key={index} className="relative">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full aspect-square object-cover rounded-lg"
                      poster={item.thumbnail}
                    />
                  ) : (
                    <VantImage
                      src={item.url}
                      width="100%"
                      height={120}
                      fit="cover"
                      className="rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </CellGroup>
        )}
      </div>

      {/* 艺术风格选择弹窗 */}
      <ActionSheet
        show={showStyleSheet}
        actions={styleActions}
        onSelect={(action) => {
          setSelectedStyleId(action.value);
          setShowStyleSheet(false);
        }}
        onCancel={() => setShowStyleSheet(false)}
        title="选择艺术风格"
      />

      {/* 高级参数弹窗 */}
      <Popup
        show={showParams}
        position="bottom"
        round
        onClose={() => setShowParams(false)}
        style={{ height: '60%' }}
      >
        <div className="p-4">
          <div className="text-lg font-semibold mb-4">高级参数</div>
          
          {type === 'image' ? (
            <div className="space-y-4">
              <CellGroup>
                <Cell title="图片尺寸">
                  <RadioGroup
                    value={imageParams.size}
                    onChange={(value) => setImageParams(prev => ({ ...prev, size: value }))}
                  >
                    <div className="space-y-2">
                      <Radio name="1024x1024">1024x1024</Radio>
                      <Radio name="1024x1792">1024x1792</Radio>
                      <Radio name="1792x1024">1792x1024</Radio>
                    </div>
                  </RadioGroup>
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title="图片质量">
                  <RadioGroup
                    value={imageParams.quality}
                    onChange={(value) => setImageParams(prev => ({ ...prev, quality: value }))}
                  >
                    <div className="space-y-2">
                      <Radio name="standard">标准</Radio>
                      <Radio name="hd">高清</Radio>
                    </div>
                  </RadioGroup>
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title="随机种子">
                  <Stepper
                    value={imageParams.seed || 0}
                    min={-1}
                    max={2147483647}
                    onChange={(value) => setImageParams(prev => ({ ...prev, seed: value }))}
                  />
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title={`引导强度: ${imageParams.guidanceScale || 7}`}>
                  <Slider
                    value={imageParams.guidanceScale || 7}
                    min={1}
                    max={10}
                    step={0.5}
                    onChange={(value) => setImageParams(prev => ({ ...prev, guidanceScale: value }))}
                  />
                </Cell>
              </CellGroup>
            </div>
          ) : (
            <div className="space-y-4">
              <CellGroup>
                <Cell title="视频分辨率">
                  <RadioGroup
                    value={videoParams.resolution}
                    onChange={(value) => setVideoParams(prev => ({ ...prev, resolution: value }))}
                  >
                    <div className="space-y-2">
                      <Radio name="480p">480p</Radio>
                      <Radio name="720p">720p</Radio>
                      <Radio name="1080p">1080p</Radio>
                    </div>
                  </RadioGroup>
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title={`时长: ${videoParams.duration}秒`}>
                  <Slider
                    value={videoParams.duration}
                    min={3}
                    max={10}
                    step={1}
                    onChange={(value) => setVideoParams(prev => ({ ...prev, duration: value }))}
                  />
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title="宽高比">
                  <RadioGroup
                    value={videoParams.ratio}
                    onChange={(value) => setVideoParams(prev => ({ ...prev, ratio: value }))}
                  >
                    <div className="space-y-2">
                      <Radio name="16:9">16:9</Radio>
                      <Radio name="9:16">9:16</Radio>
                      <Radio name="1:1">1:1</Radio>
                    </div>
                  </RadioGroup>
                </Cell>
              </CellGroup>
              
              <CellGroup>
                <Cell title="固定镜头">
                  <Switch
                    checked={videoParams.cameraFixed}
                    onChange={(value) => setVideoParams(prev => ({ ...prev, cameraFixed: value }))}
                  />
                </Cell>
              </CellGroup>
            </div>
          )}
          
          <div className="mt-6">
            <Button
              type="primary"
              size="large"
              block
              onClick={() => setShowParams(false)}
            >
              确定
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
}