export interface ElectronAPI {
  window: {
    hide: () => Promise<void>
    show: () => Promise<void>
    toggle: () => Promise<void>
    minimize: () => Promise<void>
    close: () => Promise<void>
  }
  clipboard: {
    write: (text: string) => Promise<boolean>
    read: () => Promise<string>
  }
  whisper: {
    transcribe: (args: { audioData: number[], language: string }) => Promise<{ ok: boolean, text?: string, error?: string }>
  }
  openai: {
    chat: (args: { messages: Array<{ role: string, content: string }>, apiKey: string, proxyUrl?: string, apiBaseUrl?: string, model?: string }) => Promise<{ ok: boolean, status?: number, data?: any, error?: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
