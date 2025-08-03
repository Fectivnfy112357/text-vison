import React, { useState } from 'react'
import {
  Popup,
  Grid,
  GridItem,
  Button,
  Toast,
  ActionSheet
} from 'react-vant'
import {
  Share,
  Download,
  Copy,
  MessageCircle,
  Send,
  Smartphone,
  Link
} from 'lucide-react'
import {
  nativeShare,
  saveImageToAlbum,
  saveVideoToAlbum,
  copyToClipboard,
  generateShareUrl,
  generateShareText,
  getSocialShareUrl,
  getBestShareMethod,
  getDeviceInfo,
  isNativeShareSupported,
  urlToFile,
  recordShareStats,
  type ShareOptions
} from '../../utils/share'

interface ShareData {
  type: 'image' | 'video'
  url: string
  title: string
  description: string
  thumbnail?: string
}

interface ShareModalProps {
  visible: boolean
  onClose: () => void
  shareData?: ShareData
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  shareData
}) => {
  if (!shareData) return null
  const [loading, setLoading] = useState(false)
  const [showSocialSheet, setShowSocialSheet] = useState(false)
  
  const { type: contentType, url: contentUrl, title, description: prompt, thumbnail } = shareData
  const contentId = Date.now().toString() // 临时ID
  const deviceInfo = getDeviceInfo()
  const shareUrl = generateShareUrl(contentId, contentType)
  const shareText = generateShareText(contentType, prompt)
  const bestMethod = getBestShareMethod(contentType)

  // 分享选项配置
  const shareOptions = [
    {
      key: 'native',
      title: '系统分享',
      icon: <Share className="w-6 h-6" />,
      available: isNativeShareSupported(),
      action: handleNativeShare
    },
    {
      key: 'save',
      title: '保存到相册',
      icon: <Download className="w-6 h-6" />,
      available: true,
      action: handleSaveToAlbum
    },
    {
      key: 'copy',
      title: '复制链接',
      icon: <Copy className="w-6 h-6" />,
      available: true,
      action: handleCopyLink
    },
    {
      key: 'social',
      title: '社交分享',
      icon: <Send className="w-6 h-6" />,
      available: true,
      action: () => setShowSocialSheet(true)
    }
  ]

  // 社交平台选项
  const socialPlatforms = [
    {
      name: '微信好友',
      callback: () => handleSocialShare('wechat')
    },
    {
      name: '微信朋友圈',
      callback: () => handleSocialShare('wechat-moments')
    },
    {
      name: '微博',
      callback: () => handleSocialShare('weibo')
    },
    {
      name: 'QQ',
      callback: () => handleSocialShare('qq')
    }
  ]

  // 原生分享
  async function handleNativeShare() {
    setLoading(true)
    try {
      let files: File[] | undefined
      
      // 如果支持文件分享，尝试转换为文件
      try {
        const mimeType = contentType === 'video' ? 'video/mp4' : 'image/png'
        const filename = `textvision_${contentId}.${contentType === 'video' ? 'mp4' : 'png'}`
        const file = await urlToFile(contentUrl, filename, mimeType)
        files = [file]
      } catch (error) {
        console.warn('Failed to convert URL to file:', error)
      }

      const shareOptions: ShareOptions = {
        type: contentType,
        data: {
          title: title || '文生视界 - AI创作分享',
          text: shareText,
          url: shareUrl,
          files
        }
      }

      const success = await nativeShare(shareOptions)
      if (success) {
        Toast.success('分享成功')
        onClose()
      }
    } catch (error) {
      console.error('Native share failed:', error)
      Toast.fail('分享失败，请尝试其他方式')
    } finally {
      setLoading(false)
    }
  }

  // 保存到相册
  async function handleSaveToAlbum() {
    setLoading(true)
    try {
      const filename = `textvision_${contentId}.${contentType === 'video' ? 'mp4' : 'png'}`
      
      let success = false
      if (contentType === 'video') {
        success = await saveVideoToAlbum(contentUrl, filename)
      } else {
        success = await saveImageToAlbum(contentUrl, filename)
      }

      if (success) {
        Toast.success('保存成功')
        
        // 记录统计
        await recordShareStats({
          contentId,
          contentType,
          platform: 'save',
          timestamp: Date.now()
        })
      } else {
        Toast.fail('保存失败')
      }
    } catch (error) {
      console.error('Save failed:', error)
      Toast.fail('保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 复制链接
  async function handleCopyLink() {
    setLoading(true)
    try {
      const success = await copyToClipboard(shareUrl)
      if (success) {
        Toast.success('链接已复制到剪贴板')
        
        // 记录统计
        await recordShareStats({
          contentId,
          contentType,
          platform: 'copy',
          timestamp: Date.now()
        })
      } else {
        Toast.fail('复制失败')
      }
    } catch (error) {
      console.error('Copy failed:', error)
      Toast.fail('复制失败')
    } finally {
      setLoading(false)
    }
  }

  // 社交平台分享
  async function handleSocialShare(platform: string) {
    setShowSocialSheet(false)
    setLoading(true)
    
    try {
      const shareData = {
        title: title || '文生视界 - AI创作分享',
        text: shareText,
        url: shareUrl
      }
      
      const socialUrl = getSocialShareUrl(platform, shareData)
      
      if (platform === 'wechat' || platform === 'wechat-moments') {
        // 微信分享需要特殊处理
        if (deviceInfo.isWeChat) {
          // 在微信中，复制链接并提示用户
          await copyToClipboard(shareUrl)
          Toast.success('链接已复制，可以粘贴分享给好友')
        } else {
          // 不在微信中，提示用户复制链接到微信分享
          await copyToClipboard(shareUrl)
          Toast.success('链接已复制，请在微信中粘贴分享')
        }
      } else {
        // 其他平台直接打开分享链接
        window.open(socialUrl, '_blank')
        Toast.success('正在跳转到分享页面')
      }
      
      // 记录统计
      await recordShareStats({
        contentId,
        contentType,
        platform,
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('Social share failed:', error)
      Toast.fail('分享失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Popup
        visible={visible}
        onClose={onClose}
        position="bottom"
        round
        closeable
        closeIcon="close"
        className="share-modal"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              分享作品
            </h3>
            <p className="text-sm text-gray-500">
              {contentType === 'video' ? '分享你的AI视频创作' : '分享你的AI图片创作'}
            </p>
          </div>

          {/* 内容预览 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {contentType === 'video' ? (
                <video 
                  src={contentUrl} 
                  className="w-16 h-16 rounded-lg object-cover"
                  muted
                />
              ) : (
                <img 
                  src={contentUrl} 
                  alt="Generated content" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {title || `AI${contentType === 'video' ? '视频' : '图片'}创作`}
                </p>
                {prompt && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {prompt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 分享选项网格 */}
          <Grid columns={4} gutter={16}>
            {shareOptions
              .filter(option => option.available)
              .map(option => (
                <GridItem key={option.key}>
                  <Button
                    type="default"
                    size="large"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-200"
                    onClick={option.action}
                    loading={loading}
                    disabled={loading}
                  >
                    <div className="text-blue-500">
                      {option.icon}
                    </div>
                    <span className="text-xs text-gray-700">
                      {option.title}
                    </span>
                  </Button>
                </GridItem>
              ))
            }
          </Grid>

          {/* 推荐分享方式提示 */}
          {bestMethod !== 'native' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  {bestMethod === 'social' 
                    ? '建议使用社交分享获得更好体验' 
                    : '建议复制链接到其他应用分享'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </Popup>

      {/* 社交平台选择 */}
      <ActionSheet
        visible={showSocialSheet}
        onCancel={() => setShowSocialSheet(false)}
        actions={socialPlatforms}
        title="选择分享平台"
        cancelText="取消"
      />
    </>
  )
}

export default ShareModal