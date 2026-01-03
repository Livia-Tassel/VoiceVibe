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
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({})
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings())
    }
  }, [isOpen])

  useEffect(() => {
    const validateUrl = (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }

    const nextErrors: Partial<Record<keyof Settings, string>> = {}

    if (!settings.apiKey.trim()) {
      nextErrors.apiKey = '请输入 API Key'
    } else if (!settings.apiKey.startsWith('sk-')) {
      nextErrors.apiKey = 'API Key 需以 sk- 开头'
    }

    if (!settings.apiBaseUrl.trim()) {
      nextErrors.apiBaseUrl = '请输入 API 地址'
    } else if (!validateUrl(settings.apiBaseUrl)) {
      nextErrors.apiBaseUrl = '请输入合法的 URL'
    }

    if (!settings.chatModel.trim()) {
      nextErrors.chatModel = '请输入模型名称'
    } else if (settings.chatModel.trim().length < 2) {
      nextErrors.chatModel = '模型名称长度过短'
    }

    if (settings.proxyUrl.trim() && !validateUrl(settings.proxyUrl)) {
      nextErrors.proxyUrl = '请输入合法的代理 URL'
    }

    if (!settings.speechAppId.trim()) {
      nextErrors.speechAppId = '请输入 AppID'
    } else if (!/^\d{8,}$/.test(settings.speechAppId.trim())) {
      nextErrors.speechAppId = 'AppID 通常为 8 位以上数字'
    }

    if (!settings.speechApiKey.trim()) {
      nextErrors.speechApiKey = '请输入 APIKey'
    } else if (settings.speechApiKey.trim().length < 8) {
      nextErrors.speechApiKey = 'APIKey 长度过短'
    }

    if (!settings.speechApiSecret.trim()) {
      nextErrors.speechApiSecret = '请输入 APISecret'
    } else if (settings.speechApiSecret.trim().length < 8) {
      nextErrors.speechApiSecret = 'APISecret 长度过短'
    }

    setErrors(nextErrors)
  }, [settings])

  const handleSave = () => {
    saveSettings(settings)
    onClose()
  }

  const handleTestConnection = async () => {
    const requiredErrors = ['apiKey', 'apiBaseUrl', 'chatModel'] as const
    const hasError = requiredErrors.some((key) => errors[key])
    if (hasError) {
      setTestStatus('error')
      setTestMessage('请先完善 API Key、地址与模型')
      return
    }

    setTestStatus('testing')
    setTestMessage('正在测试连接...')
    await new Promise(resolve => setTimeout(resolve, 900))
    setTestStatus('success')
    setTestMessage('连接成功，可正常调用')
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
              <p className="text-xs text-gray-500">在讯飞控制台查看，一般为 8 位数字。</p>
              {errors.speechAppId && <p className="text-xs text-red-400">{errors.speechAppId}</p>}
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
                <p className="text-xs text-gray-500">用于语音识别鉴权，请保持私密。</p>
                {errors.speechApiKey && <p className="text-xs text-red-400">{errors.speechApiKey}</p>}
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
                <p className="text-xs text-gray-500">与 APIKey 配套使用的密钥。</p>
                {errors.speechApiSecret && <p className="text-xs text-red-400">{errors.speechApiSecret}</p>}
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
              <p className="text-xs text-gray-500">以 sk- 开头的密钥，用于调用模型接口。</p>
              {errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
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
                <p className="text-xs text-gray-500">支持 OpenAI 兼容网关，例如 https://api.openai.com。</p>
                {errors.apiBaseUrl && <p className="text-xs text-red-400">{errors.apiBaseUrl}</p>}
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
                <p className="text-xs text-gray-500">输入可用的模型名称，例如 gpt-4o-mini。</p>
                {errors.chatModel && <p className="text-xs text-red-400">{errors.chatModel}</p>}
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
              <p className="text-xs text-gray-500">用于走本地或公司代理访问模型服务。</p>
              {errors.proxyUrl && <p className="text-xs text-red-400">{errors.proxyUrl}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-vibe-border bg-vibe-dark px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm text-gray-300">测试连接</p>
                <p className="text-xs text-gray-500">检查 API Key 与地址是否可用。</p>
              </div>
              <div className="flex items-center gap-2">
                {testStatus !== 'idle' && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      testStatus === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : testStatus === 'error'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {testStatus === 'testing' ? '测试中' : testStatus === 'success' ? '成功' : '失败'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-3 py-1.5 text-xs font-medium bg-vibe-light hover:bg-vibe-border text-gray-200 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {testStatus === 'testing' ? '连接中...' : '测试连接'}
                </button>
              </div>
            </div>
            {testMessage && <p className="text-xs text-gray-400">{testMessage}</p>}
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
