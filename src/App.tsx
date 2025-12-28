import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { SpeechInput } from './components/SpeechInput'
import { PromptOutput } from './components/PromptOutput'
import { SettingsModal, getSettings } from './components/SettingsModal'
import { Toast } from './components/Toast'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { transcribeAudio } from './services/whisper'
import { refinePrompt } from './services/ai'

type AppStatus = 'idle' | 'listening' | 'transcribing' | 'processing' | 'ready'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [status, setStatus] = useState<AppStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const {
    isRecording,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  // Update status based on state
  useEffect(() => {
    if (isRefining) {
      setStatus('processing')
    } else if (isTranscribing) {
      setStatus('transcribing')
    } else if (isRecording) {
      setStatus('listening')
    } else if (refinedPrompt) {
      setStatus('ready')
    } else {
      setStatus('idle')
    }
  }, [isRecording, isTranscribing, isRefining, refinedPrompt])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: blur current input to restore shortcuts
      if (e.code === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        return
      }

      // Option+Command+T: 优化
      if (e.altKey && e.metaKey && e.code === 'KeyT') {
        e.preventDefault()
        if (!isRefining && transcript.trim()) {
          handleRefine()
        }
        return
      }

      // Ignore other shortcuts if typing in textarea/input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }

      // Spacebar: toggle recording
      if (e.code === 'Space') {
        e.preventDefault()
        if (isRecording) {
          handleStopRecording()
        } else {
          handleStartRecording()
        }
        return
      }

      // /: focus input textarea
      if (e.code === 'Slash' && !e.shiftKey) {
        e.preventDefault()
        document.getElementById('input-textarea')?.focus()
        return
      }

      // Shift+/ (?): focus output textarea
      if (e.code === 'Slash' && e.shiftKey) {
        e.preventDefault()
        document.getElementById('output-textarea')?.focus()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording, isRefining, transcript])

  const handleStartRecording = useCallback(async () => {
    setError(null)
    await startRecording()
  }, [startRecording])

  const handleStopRecording = useCallback(async () => {
    const audioBlob = await stopRecording()

    if (!audioBlob) {
      console.log('没有录到音频')
      return
    }

    console.log('录音完成，大小:', audioBlob.size, 'bytes')

    // 本地转录音频
    setIsTranscribing(true)
    console.log('开始本地转录...')
    const transcribeResult = await transcribeAudio(audioBlob, 'zh')
    setIsTranscribing(false)
    console.log('转录结果:', transcribeResult)

    if (!transcribeResult.success || !transcribeResult.text) {
      setError(transcribeResult.error || '转录失败')
      return
    }

    const newTranscript = transcript + (transcript ? ' ' : '') + transcribeResult.text
    setTranscript(newTranscript)

    // 自动优化
    await handleRefineWithText(newTranscript)
  }, [stopRecording, transcript])

  const handleRefineWithText = async (text?: string) => {
    const settings = getSettings()
    const inputText = text || transcript

    if (!settings.apiKey) {
      setError('请在设置中填入 API Key')
      setIsSettingsOpen(true)
      return
    }

    if (!inputText.trim()) {
      setError('没有可优化的文本')
      return
    }

    setIsRefining(true)
    setError(null)

    const result = await refinePrompt(inputText, settings.apiKey, settings.proxyUrl, settings.apiBaseUrl, settings.chatModel)

    setIsRefining(false)

    if (result.success && result.content) {
      setRefinedPrompt(result.content)

      // Auto-copy if enabled
      if (settings.autoCopy) {
        await copyToClipboard(result.content)
      }
    } else {
      setError(result.error || '优化失败')
    }
  }

  const handleRefine = () => handleRefineWithText(transcript)

  const copyToClipboard = async (text?: string) => {
    const textToCopy = text || refinedPrompt
    if (!textToCopy) return

    try {
      if (window.electronAPI) {
        await window.electronAPI.clipboard.write(textToCopy)
      } else {
        await navigator.clipboard.writeText(textToCopy)
      }
      showToast('已复制到剪贴板!', 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
  }

  const handleClearInput = () => {
    setTranscript('')
    resetRecording()
    setError(null)
  }

  const handleClearOutput = () => {
    setRefinedPrompt('')
    setError(null)
  }

  return (
    <div className="h-screen flex flex-col bg-vibe-dark overflow-hidden rounded-xl">
      <Header status={status} onSettingsClick={() => setIsSettingsOpen(true)} />

      <main className="flex-1 grid grid-cols-2 divide-x divide-vibe-border overflow-hidden">
        {/* Left Panel - Input */}
        <div className="bg-vibe-dark overflow-hidden">
          <SpeechInput
            transcript={transcript}
            interimTranscript={isTranscribing ? '正在转录...' : (isRecording ? '正在录音...' : '')}
            isListening={isRecording}
            isSupported={true}
            onTranscriptChange={setTranscript}
            onStartListening={handleStartRecording}
            onStopListening={handleStopRecording}
            onClear={handleClearInput}
          />
        </div>

        {/* Right Panel - Output */}
        <div className="bg-vibe-gray/30 overflow-hidden">
          <PromptOutput
            content={refinedPrompt}
            isLoading={isRefining || isTranscribing}
            error={error}
            onContentChange={setRefinedPrompt}
            onCopy={() => copyToClipboard()}
            onRefine={handleRefine}
            onClear={handleClearOutput}
            hasInput={transcript.trim().length > 0}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  )
}

export default App
