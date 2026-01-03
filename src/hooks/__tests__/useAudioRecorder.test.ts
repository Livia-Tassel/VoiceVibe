import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioRecorder } from '../useAudioRecorder'

type MockTrack = { stop: ReturnType<typeof vi.fn> }

describe('useAudioRecorder', () => {
  let getUserMediaMock: ReturnType<typeof vi.fn>
  let mockTrack: MockTrack

  beforeEach(() => {
    mockTrack = { stop: vi.fn() }
    getUserMediaMock = vi.fn().mockResolvedValue({
      getTracks: () => [mockTrack],
    })

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: getUserMediaMock },
      configurable: true,
    })

    class MockAudioContext {
      sampleRate = 16000
      destination = {}

      createMediaStreamSource() {
        return {
          connect: vi.fn(),
          disconnect: vi.fn(),
        }
      }

      createScriptProcessor() {
        return {
          connect: vi.fn(),
          disconnect: vi.fn(),
          onaudioprocess: null as ((event: any) => void) | null,
        }
      }

      close() {
        return Promise.resolve()
      }
    }

    ;(globalThis as any).AudioContext = MockAudioContext
  })

  it('toggles recording state and creates a blob', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(true)
    expect(result.current.error).toBeNull()

    let blob: Blob | null = null

    await act(async () => {
      blob = await result.current.stopRecording()
    })

    expect(blob).toBeInstanceOf(Blob)
    expect(result.current.isRecording).toBe(false)
    expect(result.current.audioBlob).toBeInstanceOf(Blob)
    expect(mockTrack.stop).toHaveBeenCalled()
  })

  it('sets an error when getUserMedia fails', async () => {
    getUserMediaMock.mockRejectedValueOnce(new Error('denied'))

    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.error).toBe('无法启动录音。请确保麦克风权限已授予。')
  })
})
