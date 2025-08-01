import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X } from 'lucide-react';
import { useTemplateStore } from '@/store/useTemplateStore';
import { toast } from 'sonner';

interface TemplateSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
  onTemplateSelect: (template: any) => void;
}

export default function TemplateSelector({ isOpen, onToggle, onTemplateSelect }: TemplateSelectorProps) {
  const { templates } = useTemplateStore();

  const handleTemplateSelect = (template: any) => {
    onTemplateSelect(template);
    toast.success(`已应用模板：${template.title}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4"
      >
        AI创作工坊
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto"
      >
        将您的想象力转化为令人惊艳的视觉作品，体验前所未有的创作乐趣
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
      >
        <Wand2 className="w-5 h-5" />
        <span>{isOpen ? '隐藏模板' : '选择模板'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Wand2 className="w-6 h-6 mr-3 text-purple-600" />
                选择模板
              </h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {templates.slice(0, 12).map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="cursor-pointer bg-white rounded-2xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200 group"
                >
                  <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group-hover:shadow-md transition-shadow">
                    <img
                      src={template.imageUrl || template.preview}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(template.title + ' ' + template.category)}&image_size=square`;
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">{template.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{template.category}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-3 py-1 rounded-full font-medium ${template.type === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {template.type === 'image' ? '图片' : '视频'}
                    </span>
                    <span className="text-gray-400">{template.views || 0} 次</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}