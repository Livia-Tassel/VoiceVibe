import { useState, useRef, useCallback } from 'react'

export interface UseAudioRecorderReturn {
  isRecording: boolean
  audioBlob: Blob | null
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  resetRecording: () => void
}

// 讯飞要求的采样率
const TARGET_SAMPLE_RATE = 16000

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const samplesRef = useRef<Float32Array[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)
      samplesRef.current = []

      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: TARGET_SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      streamRef.current = stream

      // 创建 AudioContext
      const audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
      audioContextRef.current = audioContext

      // 如果实际采样率不是 16kHz，需要重采样
      console.log('AudioContext sample rate:', audioContext.sampleRate)

      // 创建音频源
      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source

      // 使用 ScriptProcessorNode 捕获原始 PCM 数据
      const bufferSize = 4096
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        // 复制数据
        const samples = new Float32Array(inputData.length)
        samples.set(inputData)
        samplesRef.current.push(samples)
      }

      // 连接节点
      source.connect(processor)
      processor.connect(audioContext.destination)

      setIsRecording(true)
      console.log('Recording started with PCM format')

    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('无法启动录音。请确保麦克风权限已授予。')
    }
  }, [])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!isRecording) {
        resolve(null)
        return
      }

      // 断开连接
      if (processorRef.current && sourceRef.current) {
        sourceRef.current.disconnect()
        processorRef.current.disconnect()
      }

      // 停止麦克风
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // 关闭 AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      // 合并所有采样数据
      const totalLength = samplesRef.current.reduce((acc, arr) => acc + arr.length, 0)
      let mergedSamples = new Float32Array(totalLength)
      let offset = 0
      for (const samples of samplesRef.current) {
        mergedSamples.set(samples, offset)
        offset += samples.length
      }

      console.log('Recording stopped, total samples:', totalLength)

      // 如果采样率不是 16kHz，需要重采样
      const actualSampleRate = audioContextRef.current?.sampleRate || 48000
      if (actualSampleRate !== TARGET_SAMPLE_RATE) {
        console.log(`Resampling from ${actualSampleRate}Hz to ${TARGET_SAMPLE_RATE}Hz`)
        const ratio = actualSampleRate / TARGET_SAMPLE_RATE
        const newLength = Math.round(mergedSamples.length / ratio)
        const resampled = new Float32Array(newLength)

        for (let i = 0; i < newLength; i++) {
          const srcIndex = i * ratio
          const srcIndexFloor = Math.floor(srcIndex)
          const srcIndexCeil = Math.min(srcIndexFloor + 1, mergedSamples.length - 1)
          const t = srcIndex - srcIndexFloor
          // 线性插值
          resampled[i] = mergedSamples[srcIndexFloor] * (1 - t) + mergedSamples[srcIndexCeil] * t
        }

        mergedSamples = resampled
        console.log('Resampled to', newLength, 'samples')
      }

      // 将 Float32 转换为 16-bit PCM
      const pcmData = new Int16Array(mergedSamples.length)
      for (let i = 0; i < mergedSamples.length; i++) {
        // 将 -1.0 到 1.0 的浮点数转换为 -32768 到 32767 的整数
        const s = Math.max(-1, Math.min(1, mergedSamples[i]))
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // 创建 Blob
      const blob = new Blob([pcmData.buffer], { type: 'audio/pcm' })
      setAudioBlob(blob)
      setIsRecording(false)

      console.log('PCM audio blob created, size:', blob.size, 'bytes')

      resolve(blob)
    })
  }, [isRecording])

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setError(null)
    samplesRef.current = []
  }, [])

  return {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
