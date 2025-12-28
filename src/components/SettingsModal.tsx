import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface Settings {
  apiKey: string
  apiBaseUrl: string
  chatModel: string
  autoCopy: boolean
  globalShortcut: string
  proxyUrl: string
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiBaseUrl: 'https://api.openai.com',
  chatModel: 'gpt-4o-mini',
  autoCopy: true,
  globalShortcut: 'Option+Command+P',
  proxyUrl: '',
}

export function getSettings(): Settings {
  try {
    const stored = localStorage.getItem('voicevibe-settings')
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parsing errors
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem('voicevibe-settings', JSON.stringify(settings))
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(getSettings)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings())
    }
  }, [isOpen])

  const handleSave = () => {
    saveSettings(settings)
    onClose()
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, apiKey: e.target.value }))
  }

  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, apiBaseUrl: e.target.value }))
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, chatModel: e.target.value }))
  }

  const handleProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, proxyUrl: e.target.value }))
  }

  const handleAutoCopyChange = () => {
    setSettings(prev => ({ ...prev, autoCopy: !prev.autoCopy }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-vibe-gray border border-vibe-border rounded-xl shadow-2xl w-[420px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vibe-border">
          <h2 className="text-lg font-semibold text-white">设置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-vibe-light transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={handleKeyChange}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 pr-10 bg-vibe-dark border border-vibe-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibe-accent focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              用于 AI 优化提示词（语音识别使用 Google 免费服务）
            </p>
          </div>

          {/* API Base URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              API 地址
            </label>
            <input
              type="text"
              value={settings.apiBaseUrl}
              onChange={handleBaseUrlChange}
              placeholder="https://api.openai.com"
              className="w-full px-4 py-2.5 bg-vibe-dark border border-vibe-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibe-accent focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500">
              使用第三方 API 服务时修改此地址
            </p>
          </div>

          {/* Chat Model */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              聊天模型
            </label>
            <input
              type="text"
              value={settings.chatModel}
              onChange={handleModelChange}
              placeholder="gpt-4o-mini"
              className="w-full px-4 py-2.5 bg-vibe-dark border border-vibe-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibe-accent focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500">
              如 gpt-4o-mini、gpt-4o、gpt-3.5-turbo、claude-3-haiku 等
            </p>
          </div>

          {/* Proxy */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              代理地址（可选）
            </label>
            <input
              type="text"
              value={settings.proxyUrl}
              onChange={handleProxyChange}
              placeholder="http://127.0.0.1:7890"
              className="w-full px-4 py-2.5 bg-vibe-dark border border-vibe-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vibe-accent focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500">
              如果无法连接 API，请填写代理地址
            </p>
          </div>

          {/* Auto Copy */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                自动复制到剪贴板
              </label>
              <p className="text-xs text-gray-500">
                优化完成后自动复制 Prompt
              </p>
            </div>
            <button
              onClick={handleAutoCopyChange}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoCopy ? 'bg-vibe-accent' : 'bg-vibe-light'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoCopy ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Global Shortcut */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              全局快捷键
            </label>
            <input
              type="text"
              value={settings.globalShortcut}
              disabled
              className="w-full px-4 py-2.5 bg-vibe-dark border border-vibe-border rounded-lg text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              按此快捷键显示/隐藏窗口（暂不支持修改）
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-vibe-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-vibe-accent hover:bg-vibe-accent/80 text-white rounded-lg transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}
