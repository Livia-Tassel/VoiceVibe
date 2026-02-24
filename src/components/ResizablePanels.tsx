import { useState, useRef, useEffect, useCallback } from 'react'

interface ResizablePanelsProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  minLeftPercent?: number
  maxLeftPercent?: number
  defaultLeftPercent?: number
}

export function ResizablePanels({
  leftPanel,
  rightPanel,
  minLeftPercent = 25,
  maxLeftPercent = 75,
  defaultLeftPercent = 50,
}: ResizablePanelsProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const handleWidth = 12 // w-3 = 0.75rem = 12px

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      // Account for handle width: usable space is container width minus handle
      const usableWidth = rect.width - handleWidth
      const percent = (x / usableWidth) * 100
      setLeftPercent(Math.min(maxLeftPercent, Math.max(minLeftPercent, percent)))
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [minLeftPercent, maxLeftPercent])

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div
        className="h-full overflow-hidden panel-glass rounded-2xl panel-glow-accent animate-slide-in-left"
        style={{ width: `calc(${leftPercent}% - ${handleWidth / 2}px)` }}
      >
        {leftPanel}
      </div>
      <div
        className="resize-handle w-3 flex-shrink-0"
        onMouseDown={handleMouseDown}
      />
      <div
        className="h-full overflow-hidden panel-glass rounded-2xl panel-glow-teal animate-slide-in-right"
        style={{ width: `calc(${100 - leftPercent}% - ${handleWidth / 2}px)` }}
      >
        {rightPanel}
      </div>
    </div>
  )
}
