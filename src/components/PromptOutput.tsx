import { Copy, Sparkles, Loader2, Trash2 } from 'lucide-react'

interface PromptOutputProps {
  content: string
  isLoading: boolean
  error: string | null
  onContentChange: (text: string) => void
  onCopy: () => void
  onRefine: () => void
  onClear: () => void
  hasInput: boolean
}

export function PromptOutput({
  content,
  isLoading,
  error,
  onContentChange,
  onCopy,
  onRefine,
  onClear,
  hasInput,
}: PromptOutputProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-vibe-border">
        <h3 className="text-sm font-medium text-gray-400">优化后的 Prompt</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-vibe-light transition-colors text-gray-500 hover:text-white"
            title="清空"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onCopy}
            disabled={!content}
            className={`p-1.5 rounded-lg hover:bg-vibe-light transition-colors ${
              content ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="复制到剪贴板"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">正在处理中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="text-red-400 text-sm text-center">{error}</div>
          </div>
        ) : (
          <textarea
            id="output-textarea"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="优化后的结构化 Prompt 将显示在这里..."
            className="w-full h-full p-4 bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-3 p-4 border-t border-vibe-border">
        <button
          onClick={onRefine}
          disabled={!hasInput || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            hasInput && !isLoading
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
              : 'bg-vibe-light text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>处理中...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>优化 Prompt</span>
            </>
          )}
        </button>
        <button
          onClick={onCopy}
          disabled={!content || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            content && !isLoading
              ? 'bg-vibe-light hover:bg-vibe-border text-white'
              : 'bg-vibe-light/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Copy size={20} />
          <span>复制</span>
        </button>
      </div>
    </div>
  )
}
