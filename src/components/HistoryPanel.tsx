import { useState, useEffect } from 'react'
import { X, Clock, Trash2 } from 'lucide-react'
import { HistoryEntry, getHistory, deleteHistoryEntry, clearHistory } from '../services/history'

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (entry: HistoryEntry) => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

export function HistoryPanel({ isOpen, onClose, onSelect }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [confirmClear, setConfirmClear] = useState(false)

  // Refresh entries every time the panel opens; reset confirmClear
  useEffect(() => {
    if (isOpen) {
      setEntries(getHistory())
      setConfirmClear(false)
    }
  }, [isOpen])

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id)
    setEntries(getHistory())
  }

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearHistory()
    setEntries([])
    setConfirmClear(false)
  }

  const handleSelect = (entry: HistoryEntry) => {
    onSelect(entry)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[360px] bg-vibe-800/95 backdrop-blur-xl border-l border-vibe-600/60 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-vibe-600/60">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent" />
            <h2 className="text-title text-white">历史记录</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-radius-lg hover:bg-vibe-600/80 transition-colors text-vibe-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        {entries.length > 0 && (
          <div className="flex justify-end px-5 py-2 border-b border-vibe-600/30">
            <button
              onClick={handleClearAll}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                confirmClear
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'text-vibe-400 hover:text-vibe-200 hover:bg-vibe-600/50'
              }`}
            >
              {confirmClear ? '确认清除全部？' : '清除全部'}
            </button>
          </div>
        )}

        {/* Entries */}
        <div className="flex-1 overflow-y-auto" style={{ height: entries.length > 0 ? 'calc(100% - 110px)' : 'calc(100% - 65px)' }}>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-vibe-400">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-vibe-600 flex items-center justify-center mb-4">
                <Clock size={24} className="text-vibe-500" />
              </div>
              <p className="text-sm font-body">还没有历史记录</p>
              <p className="text-xs text-vibe-500 mt-1">优化 Prompt 后将自动保存</p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent-muted border border-transparent hover:border-accent/20"
                  onClick={() => handleSelect(entry)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-vibe-400 font-body">{timeAgo(entry.timestamp)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-vibe-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-vibe-300 leading-relaxed mb-1 font-body">
                    {truncate(entry.rawTranscript, 60)}
                  </p>
                  <p className="text-xs text-vibe-200/70 leading-relaxed font-body">
                    {truncate(entry.refinedPrompt, 80)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
