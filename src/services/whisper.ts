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
    // 将 Blob 转换为 ArrayBuffer 再转为数字数组
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioData = Array.from(new Uint8Array(arrayBuffer))

    console.log('发送本地转录请求，音频大小:', audioData.length, 'bytes')

    // 通过 IPC 调用主进程的本地 Whisper
    const result = await window.electronAPI.whisper.transcribe({
      audioData,
      language,
    })

    console.log('本地转录返回:', result)

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
