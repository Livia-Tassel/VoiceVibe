import { getSettings } from '../components/SettingsModal'

export interface TranscribeResponse {
  success: boolean
  text?: string
  error?: string
}

export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'zh'
): Promise<TranscribeResponse> {
  try {
    const settings = getSettings()

    if (!settings.speechAppId || !settings.speechApiKey || !settings.speechApiSecret) {
      return {
        success: false,
        error: '请先在设置中配置讯飞语音识别 API',
      }
    }

    // 将 Blob 转换为数组以便通过 IPC 传输
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioData = Array.from(new Uint8Array(arrayBuffer))

    console.log('调用讯飞语音识别 API，音频大小:', audioData.length, 'bytes')

    // 通过 IPC 调用主进程的讯飞 API
    const result = await window.electronAPI.whisper.transcribe({
      audioData,
      language,
      appId: settings.speechAppId,
      apiKey: settings.speechApiKey,
      apiSecret: settings.speechApiSecret,
    })

    console.log('讯飞 API 返回:', result)

    if (!result.ok) {
      return {
        success: false,
        error: result.error || '转录失败',
      }
    }

    return {
      success: true,
      text: result.text,
    }
  } catch (error) {
    console.error('转录错误:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '转录失败',
    }
  }
}
