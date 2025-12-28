const SYSTEM_PROMPT = `你是 Vibe Coding 提示词专家。用户会用简短、模糊的语言描述一个软件想法，你需要将其转换成可以直接粘贴给 Claude Code、Cursor 等 AI 编程助手执行的结构化提示词。

用户输入的特点：
- 往往是模糊的、口语化的、不完整的想法
- 可能只是一个概念或关键词
- 缺少技术细节

你的任务：
- 理解用户的真实意图
- 补充合理的技术选型和实现细节
- 输出一个 AI 编程助手可以直接开始编码的提示词

输出格式（直接输出，不要任何解释）：

帮我创建一个[项目名称]。

技术栈：[根据项目特点推荐合适的技术]

功能需求：
1. [核心功能1]
2. [核心功能2]
3. [补充的合理功能]

技术要求：
- [具体实现要求]
- [代码质量要求]
- [用户体验要求]

请从[第一步具体操作]开始。

---
示例：
用户输入："记账app"
你的输出：
帮我创建一个个人记账应用。

技术栈：React Native + SQLite（本地存储）+ TypeScript

功能需求：
1. 记录收入和支出，支持分类（餐饮、交通、购物等）
2. 按日/周/月查看账单统计和图表
3. 支持搜索和筛选历史记录
4. 数据本地存储，支持导出

技术要求：
- 使用函数式组件和 Hooks
- 界面简洁美观，支持深色模式
- 添加记录时有流畅的动画反馈

请从创建项目结构和基础UI组件开始。
---

现在处理用户输入：`

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
