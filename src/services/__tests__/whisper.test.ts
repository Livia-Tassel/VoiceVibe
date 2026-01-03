import { describe, expect, it, vi } from 'vitest'
import { transcribeAudio } from '../whisper'

vi.mock('../../components/SettingsModal', () => ({
  getSettings: () => ({
    speechAppId: '',
    speechApiKey: '',
    speechApiSecret: '',
  }),
}))

describe('transcribeAudio', () => {
  it('returns error when settings are missing', async () => {
    const result = await transcribeAudio(new Blob(['test']))

    expect(result).toEqual({
      success: false,
      error: '请先在设置中配置讯飞语音识别 API',
    })
  })
})
