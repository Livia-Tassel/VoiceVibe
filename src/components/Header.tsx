import { Settings, Mic } from 'lucide-react'

interface HeaderProps {
  status: 'idle' | 'listening' | 'transcribing' | 'processing' | 'ready'
  onSettingsClick: () => void
}

export function Header({ status, onSettingsClick }: HeaderProps) {
  const statusConfig = {
    idle: { color: 'bg-gray-500', text: '就绪', glow: '' },
    listening: { color: 'bg-red-500', text: '录音中...', glow: 'shadow-red-500/50 shadow-lg' },
    transcribing: { color: 'bg-blue-500', text: '转录中...', glow: 'shadow-blue-500/50 shadow-lg' },
    processing: { color: 'bg-amber-500', text: '优化中...', glow: 'shadow-amber-500/50 shadow-lg' },
    ready: { color: 'bg-emerald-500', text: '完成', glow: 'shadow-emerald-500/50 shadow-lg' },
  }

  const { color, text, glow } = statusConfig[status]
  const isActive = status !== 'idle'

  return (
    <header
      className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-vibe-gray/90 to-vibe-gray/70 border-b border-vibe-border backdrop-blur-sm"
      style={{ WebkitAppRegion: 'drag', paddingLeft: '80px' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Mic size={18} className="text-white" />
          </div>
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight">VoiceVibe</span>
          <span className="text-[10px] text-gray-500 -mt-0.5">语音转 Prompt</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-dark/50 transition-all duration-300 ${isActive ? glow : ''}`}>
        <span className={`w-2 h-2 rounded-full ${color} ${isActive ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-medium text-gray-300">{text}</span>
      </div>

      {/* Settings */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-vibe-light/80 transition-all duration-200 text-gray-400 hover:text-white hover:scale-105"
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
