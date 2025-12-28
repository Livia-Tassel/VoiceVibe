import { useEffect, useState } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 2000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: {
      bg: 'bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30',
      shadow: 'shadow-lg shadow-emerald-500/20',
      icon: <Check size={16} />,
    },
    error: {
      bg: 'bg-red-500/90 backdrop-blur-sm border border-red-400/30',
      shadow: 'shadow-lg shadow-red-500/20',
      icon: <AlertCircle size={16} />,
    },
  }

  const { bg, shadow, icon } = styles[type]

  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white transition-all duration-300 ${bg} ${shadow} ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <span className="p-1 rounded-full bg-white/20">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
