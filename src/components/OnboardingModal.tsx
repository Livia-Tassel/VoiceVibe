import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Settings, getSettings, saveSettings } from './SettingsModal'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [settings, setSettings] = useState<Settings>(getSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSpeechApiKey, setShowSpeechApiKey] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    if (step === 1) {
      saveSettings(settings)
    }
    setStep(step + 1)
  }

  const handleFinish = () => {
    localStorage.setItem('voicevibe-onboarded', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-vibe-800 border border-vibe-600/60 rounded-2xl shadow-card w-[480px] max-h-[85vh] overflow-hidden animate-scale-in">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center p-10 text-center">
            {/* CSS Illustration: mic -> arrow -> sparkles */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center animate-breathe">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <div className="flex items-center gap-1 text-vibe-400">
                <div className="w-6 h-0.5 bg-vibe-500 rounded" />
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center animate-breathe" style={{ animationDelay: '0.5s' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">欢迎使用 VoiceVibe</h2>
            <p className="text-sm text-vibe-300 font-body mb-8 leading-relaxed">
              语音输入，AI 优化，一键生成高质量编程 Prompt
            </p>
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-accent to-accent-light text-white font-medium shadow-glow hover:shadow-lg transition-all active:scale-[0.98]"
            >
              开始配置
            </button>
          </div>
        )}

        {/* Step 1: Configure APIs */}
        {step === 1 && (
          <div className="flex flex-col">
            <div className="px-6 py-4 border-b border-vibe-600/60">
              <h2 className="text-title text-white font-display">配置 API</h2>
              <p className="text-xs text-vibe-400 mt-0.5 font-body">填入必要的 API 信息以启用功能</p>
            </div>
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              {/* Xunfei */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-vibe-300 uppercase tracking-wide font-display">语音识别（讯飞）</h3>
                <input
                  type="text"
                  value={settings.speechAppId}
                  onChange={(e) => setSettings(prev => ({ ...prev, speechAppId: e.target.value }))}
                  placeholder="AppID（8位数字）"
                  className="w-full px-3 py-2 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type={showSpeechApiKey ? 'text' : 'password'}
                      value={settings.speechApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, speechApiKey: e.target.value }))}
                      placeholder="APIKey"
                      className="w-full px-3 py-2 pr-9 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSpeechApiKey(!showSpeechApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vibe-300 hover:text-white"
                    >
                      {showSpeechApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={settings.speechApiSecret}
                    onChange={(e) => setSettings(prev => ({ ...prev, speechApiSecret: e.target.value }))}
                    placeholder="APISecret"
                    className="w-full px-3 py-2 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Prompt API */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-vibe-300 uppercase tracking-wide font-display">Prompt 优化</h3>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="API Key（sk-...）"
                    className="w-full px-3 py-2 pr-9 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vibe-300 hover:text-white"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.apiBaseUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiBaseUrl: e.target.value }))}
                    placeholder="API 地址"
                    className="w-full px-3 py-2 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={settings.chatModel}
                    onChange={(e) => setSettings(prev => ({ ...prev, chatModel: e.target.value }))}
                    placeholder="模型名称"
                    className="w-full px-3 py-2 bg-vibe-900 border border-vibe-600 rounded-radius-lg text-white text-sm placeholder-vibe-400 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-vibe-600/60">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-accent to-accent-light text-white font-medium shadow-glow hover:shadow-lg transition-all active:scale-[0.98]"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Ready */}
        {step === 2 && (
          <div className="flex flex-col items-center p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success/20 to-teal/20 flex items-center justify-center mb-6 animate-breathe">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">一切就绪!</h2>
            <p className="text-sm text-vibe-300 font-body mb-6">以下快捷键帮助你更高效地使用</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm mb-8 text-sm font-body">
              <div className="flex justify-between items-center py-2 px-3 bg-vibe-900/60 rounded-lg">
                <span className="text-vibe-300">录音</span>
                <kbd className="kbd">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-vibe-900/60 rounded-lg">
                <span className="text-vibe-300">优化</span>
                <kbd className="kbd">⌥⌘T</kbd>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-vibe-900/60 rounded-lg">
                <span className="text-vibe-300">输入框</span>
                <kbd className="kbd">/</kbd>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-vibe-900/60 rounded-lg">
                <span className="text-vibe-300">输出框</span>
                <kbd className="kbd">?</kbd>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-teal to-teal-light text-white font-medium shadow-glow-teal hover:shadow-lg transition-all active:scale-[0.98]"
            >
              开始使用
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex justify-center gap-2 pb-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'bg-accent w-6'
                  : i < step
                    ? 'bg-success'
                    : 'bg-vibe-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
