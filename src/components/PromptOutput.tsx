import { Copy, Sparkles, Loader2, Trash2, Check } from 'lucide-react'
import { useState } from 'react'
import brandOrbit from '../../assets/brand-orbit.svg'

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
  const [copied, setCopied] = useState(false)

  const sampleOutput =
    '你是一位资深品牌策略专家。请将以下会议要点整理为一份结构化营销方案，包括目标受众、核心卖点、传播渠道与执行节奏，并提供 3 条可直接使用的广告语。'

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showEmptyState = !isLoading && !error && !content

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-vibe-600 bg-gradient-to-r from-vibe-800/30 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          <h3 className="text-subtitle text-vibe-200">优化后的 Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="kbd">?</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-radius-lg hover:bg-vibe-600 transition-colors text-vibe-300 hover:text-white"
            title="清空"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleCopy}
            disabled={!content || isLoading}
            className={`p-1.5 rounded-radius-lg transition-all ${
              content && !isLoading
                ? copied
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'hover:bg-vibe-600 text-vibe-300 hover:text-white'
                : 'text-vibe-500 cursor-not-allowed'
            }`}
            title="复制到剪贴板"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-vibe-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <Loader2 size={40} className="relative animate-spin text-indigo-400" />
            </div>
            <span className="text-body mt-4 text-vibe-300">AI 正在优化您的 Prompt...</span>
            <div className="mt-2 w-48 h-1 rounded-full bg-vibe-600 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shimmer" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="p-4 rounded-radius-lg bg-red-500/10 border border-red-500/20 shadow-soft">
              <div className="text-red-400 text-body text-center">{error}</div>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            <textarea
              id="output-textarea"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="优化后的结构化 Prompt 将显示在这里..."
              className="w-full h-full p-4 bg-transparent text-white placeholder-vibe-400 resize-none focus:outline-none text-body leading-relaxed"
            />

            {showEmptyState && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 blur-xl" />
                  <div className="relative flex items-center justify-center rounded-[28px] border border-vibe-border/60 bg-vibe-dark/70 p-6 shadow-2xl shadow-indigo-500/20">
                    <img src={brandOrbit} alt="品牌视觉" className="h-40 w-48" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-200">示例优化结果</div>
                  <p className="text-xs text-gray-500">
                    我们将把你的原始想法整理成结构化 Prompt，方便直接投入使用。
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onContentChange(sampleOutput)}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/20"
                >
                  插入示例优化结果
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 p-4 border-t border-vibe-600 bg-gradient-to-t from-vibe-800/50 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onRefine}
            disabled={!hasInput || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-subtitle transition-all duration-300 ${
              hasInput && !isLoading
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]'
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
            disabled={!content || isLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-subtitle transition-all duration-300 ${
              content && !isLoading
                ? copied
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-vibe-600 hover:bg-vibe-500 text-vibe-200 hover:text-white'
                : 'bg-vibe-700/50 text-vibe-500 cursor-not-allowed'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>

        <span className="text-xs text-vibe-300 flex items-center gap-1.5">
          按 <span className="kbd">⌥⌘T</span> 快速优化
        </span>
      </div>
    </div>
  )
}
