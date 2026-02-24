import { Mic, MicOff, Trash2 } from 'lucide-react'

interface SpeechInputProps {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  onTranscriptChange: (text: string) => void
  onStartListening: () => void
  onStopListening: () => void
  onClear: () => void
}

function SoundWave() {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="sound-wave-bar w-1 bg-white rounded-full"
          style={{ height: '100%' }}
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full select-none pointer-events-none">
      {/* CSS-only mic illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-accent/30 flex items-center justify-center animate-breathe">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Mic size={24} className="text-accent/60" />
          </div>
        </div>
        {/* Floating dots */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent/30 animate-float" />
        <div className="absolute -bottom-2 -left-1 w-1.5 h-1.5 rounded-full bg-teal/30 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 -right-3 w-1 h-1 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      <p className="text-sm text-vibe-400 font-body mb-1">按下麦克风或空格键开始录音</p>
      <p className="text-xs text-vibe-500 font-body">也可以直接在此输入文字</p>
    </div>
  )
}

export function SpeechInput({
  transcript,
  interimTranscript,
  isListening,
  isSupported,
  onTranscriptChange,
  onStartListening,
  onStopListening,
  onClear,
}: SpeechInputProps) {

  const handleMicClick = () => {
    if (isListening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }

  const charCount = transcript.length

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-vibe-600/40 bg-gradient-to-r from-transparent to-vibe-800/30">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-accent-light" />
          <h3 className="text-subtitle text-vibe-200">语音输入</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="kbd">/</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-radius-lg hover:bg-vibe-600 transition-colors text-vibe-300 hover:text-white hover:-translate-y-0.5"
            title="清空"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        {!transcript && !isListening ? (
          <EmptyState />
        ) : (
          <textarea
            id="input-textarea"
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="点击麦克风按钮或按空格键开始/停止录音，或直接输入文字..."
            className="w-full h-full p-4 bg-transparent text-white placeholder-vibe-400 resize-none focus:outline-none text-body"
          />
        )}
        {/* Make textarea accessible even with empty state */}
        {!transcript && !isListening && (
          <textarea
            id="input-textarea"
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-white resize-none focus:outline-none text-body opacity-0 focus:opacity-100"
            placeholder="开始输入..."
          />
        )}
        {interimTranscript && (
          <div className="absolute bottom-24 left-4 right-4 text-info text-body font-medium bg-vibe-900/90 backdrop-blur-sm px-4 py-2.5 rounded-radius-lg border border-info/30 shadow-soft shadow-info/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-info rounded-full animate-pulse" />
              {interimTranscript}
            </div>
          </div>
        )}
      </div>

      {/* Word count footer */}
      {transcript && (
        <div className="flex items-center justify-end px-4 py-1 text-xs text-vibe-500 font-mono border-t border-vibe-600/20">
          {charCount} 字
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 p-4 border-t border-vibe-600/40 bg-gradient-to-t from-vibe-800/30 to-transparent">
        <button
          onClick={handleMicClick}
          disabled={!isSupported}
          className={`relative flex items-center gap-3 px-8 py-3.5 rounded-full text-subtitle transition-all duration-300 active:scale-[0.98] ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/40 scale-105 recording-pulse'
              : 'bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02]'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isSupported ? (isListening ? '停止录音' : '开始录音') : '不支持语音识别'}
        >
          {isListening ? (
            <>
              <SoundWave />
              <span>停止录音</span>
              <MicOff size={18} />
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>开始录音</span>
            </>
          )}
        </button>
        <span className="text-xs text-vibe-300 flex items-center gap-1.5">
          按 <span className="kbd">Space</span> 快速开始/停止
        </span>
      </div>
    </div>
  )
}
