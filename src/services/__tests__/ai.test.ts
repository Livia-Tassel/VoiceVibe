import { describe, expect, it, beforeEach, vi } from 'vitest'
import { refinePrompt } from '../ai'

describe('refinePrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    ;(window as any).electronAPI = {
      openai: {
        chat: vi.fn(),
      },
    }
  })

  it('returns content when API succeeds', async () => {
    const chat = (window as any).electronAPI.openai.chat as ReturnType<typeof vi.fn>
    chat.mockResolvedValue({
      ok: true,
      data: {
        choices: [{ message: { content: 'refined' } }],
      },
    })

    const result = await refinePrompt('hello', 'api-key')

    expect(result).toEqual({ success: true, content: 'refined' })
    expect(chat).toHaveBeenCalledOnce()
  })

  it('returns error when API fails', async () => {
    const chat = (window as any).electronAPI.openai.chat as ReturnType<typeof vi.fn>
    chat.mockResolvedValue({
      ok: false,
      status: 500,
      error: 'boom',
    })

    const result = await refinePrompt('hello', 'api-key')

    expect(result).toEqual({ success: false, error: 'boom' })
  })

  it('returns error for empty input', async () => {
    const chat = (window as any).electronAPI.openai.chat as ReturnType<typeof vi.fn>

    const result = await refinePrompt('   ', 'api-key')

    expect(result).toEqual({ success: false, error: '没有可优化的文本。' })
    expect(chat).not.toHaveBeenCalled()
  })
})
