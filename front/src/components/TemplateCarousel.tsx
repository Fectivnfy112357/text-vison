import { motion, useAnimation } from 'framer-motion';
  import { Template } from '@/store/useTemplateStore';
  import { Play, Image as ImageIcon } from 'lucide-react';
  import { Link } from 'react-router-dom';
  import { useCallback, useEffect, useRef } from 'react';

interface TemplateCarouselProps {
  templates: Template[];
}

const ITEM_WIDTH = 264; // w-64 (256px) + mx-2*2 (8px)
const SCROLL_SPEED = 0.05; // px per ms

export default function TemplateCarousel({ templates }: TemplateCarouselProps) {
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const controls1 = useAnimation();
  const controls2 = useAnimation();

  const animateScroll = useCallback(async (ref: React.RefObject<HTMLDivElement>, controls: any, direction: 'left' | 'right') => {
    if (!ref.current || templates.length === 0) return;

    const containerWidth = ref.current.scrollWidth / 2; // 因为我们复制了一份，所以实际宽度是总宽度的一半
    if (containerWidth === 0) return; // 避免除以零或者初始宽度为零的情况
    const duration = containerWidth / SCROLL_SPEED; // 计算滚动一周所需时间

    let initialX: number;
    let targetX: number;

    if (direction === 'left') {
      initialX = 0;
      targetX = -containerWidth;
    } else { // direction === 'right'
      initialX = -containerWidth; // Start from the end of the first copy
      targetX = 0; // Animate back to the beginning of the first copy
    }

    controls.set({ x: initialX });

    controls.start({
      x: targetX,
      transition: {
        x: { type: 'tween', ease: 'linear', duration: duration / 1000, repeat: Infinity, repeatType: 'loop' },
      },
    });
  }, [templates, controls1, controls2]);

  useEffect(() => {
    if (templates.length === 0) return;



    animateScroll(scrollRef1, controls1, 'left');
    animateScroll(scrollRef2, controls2, 'right');

    return () => {
      controls1.stop();
      controls2.stop();
    };
  }, [templates, animateScroll, controls1, controls2]);

  const TemplateCard = ({ template }: { template: Template }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg overflow-hidden mx-2 group cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={template.imageUrl || '/placeholder-template.png'}
          alt={template.title || '模板预览'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-template.png';
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3">
            {template.type === 'video' ? (
              <Play className="w-6 h-6 text-purple-600" />
            ) : (
              <ImageIcon className="w-6 h-6 text-purple-600" />
            )}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            template.type === 'video' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {template.type === 'video' ? '视频' : '图片'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {template.title || '未命名模板'}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {template.description || '暂无描述'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            {template.categoryId || '其他'}
          </span>
          <Link
            to={`/generate?template=${template.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            使用模板
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // 创建足够多的模板以实现无缝循环，确保内容足够长以覆盖屏幕并提供平滑过渡
  const repeatedTemplates = Array(5).fill(templates).flat(); // 重复5次，确保内容足够长

  return (
    <div className="space-y-6">
      {/* 第一行 - 向左滚动 */}
      <div className="overflow-hidden">
        <motion.div 
          ref={scrollRef1}
          className="flex w-max"
          animate={controls1}
        >
          {repeatedTemplates.map((template, index) => (
            <TemplateCard key={`row1-${template.id}-${index}`} template={template} />
          ))}
        </motion.div>
      </div>
      
      {/* 第二行 - 向右滚动 */}
      <div className="overflow-hidden">
        <motion.div 
          ref={scrollRef2}
          className="flex w-max"
          animate={controls2}
        >
          {repeatedTemplates.map((template, index) => (
            <TemplateCard key={`row2-${template.id}-${index}`} template={template} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}