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
      <div className="flex items-center justify-between px-4 py-2 border-b border-vibe-border">
        <h3 className="text-sm font-medium text-gray-400">语音输入</h3>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-vibe-light transition-colors text-gray-500 hover:text-white"
          title="清空"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex-1 relative">
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="点击麦克风按钮或按空格键开始录音..."
          className="w-full h-full p-4 bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
        />
        {interimTranscript && (
          <div className="absolute bottom-20 left-4 right-4 text-blue-400 text-sm font-medium bg-vibe-dark/80 px-3 py-2 rounded-lg">
            {interimTranscript}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center p-4 border-t border-vibe-border">
        <button
          onClick={handleMicClick}
          disabled={!isSupported}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-vibe-accent hover:bg-vibe-accent/80 text-white shadow-lg shadow-vibe-accent/30'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isSupported ? (isListening ? '停止录音' : '开始录音') : '不支持语音识别'}
        >
          {isListening ? (
            <>
              <MicOff size={20} />
              <span>停止录音</span>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>开始录音</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
