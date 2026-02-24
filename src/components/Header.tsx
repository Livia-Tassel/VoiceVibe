import { Settings, Mic, Clock } from 'lucide-react'

interface HeaderProps {
  status: 'idle' | 'listening' | 'transcribing' | 'processing' | 'ready'
  onSettingsClick: () => void
  onHistoryClick: () => void
}

export function Header({ status, onSettingsClick, onHistoryClick }: HeaderProps) {
  const statusConfig = {
    idle: { color: 'bg-vibe-400', text: '就绪', glow: '' },
    listening: { color: 'bg-recording', text: '录音中...', glow: 'shadow-recording/50 shadow-lg' },
    transcribing: { color: 'bg-info', text: '转录中...', glow: 'shadow-info/50 shadow-lg' },
    processing: { color: 'bg-accent', text: '优化中...', glow: 'shadow-accent/50 shadow-lg' },
    ready: { color: 'bg-success', text: '完成', glow: 'shadow-success/50 shadow-lg' },
  }

  const { color, text, glow } = statusConfig[status]
  const isActive = status !== 'idle'

  return (
    <header
      className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-vibe-800/90 to-vibe-700/70 border-b border-vibe-600/60 backdrop-blur-sm"
      style={{ WebkitAppRegion: 'drag', paddingLeft: '80px' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-accent to-accent-light rounded-radius-lg shadow-soft shadow-accent/30">
            <Mic size={18} className="text-white" />
          </div>
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-recording rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-title font-display gradient-text">VoiceVibe</span>
          <span className="text-subtitle text-vibe-300 -mt-0.5">语音转 Prompt</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-900/60 transition-all duration-500 ${isActive ? glow : ''}`}>
        <span className={`w-2 h-2 rounded-full ${color} ${isActive ? 'animate-pulse' : ''} transition-all duration-500`} />
        <span className="text-body text-vibe-200">{text}</span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={onHistoryClick}
          className="p-2 rounded-radius-lg hover:bg-vibe-600/80 transition-all duration-200 text-vibe-300 hover:text-white hover:-translate-y-0.5"
          title="历史记录"
        >
          <Clock size={18} />
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-radius-lg hover:bg-vibe-600/80 transition-all duration-200 text-vibe-300 hover:text-white hover:rotate-12"
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
