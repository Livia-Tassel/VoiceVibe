import { Settings, Activity } from 'lucide-react'

interface HeaderProps {
  status: 'idle' | 'listening' | 'transcribing' | 'processing' | 'ready'
  onSettingsClick: () => void
}

export function Header({ status, onSettingsClick }: HeaderProps) {
  const statusConfig = {
    idle: { color: 'bg-gray-500', text: '就绪' },
    listening: { color: 'bg-red-500 animate-pulse', text: '录音中...' },
    transcribing: { color: 'bg-blue-500 animate-pulse', text: '转录中...' },
    processing: { color: 'bg-yellow-500 animate-pulse', text: '优化中...' },
    ready: { color: 'bg-green-500', text: '完成' },
  }

  const { color, text } = statusConfig[status]

  return (
    <header
      className="flex items-center justify-between px-4 py-3 bg-vibe-gray/80 border-b border-vibe-border"
      style={{ WebkitAppRegion: 'drag', paddingLeft: '80px' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-vibe-accent rounded-lg">
          <Activity size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">VoiceVibe</span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-gray-400">{text}</span>
      </div>

      {/* Settings */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-vibe-light transition-colors text-gray-400 hover:text-white"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
