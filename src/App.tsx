import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { SpeechInput } from './components/SpeechInput'
import { PromptOutput } from './components/PromptOutput'
import { SettingsModal, getSettings } from './components/SettingsModal'
import { Toast } from './components/Toast'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { refinePrompt } from './services/ai'

type AppStatus = 'idle' | 'listening' | 'processing' | 'ready'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [status, setStatus] = useState<AppStatus>('idle')
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition()

  // Update status based on state
  useEffect(() => {
    if (isRefining) {
      setStatus('processing')
    } else if (isListening) {
      setStatus('listening')
    } else if (refinedPrompt) {
      setStatus('ready')
    } else {
      setStatus('idle')
    }
  }, [isListening, isRefining, refinedPrompt])

  // Sync speech error to app error
  useEffect(() => {
    if (speechError) {
      setError(speechError)
    }
  }, [speechError])

  // Handle spacebar to toggle listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in textarea
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (isListening) {
          stopListening()
        } else {
          handleStartListening()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening])

  const handleStartListening = () => {
    setError(null)
    startListening()
  }

  const handleStopListening = async () => {
    stopListening()

    // 自动优化（如果有文本）
    if (transcript.trim()) {
      await handleRefineWithText(transcript)
    }
  }

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
    resetTranscript()
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
            interimTranscript={interimTranscript}
            isListening={isListening}
            isSupported={isSupported}
            onTranscriptChange={setTranscript}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onClear={handleClearInput}
          />
        </div>

        {/* Right Panel - Output */}
        <div className="bg-vibe-gray/30 overflow-hidden">
          <PromptOutput
            content={refinedPrompt}
            isLoading={isRefining}
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
