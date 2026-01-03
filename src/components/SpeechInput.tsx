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

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-vibe-600 bg-gradient-to-r from-transparent to-vibe-800/30">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
          <h3 className="text-subtitle text-vibe-200">语音输入</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="kbd">/</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-radius-lg hover:bg-vibe-600 transition-colors text-vibe-300 hover:text-white"
            title="清空"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          id="input-textarea"
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="点击麦克风按钮或按空格键开始/停止录音，或直接输入文字..."
          className="w-full h-full p-4 bg-transparent text-white placeholder-vibe-400 resize-none focus:outline-none text-body"
        />
        {interimTranscript && (
          <div className="absolute bottom-24 left-4 right-4 text-blue-400 text-body font-medium bg-vibe-900/90 backdrop-blur-sm px-4 py-2.5 rounded-radius-lg border border-blue-500/30 shadow-soft shadow-blue-500/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {interimTranscript}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 p-4 border-t border-vibe-600 bg-gradient-to-t from-vibe-800/30 to-transparent">
        <button
          onClick={handleMicClick}
          disabled={!isSupported}
          className={`relative flex items-center gap-3 px-8 py-3.5 rounded-full text-subtitle transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/40 scale-105 recording-pulse'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]'
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
