export interface TranscribeResponse {
  success: boolean
  text?: string
  error?: string
}

export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string,
  proxyUrl?: string,
  apiBaseUrl?: string,
  model?: string
): Promise<TranscribeResponse> {
  if (!apiKey) {
    return {
      success: false,
      error: 'API Key 未配置。请在设置中填入 OpenAI API Key。',
    }
  }

  try {
    // 将 Blob 转换为 ArrayBuffer 再转为数字数组
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioData = Array.from(new Uint8Array(arrayBuffer))

    console.log('发送转录请求，音频大小:', audioData.length, 'bytes')
    console.log('API Base URL:', apiBaseUrl || 'https://api.openai.com')
    console.log('Whisper Model:', model || 'whisper-1')

    // 通过 IPC 调用主进程的 API
    const result = await window.electronAPI.openai.transcribe({
      audioData,
      apiKey,
      language: 'zh', // 中文，如需英文改为 'en'
      proxyUrl,
      apiBaseUrl,
      model,
    })

    console.log('转录 API 返回:', result)

    if (!result.ok) {
      const errorMessage = result.data?.error?.message || result.error || `API 错误: ${result.status}`
      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      text: result.data?.text,
    }
  } catch (error) {
    console.error('转录错误:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '转录失败',
    }
  }
}
