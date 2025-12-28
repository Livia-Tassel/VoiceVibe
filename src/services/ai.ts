const SYSTEM_PROMPT = `You are an expert Prompt Engineer. Convert the user's raw, spoken stream of consciousness into a structured Vibe Coding prompt using this format:

**Role:** [Define who the AI should act as]

**Context:** [Provide relevant background information]

**Task:** [Clear description of what needs to be done]

**Constraints:** [Any limitations or requirements]

Keep it concise and technical. Preserve the user's intent while improving clarity and structure.`

export interface RefineResponse {
  success: boolean
  content?: string
  error?: string
}

export async function refinePrompt(
  rawText: string,
  apiKey: string,
  proxyUrl?: string,
  apiBaseUrl?: string,
  model?: string
): Promise<RefineResponse> {
  if (!apiKey) {
    return {
      success: false,
      error: 'API Key 未配置。请在设置中填入 OpenAI API Key。',
    }
  }

  if (!rawText.trim()) {
    return {
      success: false,
      error: '没有可优化的文本。',
    }
  }

  try {
    console.log('发送优化请求')
    console.log('API Base URL:', apiBaseUrl || 'https://api.openai.com')
    console.log('Model:', model || 'gpt-4o-mini')

    const result = await window.electronAPI.openai.chat({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawText },
      ],
      apiKey,
      proxyUrl,
      apiBaseUrl,
      model,
    })

    console.log('优化 API 返回:', result)

    if (!result.ok) {
      const errorMessage = result.data?.error?.message || result.error || `API 错误: ${result.status}`
      return {
        success: false,
        error: errorMessage,
      }
    }

    const content = result.data?.choices?.[0]?.message?.content

    if (!content) {
      return {
        success: false,
        error: 'API 没有返回内容',
      }
    }

    return {
      success: true,
      content,
    }
  } catch (error) {
    console.error('优化错误:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '优化失败',
    }
  }
}
