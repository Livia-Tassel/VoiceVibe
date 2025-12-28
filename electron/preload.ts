import { contextBridge, ipcRenderer } from 'electron'

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

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    hide: () => ipcRenderer.invoke('window:hide'),
    show: () => ipcRenderer.invoke('window:show'),
    toggle: () => ipcRenderer.invoke('window:toggle'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  clipboard: {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text),
    read: () => ipcRenderer.invoke('clipboard:read'),
  },
  openai: {
    transcribe: (args: { audioData: number[], apiKey: string, language: string, proxyUrl?: string, apiBaseUrl?: string }) =>
      ipcRenderer.invoke('openai:transcribe', args),
    chat: (args: { messages: Array<{ role: string, content: string }>, apiKey: string, proxyUrl?: string, apiBaseUrl?: string, model?: string }) =>
      ipcRenderer.invoke('openai:chat', args),
  },
})
