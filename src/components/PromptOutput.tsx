import { Copy, Sparkles, Loader2, Trash2, Check } from 'lucide-react'
import { useState } from 'react'

interface PromptOutputProps {
  content: string
  isLoading: boolean
  error: string | null
  onContentChange: (text: string) => void
  onCopy: () => Promise<boolean>
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
  const [copied, setCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleCopy = async () => {
    if (isCopying || !content) {
      return
    }

    setIsCopying(true)
    try {
      const didCopy = await onCopy()
      if (didCopy) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setCopied(false)
      }
    } catch {
      setCopied(false)
    } finally {
      setIsCopying(false)
    }
  }

  const charCount = content.length
  const showEmptyState = !content && !isLoading && !error && !isFocused

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-vibe-600/40 bg-gradient-to-r from-vibe-800/30 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-teal to-teal-light" />
          <h3 className="text-subtitle text-vibe-200">优化后的 Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="kbd">?</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-radius-lg hover:bg-vibe-600 transition-colors text-vibe-300 hover:text-white hover:-translate-y-0.5"
            title="清空"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleCopy}
            disabled={!content || isCopying}
            className={`p-1.5 rounded-radius-lg transition-all ${
              content && !isCopying
                ? copied
                  ? 'bg-success/20 text-success'
                  : 'hover:bg-vibe-600 text-vibe-300 hover:text-white'
                : 'text-vibe-500 cursor-not-allowed'
            }`}
            title={isCopying ? 'Copying…' : '复制到剪贴板'}
          >
            {isCopying ? <Loader2 size={14} className="animate-spin" /> : copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-vibe-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-teal rounded-full blur-xl opacity-30 animate-pulse" />
              <Loader2 size={40} className="relative animate-spin text-accent" />
            </div>
            <span className="text-body mt-4 text-vibe-300 font-body">AI 正在优化您的 Prompt...</span>
            <div className="mt-2 w-48 h-1 rounded-full bg-vibe-600 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-teal shimmer" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="p-4 rounded-radius-lg bg-red-500/10 border border-red-500/20 shadow-soft">
              <div className="text-red-400 text-body text-center">{error}</div>
            </div>
          </div>
        ) : (
          <>
            {/* Empty state overlay */}
            {showEmptyState && (
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal/30 flex items-center justify-center animate-breathe">
                    <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                      <Sparkles size={24} className="text-teal/60" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-teal/30 animate-float" />
                  <div className="absolute -bottom-2 -right-1 w-1.5 h-1.5 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 -left-3 w-1 h-1 rounded-full bg-teal/20 animate-float" style={{ animationDelay: '0.5s' }} />
                </div>
                <p className="text-sm text-vibe-400 font-body mb-1">优化后的 Prompt 将显示在这里</p>
                <p className="text-xs text-vibe-500 font-body">录音或输入文字后自动生成</p>
              </div>
            )}

            {/* Always-mounted textarea */}
            <textarea
              id="output-textarea"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={showEmptyState ? '' : '优化后的结构化 Prompt 将显示在这里...'}
              className="w-full h-full p-4 bg-transparent text-white placeholder-vibe-400 resize-none focus:outline-none text-body relative z-20"
            />
          </>
        )}
      </div>

      {/* Word count footer */}
      {content && (
        <div className="flex items-center justify-end px-4 py-1 text-xs text-vibe-500 font-mono border-t border-vibe-600/20">
          {charCount} 字
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 p-4 border-t border-vibe-600/40 bg-gradient-to-t from-vibe-800/50 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onRefine}
            disabled={!hasInput || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-subtitle transition-all duration-300 active:scale-[0.98] ${
              hasInput && !isLoading
                ? 'bg-gradient-to-r from-accent to-teal hover:from-accent-light hover:to-teal-light text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02]'
                : 'bg-vibe-600 text-vibe-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>优化中...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>优化 Prompt</span>
              </>
            )}
          </button>
          <button
            onClick={handleCopy}
            disabled={!content || isLoading || isCopying}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-subtitle transition-all duration-300 active:scale-[0.98] ${
              content && !isLoading && !isCopying
                ? copied
                  ? 'bg-success/20 border border-success/30 text-success'
                  : 'bg-vibe-600 hover:bg-vibe-500 text-vibe-200 hover:text-white'
                : 'bg-vibe-700/50 text-vibe-500 cursor-not-allowed'
            }`}
          >
            {isCopying ? <Loader2 size={18} className="animate-spin" /> : copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{isCopying ? 'Copying…' : copied ? 'Copied!' : '复制'}</span>
          </button>
        </div>
        <span className="text-xs text-vibe-300 flex items-center gap-1.5">
          按 <span className="kbd">⌥⌘T</span> 快速优化
        </span>
      </div>
    </div>
  )
}
