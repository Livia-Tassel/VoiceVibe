import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Keyboard } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface Settings {
  // Prompt 优化 API 配置
  apiKey: string
  apiBaseUrl: string
  chatModel: string
  proxyUrl: string
  // 语音识别 API 配置（讯飞）
  speechAppId: string
  speechApiKey: string
  speechApiSecret: string
  // 偏好设置
  autoCopy: boolean
  globalShortcut: string
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiBaseUrl: 'https://api.openai.com',
  chatModel: 'gpt-4o-mini',
  proxyUrl: '',
  speechAppId: '',
  speechApiKey: '',
  speechApiSecret: '',
  autoCopy: true,
  globalShortcut: 'Option+Command+P',
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
  const [showSpeechApiKey, setShowSpeechApiKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings())
    }
  }, [isOpen])

  const handleSave = () => {
    saveSettings(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-vibe-gray border border-vibe-border rounded-xl shadow-2xl w-[520px] max-h-[85vh] overflow-hidden">
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
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Speech API Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">语音识别 API（讯飞）</h3>
              <a
                href="https://console.xfyun.cn/services/iat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-vibe-accent hover:underline"
              >
                获取 API Key
              </a>
            </div>

            {/* AppID */}
            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400">AppID</label>
              <input
                type="text"
                value={settings.speechAppId}
                onChange={(e) => setSettings(prev => ({ ...prev, speechAppId: e.target.value }))}
                placeholder="12345678"
                className="w-full px-3 py-2 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
              />
            </div>

            {/* APIKey & APISecret */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400">APIKey</label>
                <div className="relative">
                  <input
                    type={showSpeechApiKey ? 'text' : 'password'}
                    value={settings.speechApiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, speechApiKey: e.target.value }))}
                    placeholder="xxxxxxxx"
                    className="w-full px-3 py-2 pr-10 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpeechApiKey(!showSpeechApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showSpeechApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400">APISecret</label>
                <input
                  type="password"
                  value={settings.speechApiSecret}
                  onChange={(e) => setSettings(prev => ({ ...prev, speechApiSecret: e.target.value }))}
                  placeholder="xxxxxxxx"
                  className="w-full px-3 py-2 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-vibe-border" />

          {/* Prompt API Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Prompt 优化 API</h3>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* API Base URL & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400">API 地址</label>
                <input
                  type="text"
                  value={settings.apiBaseUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiBaseUrl: e.target.value }))}
                  placeholder="https://api.openai.com"
                  className="w-full px-3 py-2 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400">模型</label>
                <input
                  type="text"
                  value={settings.chatModel}
                  onChange={(e) => setSettings(prev => ({ ...prev, chatModel: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  className="w-full px-3 py-2 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
                />
              </div>
            </div>

            {/* Proxy */}
            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400">代理地址（可选）</label>
              <input
                type="text"
                value={settings.proxyUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, proxyUrl: e.target.value }))}
                placeholder="http://127.0.0.1:7890"
                className="w-full px-3 py-2 bg-vibe-dark border border-vibe-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-vibe-accent"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-vibe-border" />

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">偏好设置</h3>

            {/* Auto Copy */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">优化后自动复制到剪贴板</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoCopy: !prev.autoCopy }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings.autoCopy ? 'bg-vibe-accent' : 'bg-vibe-light'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.autoCopy ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-vibe-border" />

          {/* Shortcuts Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <Keyboard size={14} />
              快捷键
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between items-center py-1.5 px-3 bg-vibe-dark rounded-lg">
                <span className="text-gray-400">显示/隐藏窗口</span>
                <kbd className="px-2 py-0.5 bg-vibe-light rounded text-xs text-gray-300">⌥⌘P</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-vibe-dark rounded-lg">
                <span className="text-gray-400">优化 Prompt</span>
                <kbd className="px-2 py-0.5 bg-vibe-light rounded text-xs text-gray-300">⌥⌘T</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-vibe-dark rounded-lg">
                <span className="text-gray-400">聚焦输入框</span>
                <kbd className="px-2 py-0.5 bg-vibe-light rounded text-xs text-gray-300">/</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-vibe-dark rounded-lg">
                <span className="text-gray-400">聚焦输出框</span>
                <kbd className="px-2 py-0.5 bg-vibe-light rounded text-xs text-gray-300">?</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-vibe-dark rounded-lg col-span-2">
                <span className="text-gray-400">开始/停止录音</span>
                <kbd className="px-2 py-0.5 bg-vibe-light rounded text-xs text-gray-300">Space</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-vibe-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-vibe-accent hover:bg-vibe-accent/80 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
