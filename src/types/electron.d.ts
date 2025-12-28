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
  openai: {
    transcribe: (args: { audioData: number[], apiKey: string, language: string, proxyUrl?: string, apiBaseUrl?: string, model?: string }) => Promise<{ ok: boolean, status?: number, data?: any, error?: string }>
    chat: (args: { messages: Array<{ role: string, content: string }>, apiKey: string, proxyUrl?: string, apiBaseUrl?: string, model?: string }) => Promise<{ ok: boolean, status?: number, data?: any, error?: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
