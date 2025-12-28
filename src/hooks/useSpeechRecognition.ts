import { useState, useEffect, useCallback, useRef } from 'react'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  setTranscript: (text: string) => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldRestartRef = useRef(false)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN' // 改为中文，如需英文可改为 'en-US'

    recognition.onstart = () => {
      console.log('Speech recognition started')
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)

      if (event.error === 'no-speech') {
        // 没有检测到语音，继续监听
        return
      }

      if (event.error === 'aborted') {
        // 被中止，可能是用户手动停止
        return
      }

      if (event.error === 'not-allowed') {
        setError('麦克风权限被拒绝。请在系统设置中允许麦克风访问。')
      } else if (event.error === 'network') {
        setError('网络错误。语音识别需要网络连接。')
      } else {
        setError(`语音识别错误: ${event.error}`)
      }

      setIsListening(false)
      shouldRestartRef.current = false
    }

    recognition.onend = () => {
      console.log('Speech recognition ended, shouldRestart:', shouldRestartRef.current)

      // 如果应该继续监听，自动重启
      if (shouldRestartRef.current) {
        try {
          recognition.start()
          return
        } catch (e) {
          console.error('Failed to restart recognition:', e)
        }
      }

      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      shouldRestartRef.current = false
      recognition.abort()
    }
  }, [isSupported])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return

    // 先请求麦克风权限
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.error('Microphone permission denied:', err)
      setError('麦克风权限被拒绝。请允许麦克风访问。')
      return
    }

    setError(null)
    shouldRestartRef.current = true

    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      // 如果已经在运行，先停止再重启
      try {
        recognitionRef.current.stop()
        setTimeout(() => {
          recognitionRef.current?.start()
        }, 100)
      } catch (e) {
        console.error('Failed to restart:', e)
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  }
}
